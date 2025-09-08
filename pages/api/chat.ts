import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ApiResponse } from '../../types/chat';
import { UserProfileData } from '../../types/user';
import axios from 'axios';
// import { ragService, initializeRagWithSamples } from '../../lib/rag'; // Old RAG
import { initializePubMedRAG, searchPubMedRAG } from '../../lib/ragPubMedService'; // New PubMed RAG
import { getSupabaseAdmin } from '../../lib/supabaseClient';
import { getToken } from "next-auth/jwt";
import { validateAIResponse, AIResponseValidationResult } from '../../lib/responseValidation';
import { checkForCrisis, getCrisisResponse, saveCrisisMessage } from '../../services/crisisService';
import { getOrCreateSession, saveUserMessage } from '../../services/sessionService';
import { getGeminiResponse } from '../../services/geminiService';

// Initialize PubMed RAG - this will run once when the module is first loaded in a serverless environment,
// or on first request to this API route. The service itself has an internal flag.
// For Vercel, top-level await is not directly supported in API routes in Pages Router in the same way as App Router.
// We'll use a flag and initialize on first relevant request.
let pubMedRagInitializationEnsured = false;
const ensurePubMedRagIsInitialized = async () => {
  if (!pubMedRagInitializationEnsured) {
    console.log("Attempting to initialize PubMed RAG for the first time in this instance...");
    // Using a general query that might yield useful, diverse psychological content for the "lite" version
    await initializePubMedRAG("psychotherapy techniques for common mental health issues", 3); 
    pubMedRagInitializationEnsured = true; 
  }
};


type TopicKey = 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | 'general';
type PersonalityKey = 'supportive' | 'practical' | 'analytical' | 'neutral';

const TOPIC_PROMPTS: Record<TopicKey, string> = {
  general: "Tvým hlavním zaměřením je obecná psychologická pohoda a podpora osobního rozvoje. Pomáhej uživatelům prozkoumávat jejich pocity a myšlenky v bezpečném prostředí.",
  anxiety: "Jsi expert na zvládání úzkosti. Tvým úkolem je poskytovat klidné, praktické a vědecky podložené rady. Aktivně nabízej techniky jako kognitivně-behaviorální přístupy, mindfulness, dechová cvičení a strategie pro zvládání panických atak.",
  relationships: "Jsi specialista na vztahovou terapii. Pomáhej řešit problémy v komunikaci, konflikty a budovat zdravější vztahy. Poskytuj vyvážené, nestranné a praktické rady.",
  depression: "Jsi odborník na podporu při depresivních stavech. Poskytuj hluboce empatické, chápavé a praktické rady. Zdůrazňuj význam malých kroků a sebepéče. Vždy jemně připomínej možnost a důležitost odborné pomoci, pokud je to vhodné.",
  stress: "Jsi specialista na zvládání stresu. Nabízej konkrétní a praktické techniky pro redukci stresu, zlepšení time managementu a dosažení work-life balance. Pomáhej identifikovat stresory a budovat odolnost.",
  selfEsteem: "Jsi expert na budování zdravého sebevědomí a pozitivního sebeobrazu. Poskytuj podporující a praktické rady pro zlepšení sebehodnoty, překonání negativního vnitřního dialogu a stanovování osobních cílů."
};

const PERSONALITY_PROMPTS: Record<PersonalityKey, string> = {
  neutral: "Tvůj komunikační styl je vyvážený, objektivní a věcný. Soustředíš se na fakta a logické argumenty, přičemž si zachováváš profesionální odstup.",
  supportive: "Tvůj komunikační styl je mimořádně empatický, vřelý, laskavý a trpělivý. Aktivně projevuj porozumění a soucit. Používej hodně povzbuzujících slov, ujištění a validuj pocity uživatele. Vytvářej atmosféru bezpečí a důvěry.",
  practical: "Tvůj komunikační styl je přímý, strukturovaný a zaměřený na konkrétní řešení. Nabízej jasné, akční kroky, strategie a praktické tipy. Buď stručný a efektivní, ale stále citlivý k potřebám uživatele.",
  analytical: "Tvůj komunikační styl je hloubkový, zvídavý a reflektivní. Pomáhej uživatelům porozumět příčinám jejich problémů a hlubším souvislostem. Kladeš podnětné otázky, které vedou k sebereflexi a vhledu."
};

