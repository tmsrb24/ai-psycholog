import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ApiResponse } from '../../types';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string, content?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('API route called with body:', JSON.stringify(req.body, null, 2));
    
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
    console.log('Last user message:', userMessage);

    // Crisis detection for potentially harmful messages
    const crisisKeywords = ["chci se zabít", "nechci žít", "ukončit život", "sebevražda", "zabít se"];
    const isCrisisMessage = crisisKeywords.some(keyword =>
      userMessage.toLowerCase().includes(keyword)
    );

    if (isCrisisMessage) {
      console.log('Crisis message detected');
      return res.status(200).json({
        role: 'assistant',
        content: "Je mi moc líto, že se takhle cítíš. Nejsi na to sám – doporučuji zavolat na Linku první psychické pomoci (📞 116 123) nebo Linku bezpečí (📞 116 111). Mluvím s tebou dál, ale bezpečí je teď nejdůležitější.",
        isCrisis: true
      });
    }

    // For testing, always return a simulated response
    // This will help us determine if the issue is with the API call or something else
    return res.status(200).json({
      role: 'assistant',
      content: `Dobrý den! Jsem tu, abych vám pomohl. Jak se dnes cítíte? (Toto je testovací odpověď)`,
      estimatedReadingTime: 3
    });

    /* Commenting out the actual API call for now to test if the endpoint works at all
    // Prepare system message with instructions based on settings
    let systemPrompt = `Jsi empatický psycholog, který mluví česky a pomáhá lidem s jejich psychickými problémy.`;

    // Add topic context if selected
    if (topic) {
      systemPrompt += ` Specializuješ se na téma: ${topic}.`;
    }

    // Add personality context if selected
    if (personality) {
      systemPrompt += ` Tvůj přístup je: ${personality}.`;
    }

    // Add response length context
    if (responseLength) {
      systemPrompt += ` Tvé odpovědi jsou: ${responseLength}.`;
    }

    console.log('System prompt:', systemPrompt);

    // Get the Gemini API key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      
      // For testing, return a simulated response
      console.log('Returning simulated response due to missing API key');
      return res.status(200).json({
        role: 'assistant',
        content: `Dobrý den! Jsem tu, abych vám pomohl. Jak se dnes cítíte? (Toto je simulovaná odpověď, protože API klíč není nastaven)`,
        estimatedReadingTime: 3
      });
    }

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    // Simplify the message format for Gemini API
    const formattedMessages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'Rozumím. Budu empatický psycholog, který mluví česky.' }]
      }
    ];

    // Add the user's message
    formattedMessages.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    console.log('Formatted messages for Gemini API:', JSON.stringify(formattedMessages, null, 2));

    try {
      console.log('Making API call to Gemini');
      // Make the API call to Gemini using axios instead of fetch
      const response = await axios({
        method: 'post',
        url: `${GEMINI_API_URL}?key=${geminiApiKey}`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          contents: formattedMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800
          }
        }
      });

      const data = response.data;
      console.log('Gemini API response:', JSON.stringify(data, null, 2));

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

      console.log('Response content:', responseContent);

      // Return the response
      return res.status(200).json({
        role: 'assistant',
        content: responseContent,
        estimatedReadingTime: Math.ceil(responseContent.length / 1000 * 60 / 200) // ~200 words per minute
      });
    } catch (apiError: any) {
      console.error('Error calling Gemini API:', apiError);
      
      // Return a fallback response for testing
      return res.status(200).json({
        role: 'assistant',
        content: `Omlouvám se, ale momentálně mám problém s připojením k AI službě. Zkuste to prosím znovu za chvíli. (Chyba: ${apiError?.message || 'Neznámá chyba'})`,
        estimatedReadingTime: 3
      });
    }
    */

  } catch (error: any) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      content: `Omlouvám se, nastala chyba při zpracování vaší zprávy. (Chyba: ${error?.message || 'Neznámá chyba'})`
    });
  }
}
