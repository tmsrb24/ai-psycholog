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
    let systemPrompt = 'Jsi empatický psycholog který mluví česky. ';

    // Add topic context if selected
    if (topic) {
      const topicContexts = {
        anxiety: 'Specializuješ se na léčbu úzkosti a úzkostných poruch. Nabízíš techniky pro zvládání úzkosti jako je hluboké dýchání mindfulness a kognitivně-behaviorální přístupy.',
        relationships: 'Specializuješ se na vztahové poradenství. Pomáháš s komunikací řešením konfliktů a budováním zdravých vztahů.',
        depression: 'Specializuješ se na podporu lidí s depresí. Nabízíš empatické naslouchání a techniky pro zvládání depresivních stavů.',
        stress: 'Specializuješ se na zvládání stresu. Nabízíš techniky pro relaxaci time management a zdravý životní styl.',
        selfEsteem: 'Specializuješ se na budování zdravého sebevědomí. Pomáháš identifikovat negativní vzorce myšlení a rozvíjet pozitivní sebehodnocení.'
      };

      systemPrompt += topicContexts[topic as keyof typeof topicContexts] || '';
    }

    // Add personality context if selected
    if (personality) {
      const personalityContexts = {
        supportive: 'Tvůj přístup je velmi empatický a podporující. Aktivně nasloucháš a validuješ pocity klienta.',
        practical: 'Tvůj přístup je praktický a zaměřený na řešení. Nabízíš konkrétní kroky a strategie.',
        analytical: 'Tvůj přístup je analytický. Pomáháš klientovi prozkoumat hlubší příčiny problémů a vzorce chování.',
        mentor: 'Vystupuješ jako mentor a průvodce. Sdílíš moudrost a podporuješ osobní rozvoj.',
        coach: 'Vystupuješ jako kouč. Motivuješ klienta k dosahování cílů a překonávání překážek.',
        mediator: 'Vystupuješ jako mediátor. Pomáháš najít střední cestu a řešit konflikty konstruktivně.'
      };

      systemPrompt += personalityContexts[personality as keyof typeof personalityContexts] || '';
    }

    // Add response length context
    if (responseLength) {
      const lengthContexts = {
        short: 'Tvé odpovědi jsou stručné a výstižné obvykle 2-3 věty.',
        medium: 'Tvé odpovědi jsou přiměřeně dlouhé obvykle 1-2 odstavce.',
        long: 'Tvé odpovědi jsou podrobné a důkladné obvykle 2-3 odstavce.'
      };

      systemPrompt += lengthContexts[responseLength as keyof typeof lengthContexts] || '';
    }

    // Add general guidelines
    systemPrompt += ' Nikdy nediagnostikuješ pouze nabízíš podporu a techniky pro zvládání obtíží. Vždy respektuješ hranice klienta a zdůrazňuješ že v případě vážných problémů by měl vyhledat odbornou pomoc.';

    // Get the Gemini API key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Server configuration error', content: 'Omlouvám se, nastala chyba v konfiguraci serveru.' });
    }

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    // Prepare context for the API call (last 3 messages for context)
    const contextMessages = messages.slice(-3).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Add system prompt as a user message at the beginning if it's not already included
    if (!contextMessages.some(msg => msg.parts[0].text.includes(systemPrompt))) {
      contextMessages.unshift({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
    }

    const startTime = Date.now();

    // Make the actual API call to Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contextMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 800
        }
      })
    });

    const data = await response.json();
    
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
