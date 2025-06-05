import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ApiResponse, UserProfileData } from '../../types';
import axios from 'axios';
import { ragService, initializeRagWithSamples } from '../../lib/rag';
import { getSupabaseAdmin } from '../../lib/supabaseClient';
import { getToken } from "next-auth/jwt";
import { validateAIResponse, AIResponseValidationResult } from '../../lib/responseValidation';

let ragInitialized = false;
const initializeRag = async () => {
  if (!ragInitialized) {
    await initializeRagWithSamples();
    ragInitialized = true;
  }
};

// Definice typů pro témata a osobnosti (klíčů)
type TopicKey = 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | 'general';
type PersonalityKey = 'supportive' | 'practical' | 'analytical' | 'neutral';

// Detailní systémové prompty pro témata
const TOPIC_PROMPTS: Record<TopicKey, string> = {
  general: "Zaměřuješ se na obecnou psychologickou pohodu a osobní rozvoj.",
  anxiety: "Specializuješ se na úzkostné poruchy. Poskytuj klidné, praktické a vědecky podložené rady pro zvládání úzkosti. Využívej techniky jako je kognitivně-behaviorální terapie, mindfulness a dechová cvičení.",
  relationships: "Specializuješ se na vztahovou terapii. Poskytuj vyvážené, nestranné a praktické rady pro zlepšení komunikace a řešení vztahových problémů.",
  depression: "Specializuješ se na depresi. Poskytuj podporující, chápavé a praktické rady pro zvládání depresivních stavů. Zdůrazňuj důležitost odborné pomoci.",
  stress: "Specializuješ se na zvládání stresu. Poskytuj praktické techniky pro redukci stresu, time management a work-life balance.",
  selfEsteem: "Specializuješ se na budování sebevědomí a sebehodnoty. Poskytuj podporující a praktické rady pro zlepšení sebeobrazu a překonání negativního vnitřního dialogu."
};

// Detailní systémové prompty pro osobnosti
const PERSONALITY_PROMPTS: Record<PersonalityKey, string> = {
  neutral: "Tvůj tón je neutrální, vyvážený a objektivní.",
  supportive: "Tvůj přístup je velmi empatický, laskavý, trpělivý a plný porozumění. Používáš hodně povzbuzujících slov a ujištění. Snaž se navodit pocit bezpečí a důvěry.",
  practical: "Tvůj přístup je strukturovaný, konkrétní a orientovaný na řešení. Nabízíš jasné kroky, strategie a praktické tipy. Jsi přímý, ale stále citlivý.",
  analytical: "Tvůj přístup je hloubkový, reflektivní a zaměřený na porozumění příčinám a souvislostem. Pomáháš s vhledem a sebereflexí, kladeš podnětné otázky."
};


