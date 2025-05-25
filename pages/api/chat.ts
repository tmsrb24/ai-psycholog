import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ApiResponse, UserProfileData } from '../../types';
import axios from 'axios';
import { ragService, initializeRagWithSamples } from '../../lib/rag';
import { getSupabaseAdmin } from '../../lib/supabaseClient';
import { getToken } from "next-auth/jwt";

let ragInitialized = false;
const initializeRag = async () => {
  if (!ragInitialized) {
    await initializeRagWithSamples();
    ragInitialized = true;
  }
};

// Definice typu pro odpověď GET požadavku
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
    try {
      const { data: lastSession, error: lastSessionError } = await supabaseAdmin
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastSessionError && lastSessionError.code !== 'PGRST116') {
        throw lastSessionError;
      }

      if (lastSession) {
        const { data: messagesData, error: messagesError } = await supabaseAdmin
          .from('chat_messages')
          .select('role, content, timestamp, metadata')
          .eq('session_id', lastSession.id)
          .order('timestamp', { ascending: true });

        if (messagesError) throw messagesError;
        
        const systemMessage: Message = { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' };
        const chatMessages: Message[] = messagesData.map(m => ({
          role: m.role as Message['role'],
          content: m.content,
          timestamp: new Date(m.timestamp),
          isCrisis: (m.metadata as any)?.isCrisis ?? false,
        }));

        let proactiveMessage: Message | null = null;
        // Logika pro proaktivní zprávu na základě nálad z deníku
        try {
          const { data: recentDiaryEntries, error: diaryError } = await supabaseAdmin
            .from('diary_entries')
            .select('mood_id, entry_date')
            .eq('user_id', userId)
            .order('entry_date', { ascending: false })
            .limit(3); // Načteme poslední 3 zápisy

          if (diaryError) {
            console.warn('API /api/chat GET - Chyba při načítání deníkových zápisů pro proaktivitu:', diaryError.message);
          } else if (recentDiaryEntries && recentDiaryEntries.length === 3) {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            // Zkontrolujeme, zda jsou všechny 3 zápisy z posledních 7 dní
            const allRecentEnough = recentDiaryEntries.every(entry => new Date(entry.entry_date) > sevenDaysAgo);
            
            if (allRecentEnough) {
              const negativeMoods = ['sad', 'angry']; // Definice negativních nálad
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
        // Žádná předchozí seance, ale můžeme zkontrolovat deník i zde
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
        const systemMessage: Message = { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' };
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
        topic?: string;
        personality?: string;
        responseLength?: 'short' | 'medium' | 'long';
        userProfile?: UserProfileData; 
        sessionId?: string;
      };
    
      const messages: Message[] = body.messages;
      const topic: string | undefined = body.topic;
      const personality: string | undefined = body.personality;
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
          topic, 
          personality, 
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
        const crisisResponseContent = "Je mi moc líto, že se takhle cítíš...";
        await supabaseAdmin
          .from('chat_messages')
          .insert({ session_id: currentSessionId, role: 'assistant', content: crisisResponseContent, metadata: { isCrisis: true } });
        return res.status(200).json({ role: 'assistant', content: crisisResponseContent, isCrisis: true, sessionId: currentSessionId });
      }

      let systemPrompt = `Jsi empatický psycholog...`;
      if (body.userProfile?.preferences?.assistantGender) systemPrompt = `Jsi empatick${body.userProfile.preferences.assistantGender === 'male' ? 'ý' : 'á'} psycholog...`;
      if (body.userProfile?.preferences?.assistantName) systemPrompt += ` Jmenuješ se ${body.userProfile.preferences.assistantName}.`;
      if (topic) systemPrompt += ` Specializuješ se na téma: ${topic}.`;
      if (personality) systemPrompt += ` Tvůj přístup je: ${personality}.`;
      if (responseLength) systemPrompt += ` Tvé odpovědi jsou: ${responseLength}.`;

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
      formattedMessagesForGemini.push({ role: 'user', parts: [{ text: systemPrompt }] });
      formattedMessagesForGemini.push({ role: 'model', parts: [{ text: 'Rozumím.' }] });
      const ragContext = await ragService.generateContext(userMessageContent, { maxDocuments: 2, similarityThreshold: 0.6 });
      const userMessageWithContext = ragContext ? `${userMessageContent}\n\nRelevantní informace:\n${ragContext}` : userMessageContent;
      formattedMessagesForGemini.push({ role: 'user', parts: [{ text: userMessageWithContext }] });

      try {
        const response = await axios({
          method: 'post',
          url: `${GEMINI_API_URL}?key=${geminiApiKey}`,
          headers: { 'Content-Type': 'application/json' },
          data: { contents: formattedMessagesForGemini, generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 800 } }
        });
        const geminiData = response.data;
        if (geminiData.error) throw new Error(geminiData.error.message || 'Gemini API error');
        const responseContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, momentálně nedokážu odpovědět.";
        
        await supabaseAdmin
          .from('chat_messages')
          .insert({ session_id: currentSessionId, role: 'assistant', content: responseContent });
        return res.status(200).json({ role: 'assistant', content: responseContent, estimatedReadingTime: Math.ceil(responseContent.length / 1000 * 60 / 200), sessionId: currentSessionId });
      } catch (apiError: any) {
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
