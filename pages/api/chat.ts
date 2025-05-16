import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ApiResponse } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, topic, personality, responseLength } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    const userMessage = lastUserMessage.content;

    // Crisis detection for potentially harmful messages
    const crisisKeywords = ["chci se zabít", "nechci žít", "ukončit život", "sebevražda", "zabít se"];
    const isCrisisMessage = crisisKeywords.some(keyword =>
      userMessage.toLowerCase().includes(keyword)
    );

    if (isCrisisMessage) {
      return res.status(200).json({
        role: 'assistant',
        content: "Je mi moc líto, že se takhle cítíš. Nejsi na to sám – doporučuji zavolat na Linku první psychické pomoci (📞 116 123) nebo Linku bezpečí (📞 116 111). Mluvím s tebou dál, ale bezpečí je teď nejdůležitější.",
        isCrisis: true
      });
    }

    // Prepare system message with instructions based on settings
    let systemPrompt = `
Jsi empatický psycholog, který mluví česky a pomáhá lidem s jejich psychickými problémy. 
Tvé odpovědi jsou vždy:
- Empatické a chápavé
- Konkrétní a relevantní k tomu, co klient sdílí
- Autentické a různorodé (nikdy se neopakuješ)
- Přizpůsobené individuálním potřebám klienta

Vyhýbáš se:
- Diagnostikování (nejsi lékař)
- Generickým odpovědím, které by mohly platit pro kohokoliv
- Opakování stejných frází nebo struktur v odpovědích
- Přílišnému teoretizování

Tvým cílem je pomoci klientovi cítit se vyslyšený a podpořený, nabídnout praktické techniky a strategie, a povzbudit ho k pozitivním krokům.
`;

    // Add topic context if selected
    if (topic) {
      const topicContexts = {
        anxiety: `Specializuješ se na léčbu úzkosti a úzkostných poruch. 
Nabízíš konkrétní techniky jako:
- Hluboké břišní dýchání (nádech na 4 doby, zadržení na 2 doby, výdech na 6 dob)
- Progresivní svalovou relaxaci (postupné napínání a uvolňování svalových skupin)
- Mindfulness cvičení (zaměření na přítomný okamžik a smyslové vjemy)
- Kognitivní restrukturalizaci (identifikace a změna negativních myšlenkových vzorců)
- Expozici (postupné vystavování se obávaným situacím v bezpečném prostředí)`,

        relationships: `Specializuješ se na vztahové poradenství. 
Pomáháš s:
- Efektivní komunikací (aktivní naslouchání, "já" výroky, reflektivní naslouchání)
- Řešením konfliktů (hledání kompromisů, win-win řešení)
- Budováním zdravých hranic
- Posilováním intimity a důvěry
- Rozpoznáváním toxických vzorců ve vztazích`,

        depression: `Specializuješ se na podporu lidí s depresí. 
Nabízíš:
- Empatické naslouchání bez hodnocení
- Techniky pro aktivaci chování (plánování příjemných aktivit)
- Strategie pro překonávání negativního myšlení
- Podporu v budování rutiny a struktury dne
- Povzbuzení k vyhledání sociální podpory`,

        stress: `Specializuješ se na zvládání stresu. 
Nabízíš techniky jako:
- Časový management (metoda Pomodoro, prioritizace úkolů)
- Relaxační techniky (progresivní svalová relaxace, vizualizace)
- Mindfulness a meditace
- Zdravý životní styl (spánek, výživa, pohyb)
- Stanovení hranic v práci i osobním životě`,

        selfEsteem: `Specializuješ se na budování zdravého sebevědomí. 
Pomáháš:
- Identifikovat a zpochybňovat negativní vnitřní dialog
- Rozpoznávat osobní silné stránky a úspěchy
- Stanovovat realistické cíle a oceňovat pokrok
- Praktikovat sebelásku a sebepřijetí
- Rozvíjet asertivitu a schopnost říkat "ne"`
      };

      systemPrompt += `\n\n${topicContexts[topic as keyof typeof topicContexts] || ''}`;
    }

    // Add personality context if selected
    if (personality) {
      const personalityContexts = {
        supportive: `Tvůj přístup je velmi empatický a podporující. 
- Aktivně nasloucháš a validuješ pocity klienta
- Používáš věty jako "Chápu, že to musí být těžké" nebo "Je naprosto pochopitelné, že se tak cítíš"
- Vyjadřuješ bezpodmínečné přijetí
- Zdůrazňuješ klientovy silné stránky a pokroky`,

        practical: `Tvůj přístup je praktický a zaměřený na řešení. 
- Nabízíš konkrétní kroky a strategie
- Pomáháš rozdělit problémy na zvládnutelné části
- Zaměřuješ se na "co funguje" a "co můžeme udělat teď"
- Používáš příklady a metafory pro ilustraci řešení`,

        analytical: `Tvůj přístup je analytický. 
- Pomáháš klientovi prozkoumat hlubší příčiny problémů
- Identifikuješ vzorce v myšlení, emocích a chování
- Pokládáš otázky, které vedou k hlubšímu porozumění
- Propojuješ současné problémy s minulými zkušenostmi`,

        mentor: `Vystupuješ jako mentor a průvodce. 
- Sdílíš moudrost a podporuješ osobní rozvoj
- Nabízíš perspektivu a vhled
- Povzbuzuješ k reflexi a sebepoznání
- Pomáháš klientovi najít vlastní odpovědi`,

        coach: `Vystupuješ jako kouč. 
- Motivuješ klienta k dosahování cílů
- Zaměřuješ se na budoucnost a možnosti
- Pomáháš stanovit konkrétní, měřitelné a dosažitelné cíle
- Podporuješ klienta v překonávání překážek`,

        mediator: `Vystupuješ jako mediátor. 
- Pomáháš najít střední cestu a řešit konflikty konstruktivně
- Nabízíš nestranný pohled na situaci
- Podporuješ vzájemné porozumění a respekt
- Hledáš řešení výhodná pro všechny strany`
      };

      systemPrompt += `\n\n${personalityContexts[personality as keyof typeof personalityContexts] || ''}`;
    }

    // Add response length context
    if (responseLength) {
      const lengthContexts = {
        short: 'Tvé odpovědi jsou stručné a výstižné, obvykle 2-3 věty.',
        medium: 'Tvé odpovědi jsou přiměřeně dlouhé, obvykle 1-2 odstavce.',
        long: 'Tvé odpovědi jsou podrobné a důkladné, obvykle 2-3 odstavce s konkrétními příklady a vysvětleními.'
      };

      systemPrompt += `\n\n${lengthContexts[responseLength as keyof typeof lengthContexts] || ''}`;
    }

    // Add general guidelines
    systemPrompt += `\n\nNikdy nediagnostikuješ, pouze nabízíš podporu a techniky pro zvládání obtíží. Vždy respektuješ hranice klienta a zdůrazňuješ, že v případě vážných problémů by měl vyhledat odbornou pomoc.`;

    // Get the Gemini API key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Server configuration error', content: 'Omlouvám se, nastala chyba v konfiguraci serveru.' });
    }

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    // Format conversation for Gemini API
    // First message is always the system prompt
    const formattedMessages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'Rozumím. Budu empatický psycholog, který mluví česky a pomáhá lidem s jejich psychickými problémy. Budu se řídit všemi uvedenými pokyny.' }]
      }
    ];

    // Add the actual conversation messages (excluding system messages)
    // Use all messages for better context, not just the last 3
    const conversationMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    // Combine system prompt exchange with conversation messages
    const allMessages = [...formattedMessages, ...conversationMessages];

    const startTime = Date.now();

    // Log the request for debugging
    console.log('Gemini API Request:', JSON.stringify({
      contents: allMessages,
      generationConfig: {
        temperature: 0.8, // Slightly higher temperature for more varied responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024 // Increased token limit for more detailed responses
      }
    }, null, 2));

    // Make the actual API call to Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: allMessages,
        generationConfig: {
          temperature: 0.8, // Slightly higher temperature for more varied responses
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024 // Increased token limit for more detailed responses
        }
      })
    });

    const data = await response.json();

    // Log the response for debugging
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    // Handle potential API errors
    if (data.error) {
      console.error('Gemini API error:', data.error);
      return res.status(500).json({
        error: 'AI service error',
        content: 'Omlouvám se, nastala chyba při komunikaci s AI službou. Zkuste to prosím znovu za chvíli.'
      });
    }

    // Extract the response content
    const responseContent = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Omlouvám se, momentálně nedokážu odpovědět. Zkuste to prosím znovu za chvíli.";

    // Calculate processing time
    const processingTime = (Date.now() - startTime) / 1000;

    // Estimate reading time (very simple calculation)
    const estimatedReadingTime = Math.ceil(responseContent.length / 1000 * 60 / 200); // ~200 words per minute

    // Return the response
    return res.status(200).json({
      role: 'assistant',
      content: responseContent,
      estimatedReadingTime
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ error: 'Internal server error', content: 'Omlouvám se, nastala chyba při zpracování vaší zprávy.' });
  }
}
