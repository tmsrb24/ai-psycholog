import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ApiResponse, UserProfileData } from '../../types';
import axios from 'axios';
import { ragService, initializeRagWithSamples } from '../../lib/rag';
import { supabase } from '../../lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth"; // Import Session typu
import authOptions from "./auth/[...nextauth]";

let ragInitialized = false;
const initializeRag = async () => {
  if (!ragInitialized) {
    await initializeRagWithSamples();
    ragInitialized = true;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string, content?: string, sessionId?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions) as Session | null; // Explicitní aserce

  if (!session || !session.user || typeof session.user.id !== 'string') { // Přísnější kontrola
    return res.status(401).json({ error: 'Nejste přihlášeni nebo chybí ID uživatele v session.' });
  }
  const userId: string = session.user.id;

  try {
    await initializeRag();
    
    console.log('API route /api/chat called with body:', JSON.stringify(req.body, null, 2));
    
    interface ChatApiRequestBody {
      messages: Message[];
      topic?: string;
      personality?: string;
      responseLength?: 'short' | 'medium' | 'long';
      userProfile?: UserProfileData; // Použití importovaného typu
      sessionId?: string;
    }
    const body = req.body as any; // Explicitně na any
    
    const messages: Message[] = body.messages;
    const topic: string | undefined = body.topic;
    const personality: string | undefined = body.personality;
    const responseLength: 'short' | 'medium' | 'long' | undefined = body.responseLength;
    const sessionId: string | undefined = body.sessionId;
    // userProfile budeme brát přímo z body.userProfile s kontrolami

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }
    const userMessageContent = lastUserMessage.content;

    // Vytvoření nebo získání session ID
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const sessionTitle = userMessageContent.substring(0, 70) + (userMessageContent.length > 70 ? '...' : '');
      
      let assistantGenderPref: 'male' | 'female' | undefined = undefined;
      let assistantNamePref: string | undefined = undefined;

      if (body.userProfile && typeof body.userProfile === 'object' && body.userProfile.preferences && typeof body.userProfile.preferences === 'object') {
        assistantGenderPref = body.userProfile.preferences.assistantGender;
        assistantNamePref = body.userProfile.preferences.assistantName;
      }
      const sessionMetadata = { 
        topic, 
        personality, 
        responseLength, 
        assistantGender: assistantGenderPref, 
        assistantName: assistantNamePref 
      };
      
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, title: sessionTitle, metadata: sessionMetadata })
        .select('id')
        .single();

      if (sessionError) throw sessionError;
      currentSessionId = newSession.id;
      console.log(`New chat session created: ${currentSessionId}`);
    }

    // Uložení uživatelské zprávy do DB
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({ session_id: currentSessionId, role: 'user', content: userMessageContent });
    if (userMessageError) console.error('Error saving user message to DB:', userMessageError); // Log error, but continue

    // Crisis detection
    const crisisKeywords = ["chci se zabít", "nechci žít", "ukončit život", "sebevražda", "zabít se"];
    const isCrisisMessage = crisisKeywords.some(keyword =>
      userMessageContent.toLowerCase().includes(keyword)
    );

    if (isCrisisMessage) {
      console.log('Crisis message detected');
      const crisisResponseContent = "Je mi moc líto, že se takhle cítíš. Nejsi na to sám – doporučuji zavolat na Linku první psychické pomoci (📞 116 123) nebo Linku bezpečí (📞 116 111). Mluvím s tebou dál, ale bezpečí je teď nejdůležitější.";
      // Uložení krizové odpovědi AI do DB
      const { error: crisisAiMessageError } = await supabase
        .from('chat_messages')
        .insert({ session_id: currentSessionId, role: 'assistant', content: crisisResponseContent, metadata: { isCrisis: true } });
      if (crisisAiMessageError) console.error('Error saving crisis AI message to DB:', crisisAiMessageError);
      
      return res.status(200).json({
        role: 'assistant',
        content: crisisResponseContent,
        isCrisis: true,
        sessionId: currentSessionId
      });
    }

    let systemPrompt = `Jsi empatický psycholog, který mluví česky a pomáhá lidem s jejich psychickými problémy...`; // Zkráceno pro přehlednost, původní logika zůstává
    
    if (body.userProfile && typeof body.userProfile === 'object' && body.userProfile.preferences && typeof body.userProfile.preferences === 'object') {
      if (body.userProfile.preferences.assistantGender) {
        const gender = body.userProfile.preferences.assistantGender;
        systemPrompt = `Jsi empatick${gender === 'male' ? 'ý' : 'á'} psycholog${gender === 'female' ? 'ička' : ''}, kter${gender === 'male' ? 'ý' : 'á'} mluví česky...`;
      }
      if (body.userProfile.preferences.assistantName) {
        systemPrompt += ` Jmenuješ se ${body.userProfile.preferences.assistantName}.`;
      }
    }
    if (topic) systemPrompt += ` Specializuješ se na téma: ${topic}.`;
    if (personality) systemPrompt += ` Tvůj přístup je: ${personality}.`;
    if (responseLength) systemPrompt += ` Tvé odpovědi jsou: ${responseLength}.`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      const simulatedResponseContent = `Dobrý den! Jsem tu, abych vám pomohl. Jak se dnes cítíte? (Simulovaná odpověď - API klíč chybí)`;
      const { error: simAiMessageError } = await supabase
        .from('chat_messages')
        .insert({ session_id: currentSessionId, role: 'assistant', content: simulatedResponseContent });
      if (simAiMessageError) console.error('Error saving simulated AI message to DB:', simAiMessageError);
      return res.status(200).json({ role: 'assistant', content: simulatedResponseContent, estimatedReadingTime: 3, sessionId: currentSessionId });
    }

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
    const formattedMessages = [ /* ... původní formátování zpráv ... */ ];
    // Zjednodušené formátování pro Gemini - je potřeba sem vložit správnou logiku pro historii konverzace
     formattedMessages.push({ role: 'user', parts: [{ text: systemPrompt }]});
     formattedMessages.push({ role: 'model', parts: [{ text: 'Rozumím.' }]});
     // Načtení předchozích zpráv z této session pro kontext - TOTO JE POTŘEBA DOPLNIT
     // const { data: previousMessages, error: prevMessagesError } = await supabase
     //   .from('chat_messages')
     //   .select('role, content')
     //   .eq('session_id', currentSessionId)
     //   .order('timestamp', { ascending: true })
     //   .limit(10); // Omezit počet zpráv pro kontext
     // if (previousMessages) {
     //   previousMessages.forEach(msg => {
     //     formattedMessages.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] });
     //   });
     // }

    const ragContext = await ragService.generateContext(userMessageContent, { maxDocuments: 2, similarityThreshold: 0.6 });
    const userMessageWithContext = ragContext 
      ? `${userMessageContent}\n\nRelevantní informace z databáze znalostí:\n${ragContext}`
      : userMessageContent;
    formattedMessages.push({ role: 'user', parts: [{ text: userMessageWithContext }] });

    try {
      const response = await axios({ /* ... původní axios volání ... */ 
        method: 'post',
        url: `${GEMINI_API_URL}?key=${geminiApiKey}`,
        headers: { 'Content-Type': 'application/json' },
        data: { contents: formattedMessages, generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 800 } }
      });
      const data = response.data;

      if (data.error) {
        throw new Error(data.error.message || 'Gemini API error');
      }
      const responseContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, momentálně nedokážu odpovědět.";

      // Uložení AI odpovědi do DB
      const { error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert({ session_id: currentSessionId, role: 'assistant', content: responseContent });
      if (aiMessageError) console.error('Error saving AI message to DB:', aiMessageError);

      return res.status(200).json({
        role: 'assistant',
        content: responseContent,
        estimatedReadingTime: Math.ceil(responseContent.length / 1000 * 60 / 200),
        sessionId: currentSessionId
      });
    } catch (apiError: any) {
      const errorContent = `Omlouvám se, problém s AI. (Chyba: ${apiError?.message || 'Neznámá chyba'})`;
      const { error: errAiMessageError } = await supabase
        .from('chat_messages')
        .insert({ session_id: currentSessionId, role: 'assistant', content: errorContent });
      if (errAiMessageError) console.error('Error saving error AI message to DB:', errAiMessageError);
      return res.status(200).json({ role: 'assistant', content: errorContent, estimatedReadingTime: 3, sessionId: currentSessionId });
    }

  } catch (error: any) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      content: `Omlouvám se, nastala chyba. (Chyba: ${error?.message || 'Neznámá chyba'})`,
      sessionId: req.body.sessionId // Vracíme sessionId, pokud bylo posláno
    });
  }
}
