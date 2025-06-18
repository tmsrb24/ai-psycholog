import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ApiResponse } from '../../types/chat'; // Použijeme existující typy
import axios from 'axios';
import { validateAIResponse, AIResponseValidationResult } from '../../lib/responseValidation'; // Added import

// RAG a Supabase zde pravděpodobně nebudeme potřebovat, pokud to má být jednoduchý FAQ bot

// Systémový prompt pro FAQ/info bota
const SYSTEM_PROMPT_WIDGET = `
Jsi AI asistent webu Psychollog.cz. Tvým úkolem je odpovídat na otázky týkající se funkcí webu,
cenových plánů, GDPR, zabezpečení a dalších obecných informací o platformě.
NEPOSKYTUJ psychologické poradenství ani se nepokoušej diagnostikovat.
Pokud se uživatel ptá na osobní problémy nebo hledá psychologickou pomoc,
odkaž ho na hlavní chat s AI psychologem nebo na stránku s kontakty na krizové linky.
Odpovídej stručně a k věci.

Informace o webu Psychollog.cz:
- Účel: Poskytování AI psychologické podpory, deníku a nástrojů pro sebepoznání.
- Funkce: AI Chat, Osobní Deník, Analýza nálady, Gamifikace, Nastavení profilu.
- Ceník: Existuje bezplatný plán 'Základní' s omezeními a placené plány 'Premium' a 'Ultra' s více funkcemi. Detaily jsou na stránce /pricing.
- GDPR a Zabezpečení: Informace jsou na stránce /gdpr. Web používá HTTPS, OAuth, RLS, šifrované emaily, JWT.
- Kontakt: Pro obecné dotazy je kontaktní formulář na /kontakt. Pro dotazy na bezpečnost security@psychollog.cz, pro soukromí privacy@psychollog.cz.
- Registrace: Přes Google účet.
- Technologie: Next.js, Supabase, Vercel, SendGrid, Gemini AI.

Příklad otázek, na které můžeš odpovídat:
- "Jak funguje deník?"
- "Je chat anonymní?"
- "Kolik stojí premium plán?"
- "Jaké údaje o mně sbíráte?"
- "Mohu smazat svůj účet?"
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string }> // Zjednodušená odpověď
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as { messages: Message[] };
  const userMessages: Message[] = body.messages;

  if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error("API /api/widget-chat - GEMINI_API_KEY is not set.");
    return res.status(500).json({ error: 'Chyba konfigurace serveru (chybí API klíč).', role: 'assistant', content: 'Omlouvám se, služba není správně nakonfigurována.' });
  }

  const formattedMessagesForGemini: any[] = [{ role: 'user', parts: [{ text: SYSTEM_PROMPT_WIDGET }] }];
  formattedMessagesForGemini.push({ role: 'model', parts: [{ text: 'Rozumím, jsem připraven odpovídat na otázky o webu Psychollog.cz.' }] });
  
  userMessages.filter(m => m.role === 'user' || m.role === 'assistant').forEach(msg => {
    formattedMessagesForGemini.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  });
  
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

  try {
    const response = await axios({
      method: 'post',
      url: `${GEMINI_API_URL}?key=${geminiApiKey}`,
      headers: { 'Content-Type': 'application/json' },
      data: {
        contents: formattedMessagesForGemini,
        generationConfig: {
          temperature: 0.5, 
          topK: 30,
          topP: 0.90,
          maxOutputTokens: 200, 
        },
      },
    });

    const geminiData = response.data;
    if (geminiData.error) {
      throw new Error(geminiData.error.message || 'Gemini API error');
    }
    
    let responseContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, na tuto otázku momentálně nedokážu odpovědět.";

    // Validate AI response
    const validationResult = validateAIResponse(responseContent);
    if (!validationResult.isValid) {
      console.warn(`AI Response Validation Failed (widget-chat): ${validationResult.issue}. Original: "${responseContent}". Suggestion: "${validationResult.suggestion}"`);
      responseContent = validationResult.suggestion || "Omlouvám se, došlo k interní chybě. Zkuste to prosím znovu.";
    }

    return res.status(200).json({
      role: 'assistant',
      content: responseContent,
    });

  } catch (apiError: any) {
    console.error('API /api/widget-chat - Error calling Gemini API:', apiError.response?.data || apiError.message);
    const errorContent = `Omlouvám se, došlo k chybě při zpracování vašeho dotazu. (Chyba: ${apiError?.message || 'Neznámá chyba'})`;
    return res.status(500).json({ role: 'assistant', content: errorContent, error: 'Gemini API call failed' });
  }
}