type ChatHistoryResponse = { sessionId: string | null; messages: Message[] } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string; content?: string; sessionId?: string } | ChatHistoryResponse>
) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  if (!token || !token.sub) {
    console.error("API /api/chat - Unauthorized: No token or sub in token. Token:", JSON.stringify(token, null, 2));
    return res.status(401).json({ error: 'Nejste přihlášeni nebo chybí ID uživatele v tokenu.' });
  }
  const userId: string = String(token.sub);
  const supabaseAdmin = getSupabaseAdmin();

  if (req.method === 'GET') {
    // ... (GET method remains largely unchanged, ensure systemMessage here is consistent or removed if fully dynamic)
    try {
      const { data: lastSession, error: lastSessionError } = await supabaseAdmin
        .from('chat_sessions')
        .select('id, metadata') // Načteme i metadata pro system prompt
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastSessionError && lastSessionError.code !== 'PGRST116') {
        throw lastSessionError;
      }
      
      // Základní systémová zpráva pro GET, pokud není historie nebo metadata
      // Může být přepsána metadaty seance níže
      let initialSystemPromptContent = "Jsi AI Psycholog, empatický a profesionální český psychologický asistent. Tvým cílem je poskytovat podporu a vést uživatele k zamyšlení. Odpovídej klidně, přátelsky, ale vždy profesionálně, česky. Nikdy nediagnostikuj.";


      if (lastSession) {
        const sessionMetadata = lastSession.metadata as any;
        if (sessionMetadata) {
            let dynamicSystemPrompt = `Jsi AI Psycholog.`;
            if (sessionMetadata.assistantGender) dynamicSystemPrompt += ` Jsi ${sessionMetadata.assistantGender === 'male' ? 'muž' : 'žena'}.`;
            if (sessionMetadata.assistantName) dynamicSystemPrompt += ` Jmenuješ se ${sessionMetadata.assistantName}.`;
            
            const personalityKey = sessionMetadata.personality as PersonalityKey;
            if (personalityKey && PERSONALITY_PROMPTS[personalityKey]) {
                dynamicSystemPrompt += ` ${PERSONALITY_PROMPTS[personalityKey]}`;
            } else {
                dynamicSystemPrompt += ` ${PERSONALITY_PROMPTS['neutral']}`; // Fallback
            }

            const topicKey = sessionMetadata.topic as TopicKey;
            if (topicKey && TOPIC_PROMPTS[topicKey]) {
                dynamicSystemPrompt += ` ${TOPIC_PROMPTS[topicKey]}`;
            } else {
                dynamicSystemPrompt += ` ${TOPIC_PROMPTS['general']}`; // Fallback
            }
            if (sessionMetadata.responseLength) dynamicSystemPrompt += ` Tvé odpovědi by měly být spíše ${sessionMetadata.responseLength === 'short' ? 'krátké' : sessionMetadata.responseLength === 'medium' ? 'středně dlouhé' : 'delší a detailnější'}.`;
            dynamicSystemPrompt += " Tvůj tón je přátelský, ale vždy profesionální. Odpovídej klidně, česky. Nikdy nediagnostikuj. Udržuj konverzaci relevantní k psychologickým tématům a osobnímu rozvoji.";
            initialSystemPromptContent = dynamicSystemPrompt;
        }


        const { data: messagesData, error: messagesError } = await supabaseAdmin
          .from('chat_messages')
          .select('role, content, timestamp, metadata')
          .eq('session_id', lastSession.id)
          .order('timestamp', { ascending: true });

        if (messagesError) throw messagesError;
        
        const systemMessage: Message = { role: 'system', content: initialSystemPromptContent };
        const chatMessages: Message[] = messagesData.map(m => ({
          role: m.role as Message['role'],
          content: m.content,
          timestamp: new Date(m.timestamp),
          isCrisis: (m.metadata as any)?.isCrisis ?? false,
        }));

        let proactiveMessage: Message | null = null;
        try {
          const { data: recentDiaryEntries, error: diaryError } = await supabaseAdmin
            .from('diary_entries')
            .select('mood_id, entry_date')
            .eq('user_id', userId)
            .order('entry_date', { ascending: false })
            .limit(3); 

          if (diaryError) {
            console.warn('API /api/chat GET - Chyba při načítání deníkových zápisů pro proaktivitu:', diaryError.message);
          } else if (recentDiaryEntries && recentDiaryEntries.length === 3) {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const allRecentEnough = recentDiaryEntries.every(entry => new Date(entry.entry_date) > sevenDaysAgo);
            
            if (allRecentEnough) {
              const negativeMoods = ['sad', 'angry']; 
              const recentMoodsAreNegative = recentDiaryEntries.every(entry => entry.mood_id && negativeMoods.includes(entry.mood_id));

              if (recentMoodsAreNegative) {
                proactiveMessage = {
                  role: 'assistant',
                  content: 'Všiml/a jsem si, že jste v posledních deníkových zápiscích zaznamenal/a spíše negativní nálady. Chtěl/a byste si o tom, jak se cítíte, promluvit?',
                  timestamp: new Date()
                };
              }
            }
          }
        } catch (diaryAnalysisError: any) {
          console.warn('API /api/chat GET - Chyba při analýze deníku pro proaktivitu:', diaryAnalysisError.message);
        }
        
        const finalMessages = proactiveMessage ? [systemMessage, ...chatMessages, proactiveMessage] : [systemMessage, ...chatMessages];
        return res.status(200).json({ sessionId: lastSession.id, messages: finalMessages });

      } else {
        // No previous session, construct default system prompt
        const systemMessage: Message = { role: 'system', content: initialSystemPromptContent };
        // Proactive message logic for no session (copied from above, can be refactored)
        let proactiveMessage: Message | null = null;
        try {
          const { data: recentDiaryEntries, error: diaryError } = await supabaseAdmin
            .from('diary_entries')
            .select('mood_id, entry_date')
            .eq('user_id', userId)
            .order('entry_date', { ascending: false })
            .limit(3);

          if (diaryError) {
            console.warn('API /api/chat GET (no session) - Chyba při načítání deníkových zápisů:', diaryError.message);
          } else if (recentDiaryEntries && recentDiaryEntries.length === 3) {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const allRecentEnough = recentDiaryEntries.every(entry => new Date(entry.entry_date) > sevenDaysAgo);
            if (allRecentEnough) {
              const negativeMoods = ['sad', 'angry'];
              const recentMoodsAreNegative = recentDiaryEntries.every(entry => entry.mood_id && negativeMoods.includes(entry.mood_id));
              if (recentMoodsAreNegative) {
                proactiveMessage = {
                  role: 'assistant',
                  content: 'Všiml/a jsem si, že jste v posledních deníkových zápiscích zaznamenal/a spíše negativní nálady. Chtěl/a byste si o tom, jak se cítíte, promluvit?',
                  timestamp: new Date()
                };
              }
            }
          }
        } catch (diaryAnalysisError: any) {
          console.warn('API /api/chat GET (no session) - Chyba při analýze deníku:', diaryAnalysisError.message);
        }
        const initialMessages = proactiveMessage ? [systemMessage, proactiveMessage] : [systemMessage];
        return res.status(200).json({ sessionId: null, messages: initialMessages });
      }
    } catch (error: any) {
      console.error('API /api/chat GET error:', error);
      return res.status(500).json({ error: 'Chyba při načítání historie chatu.' });
    }
  } else if (req.method === 'POST') {
    try {
      await initializeRag();
      console.log('API route /api/chat POST called with body:', JSON.stringify(req.body, null, 2));
    
      const body = req.body as {
        messages: Message[];
        topic?: TopicKey; // Updated to use TopicKey
        personality?: PersonalityKey; // Updated to use PersonalityKey
        responseLength?: 'short' | 'medium' | 'long';
        userProfile?: UserProfileData; 
        sessionId?: string;
      };
    
      const messages: Message[] = body.messages;
      const topicKey: TopicKey | undefined = body.topic;
      const personalityKey: PersonalityKey | undefined = body.personality;
      const responseLength: 'short' | 'medium' | 'long' | undefined = body.responseLength;
      const sessionId: string | undefined = body.sessionId;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
      }

      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (!lastUserMessage) {
        return res.status(400).json({ error: 'No user message found' });
      }
      const userMessageContent = lastUserMessage.content;

      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const sessionTitle = userMessageContent.substring(0, 70) + (userMessageContent.length > 70 ? '...' : '');
        const sessionMetadata = { 
          topic: topicKey, 
          personality: personalityKey, 
          responseLength, 
          assistantGender: body.userProfile?.preferences?.assistantGender, 
          assistantName: body.userProfile?.preferences?.assistantName 
        };
        const { data: newSession, error: sessionError } = await supabaseAdmin
          .from('chat_sessions')
          .insert({ user_id: userId, title: sessionTitle, metadata: sessionMetadata })
          .select('id')
          .single();
        if (sessionError) throw sessionError;
        currentSessionId = newSession.id;
        console.log(`New chat session created: ${currentSessionId}`);
      }

      await supabaseAdmin
        .from('chat_messages')
        .insert({ session_id: currentSessionId, role: 'user', content: userMessageContent });

      const crisisKeywords = ["chci se zabít", "nechci žít", "ukončit život", "sebevražda", "zabít se"];
      const isCrisisMessage = crisisKeywords.some(keyword => userMessageContent.toLowerCase().includes(keyword));

      if (isCrisisMessage) {
        const crisisResponseContent = "Je mi moc líto, že se takhle cítíš. Vypadá to, že procházíš opravdu těžkým obdobím. Chtěl/a bych tě ujistit, že na to nemusíš být sám/sama. Existují lidé, kteří ti chtějí a mohou pomoci. Prosím, zvaž kontaktování některé z linek důvěry, jsou tu pro tebe nonstop a anonymně: Linka bezpečí 116 111, Linka první psychické pomoci 116 123. Pokud jsi v bezprostředním ohrožení, neváhej prosím zavolat na 155 nebo 112.";
        await supabaseAdmin
          .from('chat_messages')
          .insert({ session_id: currentSessionId, role: 'assistant', content: crisisResponseContent, metadata: { isCrisis: true } });
        return res.status(200).json({ role: 'assistant', content: crisisResponseContent, isCrisis: true, sessionId: currentSessionId });
      }

      // Constructing the system prompt
      let systemPrompt = `Jsi AI Psycholog.`;
      if (body.userProfile?.preferences?.assistantGender) {
        systemPrompt += ` Jsi ${body.userProfile.preferences.assistantGender === 'male' ? 'muž' : 'žena'}.`;
      }
      if (body.userProfile?.preferences?.assistantName) {
        systemPrompt += ` Jmenuješ se ${body.userProfile.preferences.assistantName}.`;
      }

      // Apply personality prompt
      if (personalityKey && PERSONALITY_PROMPTS[personalityKey]) {
        systemPrompt += ` ${PERSONALITY_PROMPTS[personalityKey]}`;
      } else {
        systemPrompt += ` ${PERSONALITY_PROMPTS['neutral']}`; // Default to neutral if not specified or invalid
      }

      // Apply topic prompt
      if (topicKey && TOPIC_PROMPTS[topicKey]) {
        systemPrompt += ` ${TOPIC_PROMPTS[topicKey]}`;
      } else {
        systemPrompt += ` ${TOPIC_PROMPTS['general']}`; // Default to general if not specified or invalid
      }
      
      if (responseLength) {
        systemPrompt += ` Tvé odpovědi by měly být spíše ${responseLength === 'short' ? 'krátké a výstižné' : responseLength === 'medium' ? 'středně dlouhé a vyvážené' : 'delší, detailnější a propracovanější'}.`;
      }
      
      systemPrompt += " Tvůj celkový tón by měl být přátelský, ale zároveň vždy profesionální. Odpovídej klidně, empaticky, česky. Nikdy nediagnostikuj. Udržuj konverzaci relevantní k psychologickým tématům, osobnímu rozvoji a zvládání životních situací.";
      console.log("Final System Prompt:", systemPrompt);


      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        const simulatedResponseContent = `Dobrý den! (Simulovaná odpověď - API klíč chybí)`;
        await supabaseAdmin
          .from('chat_messages')
          .insert({ session_id: currentSessionId, role: 'assistant', content: simulatedResponseContent });
        return res.status(200).json({ role: 'assistant', content: simulatedResponseContent, estimatedReadingTime: 3, sessionId: currentSessionId });
      }

      const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
      const formattedMessagesForGemini: any[] = [];
      // System prompt is now part of the history for Gemini, or handled via specific fields if API supports
      // For Gemini's `contents` array, the system prompt is often the first 'user' turn, followed by a 'model' turn acknowledging it.
      formattedMessagesForGemini.push({ role: 'user', parts: [{ text: systemPrompt }] });
      formattedMessagesForGemini.push({ role: 'model', parts: [{ text: 'Rozumím a jsem připraven/a pomoci.' }] }); // Model acknowledges the detailed system prompt

      // Add previous messages from the current session for context
      messages.filter(m => m.role === 'user' || m.role === 'assistant') // Exclude system messages from history if already handled
              .forEach(msg => {
                formattedMessagesForGemini.push({
                  role: msg.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: msg.content }]
                });
              });
      
      // Remove the last user message from formattedMessagesForGemini if it's already included in userMessageWithContext logic
      // Ensure the last user message is the final one before the API call.
      // The current logic adds all messages then the RAG context to the last user message.
      // Let's refine this: the RAG context should augment the *current* user message, not be a separate turn.
      
      // Remove last user message if it was added in the loop, as it will be added with RAG context
      if (formattedMessagesForGemini.length > 2 && formattedMessagesForGemini[formattedMessagesForGemini.length -1].role === 'user') {
          formattedMessagesForGemini.pop();
      }

      const ragContext = await ragService.generateContext(userMessageContent, { maxDocuments: 2, similarityThreshold: 0.6 });
      const userMessageWithContext = ragContext ? `${userMessageContent}\n\nPro tvou informaci, zde jsou některé relevantní poznámky z naší databáze znalostí, které by ti mohly pomoci lépe odpovědět (tyto informace neukazuj přímo uživateli, ale použij je k formulaci odpovědi):\n${ragContext}` : userMessageContent;
      formattedMessagesForGemini.push({ role: 'user', parts: [{ text: userMessageWithContext }] });


      try {
        const response = await axios({
          method: 'post',
          url: `${GEMINI_API_URL}?key=${geminiApiKey}`,
          headers: { 'Content-Type': 'application/json' },
          data: { 
            contents: formattedMessagesForGemini, 
            generationConfig: { 
              temperature: 0.7, // Adjusted for more creative/empathetic responses
              topK: 40, 
              topP: 0.95, 
              maxOutputTokens: 800 
            } 
          }
        });
        const geminiData = response.data;
        if (geminiData.error) throw new Error(geminiData.error.message || 'Gemini API error');
        
        let responseContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, momentálně nedokážu odpovědět.";
        
        const validationResult = validateAIResponse(responseContent);
        if (!validationResult.isValid) {
          console.warn(`AI Response Validation Failed: ${validationResult.issue}. Original: "${responseContent}". Suggestion: "${validationResult.suggestion}"`);
          responseContent = validationResult.suggestion || "Omlouvám se, došlo k interní chybě. Zkuste to prosím znovu.";
        }
        
        await supabaseAdmin
          .from('chat_messages')
          .insert({ session_id: currentSessionId, role: 'assistant', content: responseContent });
        return res.status(200).json({ role: 'assistant', content: responseContent, estimatedReadingTime: Math.ceil(responseContent.length / 1000 * 60 / 200), sessionId: currentSessionId });
      } catch (apiError: any) {
        console.error('Error calling Gemini API:', apiError.response?.data || apiError.message);
        const errorContent = `Omlouvám se, problém s AI. (Chyba: ${apiError?.message || 'Neznámá chyba'})`;
        await supabaseAdmin
          .from('chat_messages')
          .insert({ session_id: currentSessionId, role: 'assistant', content: errorContent });
        return res.status(200).json({ role: 'assistant', content: errorContent, estimatedReadingTime: 3, sessionId: currentSessionId });
      }
    } catch (postOuterError: any) {
      console.error('Error processing POST chat request:', postOuterError);
      return res.status(500).json({ 
        error: 'Internal server error during POST operation', 
        content: `Omlouvám se, nastala chyba serveru. (Chyba: ${postOuterError?.message || 'Neznámá chyba'})`,
        sessionId: (req.body as any)?.sessionId
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
