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

    // In a real application this would call the Gemini API using the API key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Server configuration error', content: 'Omlouvám se, nastala chyba v konfiguraci serveru.' });
    }

    // Here you would make the actual API call to Gemini
    // Example of how the Gemini API call might look:
    /*
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          ...messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }]
          }))
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();
    const responseContent = data.candidates[0].content.parts[0].text;
    */

    // For now we'll simulate a response
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a simple response based on the user's message
    let responseContent = '';
    const userMessage = lastUserMessage.content.toLowerCase();

    if (userMessage.includes('ahoj') || userMessage.includes('dobrý den') || userMessage.includes('zdravím')) {
      responseContent = 'Dobrý den! Jsem tu, abych vám pomohl. Jak se dnes cítíte?';
    } else if (userMessage.includes('úzkost') || userMessage.includes('strach') || userMessage.includes('nervozita')) {
      responseContent = 'Je pochopitelné, že prožíváte úzkost. Mnoho lidí se s tím potýká. Můžete mi říci více o situacích, které ve vás vyvolávají tyto pocity? Společně můžeme najít strategie, jak s úzkostí lépe pracovat.';
    } else if (userMessage.includes('deprese') || userMessage.includes('smutek') || userMessage.includes('beznaděj')) {
      responseContent = 'Je mi líto, že se cítíte takhle. Depresivní pocity mohou být velmi těžké. Je důležité vědět, že nejste sami a existují způsoby, jak tyto pocity zmírnit. Můžeme o tom mluvit více?';
    } else if (userMessage.includes('vztah') || userMessage.includes('partner') || userMessage.includes('rodina')) {
      responseContent = 'Vztahy jsou důležitou součástí našeho života a mohou být zdrojem radosti i výzev. Můžete mi říci více o tom, co konkrétně ve vašem vztahu prožíváte?';
    } else if (userMessage.includes('stres') || userMessage.includes('přetížení') || userMessage.includes('tlak')) {
      responseContent = 'Stres může být velmi náročný. Je důležité najít způsoby, jak se pravidelně uvolnit a dobít energii. Máte nějaké aktivity, které vám pomáhají se uvolnit?';
    } else if (userMessage.includes('sebevědomí') || userMessage.includes('nejistota') || userMessage.includes('pochybnosti')) {
      responseContent = 'Pochybnosti o sobě samém jsou běžnou součástí lidské zkušenosti. Pracovat na zdravém sebevědomí je celoživotní proces. Můžeme společně prozkoumat, co ovlivňuje vaše sebevnímání.';
    } else {
      responseContent = 'Děkuji, že se se mnou dělíte o své myšlenky. Můžete mi říci více o tom, co vás přivádí k našemu rozhovoru a jak vám mohu být nápomocen?';
    }

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
