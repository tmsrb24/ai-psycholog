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
        .select('id, metadata') 
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastSessionError && lastSessionError.code !== 'PGRST116') {
        throw lastSessionError;
      }
      
      let systemPromptContent = CORE_INSTRUCTIONS; 

      if (lastSession?.metadata) {
        const meta = lastSession.metadata as any;
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


      if (lastSession) {
        const { data: messagesData, error: messagesError } = await supabaseAdmin
          .from('chat_messages')
          .select('role, content, timestamp, metadata')
          .eq('session_id', lastSession.id)
          .order('timestamp', { ascending: true });

        if (messagesError) throw messagesError;
        
        const systemMessage: Message = { role: 'system', content: systemPromptContent };
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
      await initializeRag();
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

      let systemPrompt = CORE_INSTRUCTIONS;
      let specificInstructions = "";

      if (body.userProfile?.preferences?.assistantGender) {
        specificInstructions += ` Jsi ${body.userProfile.preferences.assistantGender === 'male' ? 'muž' : 'žena'}.`;
      }
      if (body.userProfile?.preferences?.assistantName) {
        specificInstructions += ` Tvé jméno je ${body.userProfile.preferences.assistantName}. Používej toto jméno, když mluvíš o sobě nebo když se tě na něj někdo zeptá.`;
      }
      
      specificInstructions += ` ${PERSONALITY_PROMPTS[personalityKey]}`;
      specificInstructions += ` ${TOPIC_PROMPTS[topicKey]}`;
      
      if (responseLength) {
        specificInstructions += ` Preferuješ odpovědi, které jsou spíše ${responseLength === 'short' ? 'krátké a výstižné' : responseLength === 'medium' ? 'středně dlouhé a vyvážené' : 'delší, detailnější a propracovanější'}.`;
      }
      
      systemPrompt += specificInstructions;
      console.log("Final System Prompt for POST:", systemPrompt);

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
      formattedMessagesForGemini.push({ role: 'model', parts: [{ text: 'Rozumím a jsem připraven/a pomoci.' }] });

      const historyMessages = messages.slice(0, -1); 
      historyMessages.filter(m => m.role === 'user' || m.role === 'assistant')
              .forEach(msg => {
                formattedMessagesForGemini.push({
                  role: msg.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: msg.content }]
                });
              });
      
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
              temperature: 0.75,
              topK: 40, 
              topP: 0.95, 
              maxOutputTokens: 1024
            } 
          }
        });
        const geminiData = response.data;
        if (geminiData.error) throw new Error(geminiData.error.message || 'Gemini API error');
        
        let responseContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, momentálně nedokážu odpovědět.";
        
        const validationResult = validateAIResponse(responseContent);
        if (!validationResult.isValid) {
          console.warn(`AI Response Validation Failed: ${validationResult.issue}. Original: "${responseContent}". Suggestion: "${validationResult.suggestion}"`);
          if (validationResult.issue?.includes("undesirable phrase")) {
             responseContent = "Prosím, soustřeďme se na vaši situaci. Jak vám mohu dnes pomoci v rámci mé role psychologického asistenta?";
          } else {
            responseContent = validationResult.suggestion || "Omlouvám se, došlo k interní chybě. Zkuste to prosím znovu.";
          }
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