const CORE_INSTRUCTIONS = "Jsi AI Psycholog, špičkový český psychologický asistent. Tvým hlavním úkolem je poskytovat textovou psychologickou podporu, vést uživatele k zamyšlení a pomáhat jim lépe porozumět jejich pocitům a situacím. Vžij se plně do této role. Tvůj celkový tón musí být vždy přátelský a lidský, ale zároveň si udržuj profesionální úroveň. Odpovídej klidně, empaticky a výhradně česky. Nikdy nediagnostikuj ani nepředepisuj léčbu. Udržuj konverzaci relevantní k psychologickým tématům, osobnímu rozvoji a zvládání životních situací. Za žádných okolností neodhaluj, že jsi umělá inteligence, jazykový model nebo program. Nemluv o svém tréninku, programování ani o společnosti, která tě vytvořila. Striktně se drž své role psychologického asistenta.";

function constructSystemPrompt(metadata: any): string {
  let systemPromptContent = CORE_INSTRUCTIONS;
  if (metadata) {
    const meta = metadata as any;
    let specificInstructions = "";
    if (meta.assistantGender) specificInstructions += ` Jsi ${meta.assistantGender === 'male' ? 'muž' : 'žena'}.`;
    if (meta.assistantName) {
      specificInstructions += ` Tvé jméno je ${meta.assistantName}. Používej toto jméno, když mluvíš o sobě nebo když se tě na něj někdo zeptá.`;
    }
    
    const personalityKey = meta.personality as PersonalityKey;
    specificInstructions += ` ${PERSONALITY_PROMPTS[personalityKey] || PERSONALITY_PROMPTS['neutral']}`;

    const topicKey = meta.topic as TopicKey;
    specificInstructions += ` ${TOPIC_PROMPTS[topicKey] || TOPIC_PROMPTS['general']}`;
    
    if (meta.responseLength) specificInstructions += ` Preferuješ odpovědi, které jsou spíše ${meta.responseLength === 'short' ? 'krátké a výstižné' : meta.responseLength === 'medium' ? 'středně dlouhé a vyvážené' : 'delší, detailnější a propracovanější'}.`;
    
    systemPromptContent = CORE_INSTRUCTIONS + specificInstructions;
  }
  return systemPromptContent;
}

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
    console.log(`[API /api/chat GET] Request received for user ID: ${userId}, Session Token Sub: ${token.sub}`); // Log the userId
    // ... (GET logic remains largely the same, ensurePubMedRagIsInitialized() not strictly needed for GET unless GET also uses RAG)
    try {
      const { data: lastSession, error: lastSessionError } = await supabaseAdmin
        .from('chat_sessions')
        .select('id, metadata') 
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastSessionError && lastSessionError.code !== 'PGRST116') {
        throw lastSessionError;
      }
      
      const systemPromptContent = constructSystemPrompt(lastSession?.metadata);


      if (lastSession) {
        const MESSAGES_PAGE_LIMIT = 50; // Load last 50 messages
        const { data: messagesData, error: messagesError } = await supabaseAdmin
          .from('chat_messages')
          .select('role, content, timestamp, metadata')
          .eq('session_id', lastSession.id)
          .order('timestamp', { ascending: false }) // Fetch newest first for limit
          .limit(MESSAGES_PAGE_LIMIT);

        if (messagesError) throw messagesError;

        // Messages are fetched newest first due to limit, so reverse them back to oldest first
        const orderedMessagesData = messagesData ? messagesData.reverse() : [];
        
        const systemMessage: Message = { role: 'system', content: systemPromptContent };
        const chatMessages: Message[] = orderedMessagesData.map(m => ({ // Use orderedMessagesData
          role: m.role as Message['role'],
          content: m.content,
          timestamp: new Date(m.timestamp),
          isCrisis: (m.metadata as any)?.isCrisis ?? false,
        }));

        // Proactive messaging based on diary (kept as is)
        let proactiveMessage: Message | null = null;
        // ... (proactive message logic from original file) ...
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
        // ... (logic for no last session, including proactive message, from original file) ...
        const systemMessage: Message = { role: 'system', content: systemPromptContent };
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
      // Message Limiting Logic
      const { data: subscription, error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .select('plan_id, status')
        .eq('user_id', userId)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // 'PGRST116' means no rows found, which is fine
        throw subscriptionError;
      }

      const isFreePlan = !subscription || subscription.plan_id === 'free';

      if (isFreePlan) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const { data: countData, error: countError } = await supabaseAdmin
          .from('daily_message_counts')
          .select('message_count')
          .eq('user_id', userId)
          .eq('message_date', today)
          .single();

        if (countError && countError.code !== 'PGRST116') {
          throw countError;
        }

        const currentCount = countData?.message_count || 0;

        if (currentCount >= 3) {
          return res.status(429).json({ error: 'Překročili jste denní limit 3 zpráv pro bezplatný plán.' });
        }

        // Upsert the count
        const { error: upsertError } = await supabaseAdmin
          .from('daily_message_counts')
          .upsert({
            user_id: userId,
            message_date: today,
            message_count: currentCount + 1,
          }, { onConflict: 'user_id,message_date' });

        if (upsertError) {
          // Log the error but proceed with the chat, as failing to count shouldn't block the user.
          console.error('Error upserting message count:', upsertError);
        }
      }

      await ensurePubMedRagIsInitialized(); // Ensure RAG is ready
      console.log('API route /api/chat POST called with body:', JSON.stringify(req.body, null, 2));
    
      const body = req.body as {
        messages: Message[];
        topic?: TopicKey; 
        personality?: PersonalityKey; 
        responseLength?: 'short' | 'medium' | 'long';
        userProfile?: UserProfileData; 
        sessionId?: string;
      };
    
      const messages: Message[] = body.messages;
      const topicKey: TopicKey = body.topic || 'general';
      const personalityKey: PersonalityKey = body.personality || 'neutral';
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

      const currentSessionId = await getOrCreateSession(supabaseAdmin, sessionId, {
        userId,
        userMessageContent,
        topicKey,
        personalityKey,
        responseLength,
        userProfile: body.userProfile,
      });

      await saveUserMessage(supabaseAdmin, currentSessionId, userMessageContent);

      if (currentSessionId && checkForCrisis(userMessageContent)) {
        const crisisResponseContent = getCrisisResponse();
        await saveCrisisMessage(supabaseAdmin, currentSessionId, crisisResponseContent);
        return res.status(200).json({ role: 'assistant', content: crisisResponseContent, isCrisis: true, sessionId: currentSessionId });
      }

      const { data: session, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .select('metadata')
        .eq('id', currentSessionId)
        .single();

      if (sessionError) throw sessionError;

      console.log('---GEMINI REQUEST---');
      console.log(JSON.stringify({
        messages,
        topicKey,
        personalityKey,
        responseLength,
        userProfile: body.userProfile,
        userMessageContent
      }, null, 2));

      const { content, estimatedReadingTime } = await getGeminiResponse(
        messages,
        topicKey,
        personalityKey,
        responseLength,
        body.userProfile,
        userMessageContent
      );

      console.log('---GEMINI RESPONSE---');
      console.log(JSON.stringify({ content, estimatedReadingTime }, null, 2));

      await supabaseAdmin
        .from('chat_messages')
        .insert({ session_id: currentSessionId, role: 'assistant', content });

      return res.status(200).json({ role: 'assistant', content, estimatedReadingTime, sessionId: currentSessionId });
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
