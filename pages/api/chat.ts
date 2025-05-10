import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

// Krizová slova pro detekci
const CRISIS_KEYWORDS = [
  'sebevražda', 'sebevražedný', 'zabít se', 'ukončit život', 'nechci žít',
  'nemá smysl žít', 'chci umřít', 'chci zemřít', 'předávkování', 'předávkovat se',
  'ubližuji si', 'sebepoškozování', 'řezání', 'řežu se', 'ubližuju si'
];

// Krizové linky a zdroje pomoci
const CRISIS_RESOURCES = `
**Potřebujete okamžitou pomoc?**

- **Linka bezpečí**: 116 111 (nonstop, zdarma)
- **Linka první psychické pomoci**: 116 123 (nonstop, zdarma)
- **Pražská linka důvěry**: 222 580 697 (nonstop)
- **Centrum krizové intervence**: 284 016 666 (nonstop)

V případě akutního ohrožení života volejte 155 nebo 112.

Tyto služby jsou zde pro vás 24 hodin denně a poskytují okamžitou podporu.
`;

// Funkce pro detekci krizových slov
function detectCrisis(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Definice typů pro témata a osobnosti
type TopicKey = 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem';
type PersonalityKey = 'supportive' | 'practical' | 'analytical';

interface TopicInfo {
  title: string;
  description: string;
  systemPrompt: string;
}

interface PersonalityInfo {
  title: string;
  description: string;
  systemPrompt: string;
}

// Témata a průvodci
const TOPICS: Record<TopicKey, TopicInfo> = {
  anxiety: {
    title: 'Úzkost',
    description: 'Průvodce pro zvládání úzkosti a úzkostných stavů',
    systemPrompt: 'Jsi empatický český psycholog specializující se na úzkostné poruchy. Poskytuj klidné, praktické a vědecky podložené rady pro zvládání úzkosti. Používej techniky jako je kognitivně-behaviorální terapie, mindfulness a dechová cvičení. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  },
  relationships: {
    title: 'Vztahy',
    description: 'Průvodce pro řešení vztahových problémů',
    systemPrompt: 'Jsi empatický český psycholog specializující se na vztahovou terapii. Poskytuj vyvážené, nestranné a praktické rady pro zlepšení komunikace a řešení vztahových problémů. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  },
  depression: {
    title: 'Deprese',
    description: 'Průvodce pro zvládání depresivních stavů',
    systemPrompt: 'Jsi empatický český psycholog specializující se na depresi. Poskytuj podporující, chápavé a praktické rady pro zvládání depresivních stavů. Zdůrazňuj důležitost odborné pomoci. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  },
  stress: {
    title: 'Stres',
    description: 'Průvodce pro zvládání stresu',
    systemPrompt: 'Jsi empatický český psycholog specializující se na zvládání stresu. Poskytuj praktické techniky pro redukci stresu, time management a work-life balance. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  },
  selfEsteem: {
    title: 'Sebevědomí',
    description: 'Průvodce pro budování zdravého sebevědomí',
    systemPrompt: 'Jsi empatický český psycholog specializující se na budování sebevědomí a sebehodnoty. Poskytuj podporující a praktické rady pro zlepšení sebeobrazu a překonání negativního vnitřního dialogu. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  }
};

// Typy osobností asistentů
const PERSONALITIES: Record<PersonalityKey, PersonalityInfo> = {
  supportive: {
    title: 'Podporující',
    description: 'Empatický a chápavý přístup',
    systemPrompt: 'Jsi velmi empatický a podporující český psycholog. Tvůj přístup je laskavý, trpělivý a plný porozumění. Používáš hodně povzbuzujících slov a ujištění. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  },
  practical: {
    title: 'Praktický',
    description: 'Zaměřený na konkrétní řešení',
    systemPrompt: 'Jsi prakticky zaměřený český psycholog. Tvůj přístup je strukturovaný, konkrétní a orientovaný na řešení. Nabízíš jasné kroky a strategie. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  },
  analytical: {
    title: 'Analytický',
    description: 'Hloubkový a reflektivní přístup',
    systemPrompt: 'Jsi analyticky zaměřený český psycholog. Tvůj přístup je hloubkový, reflektivní a zaměřený na porozumění příčinám. Pomáháš s vhledem a sebereflexí. Mluv přirozenou, srozumitelnou češtinou. Nikdy nediagnostikuj.'
  }
};

// Výchozí systémová zpráva
const DEFAULT_SYSTEM_PROMPT = 'Jsi empatický český psycholog. Odpovídej klidně, srozumitelně a přirozenou češtinou. Poskytuj podporu a praktické rady založené na vědeckých poznatcích. Nikdy nediagnostikuj. Pokud uživatel zmíní myšlenky na sebepoškozování nebo sebevraždu, jemně ho nasměruj na odbornou pomoc.';

// Typy pro požadavek a odpověď
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Typy pro Anthropic API
type AnthropicRole = 'user' | 'assistant';

interface AnthropicMessage {
  role: AnthropicRole;
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  topic?: string;
  personality?: string;
  saveHistory?: boolean;
}

interface ChatResponse {
  role: 'assistant';
  content: string;
  isCrisis?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatResponse>) {
  // Získání dat z požadavku
  const { messages, topic, personality, saveHistory } = req.body as ChatRequest;
  
  // API klíč z proměnných prostředí nebo hardcoded pro testovací účely
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY || "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";

  // Inicializace Anthropic klienta
  const anthropic = new Anthropic({
    apiKey: anthropicApiKey,
  });

  try {
    // Kontrola poslední zprávy uživatele na krizová slova
    const lastUserMessage = messages.find((msg) => msg.role === 'user');
    if (lastUserMessage && detectCrisis(lastUserMessage.content)) {
      return res.status(200).json({ 
        role: 'assistant', 
        content: `Děkuji za vaši upřímnost. Zdá se, že procházíte velmi náročným obdobím. Chtěl bych vám připomenout, že jako AI asistent vám mohu poskytnout podporu, ale v situacích, kdy se cítíte v ohrožení, je důležité kontaktovat odborníky, kteří vám mohou okamžitě pomoci.\n\n${CRISIS_RESOURCES}\n\nJsem tu pro vás a můžeme pokračovat v rozhovoru, ale prosím, zvažte kontaktování některé z těchto služeb pro okamžitou podporu.`,
        isCrisis: true
      });
    }

    // Výběr systémové zprávy podle tématu nebo osobnosti
    let systemPrompt = DEFAULT_SYSTEM_PROMPT;
    if (topic && Object.keys(TOPICS).includes(topic as TopicKey)) {
      systemPrompt = TOPICS[topic as TopicKey].systemPrompt;
    } else if (personality && Object.keys(PERSONALITIES).includes(personality as PersonalityKey)) {
      systemPrompt = PERSONALITIES[personality as PersonalityKey].systemPrompt;
    }

    // Příprava zpráv pro Anthropic API
    // Anthropic API nepodporuje přímo "system" zprávy, proto je přidáme jako instrukce do první zprávy uživatele
    const anthropicMessages: AnthropicMessage[] = [];
    
    // Filtrujeme zprávy, které nejsou systémové
    const userMessages = messages.filter((msg) => msg.role !== 'system');
    
    // Přidáme zprávy ve správném formátu pro Anthropic API
    for (let i = 0; i < userMessages.length; i++) {
      const msg = userMessages[i];
      if (msg.role === 'user' || msg.role === 'assistant') {
        anthropicMessages.push({
          role: msg.role as AnthropicRole,
          content: msg.content
        });
      }
    }
    
    // Pokud nemáme žádné zprávy, přidáme prázdnou zprávu uživatele
    if (anthropicMessages.length === 0) {
      anthropicMessages.push({
        role: 'user',
        content: 'Ahoj'
      });
    }
    
    // Přidáme systémový prompt do první zprávy uživatele, pokud existuje
    if (anthropicMessages[0].role === 'user') {
      // Přidáme systémový prompt na začátek první zprávy uživatele
      anthropicMessages[0].content = `${systemPrompt}\n\n${anthropicMessages[0].content}`;
    } else if (anthropicMessages.length > 0) {
      // Pokud první zpráva není od uživatele, přidáme novou zprávu na začátek
      anthropicMessages.unshift({
        role: 'user',
        content: systemPrompt
      });
    }

    // Volání Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: anthropicMessages,
      system: systemPrompt, // Použijeme také system parametr, který Claude podporuje
    });

    // Zpracování odpovědi
    if (response && response.content && response.content.length > 0) {
      // Uložení historie, pokud je požadováno
      if (saveHistory) {
        // Zde by byl kód pro ukládání historie do databáze
        // Pro jednoduchost nyní vynecháno
      }

      // Získání textu z odpovědi
      let responseText = '';
      if (response.content[0].type === 'text') {
        responseText = response.content[0].text;
      } else {
        responseText = 'Omlouvám se, ale nemohu zpracovat odpověď v tomto formátu.';
      }

      return res.status(200).json({ 
        role: 'assistant', 
        content: responseText
      });
    } else {
      throw new Error('Prázdná odpověď od Anthropic API');
    }
  } catch (error) {
    console.error('Chyba při komunikaci s Anthropic API:', error);
    return res.status(500).json({ 
      role: 'assistant', 
      content: 'Omlouvám se, nastala chyba při zpracování vaší zprávy. Zkuste to prosím znovu za chvíli.' 
    });
  }
}
