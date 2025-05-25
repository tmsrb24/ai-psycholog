import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';
import { Message } from '../../../types'; // Předpokládáme, že Message je definován v types.ts

// Stejná analytická logika jako v user-insights.ts
const analyzeTopics = (messages: Message[]): string[] => {
  const topics: Record<string, number> = {};
  const keywords: Record<string, string[]> = {
    úzkost: ["úzkost", "strach", "panika", "bojím se", "nervozita"],
    stres: ["stres", "tlak", "přetížení", "vyčerpání"],
    vztahy: ["vztah", "partner", "rodina", "přátelé", "konflikt"],
    smutek: ["smutek", "deprese", "beznaděj", "pláč"],
    práce: ["práce", "kariéra", "kolegové", "šéf"],
  };
  messages.forEach(msg => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase();
      for (const topic in keywords) {
        if (keywords[topic].some(keyword => content.includes(keyword))) {
          topics[topic] = (topics[topic] || 0) + 1;
        }
      }
    }
  });
  return Object.entries(topics).sort(([, a], [, b]) => b - a).slice(0, 2).map(([topic]) => topic);
};

interface UserInsightData {
  user_id: string;
  last_analyzed_chat_at?: string | null;
  last_analyzed_diary_at?: string | null;
  recent_mood_pattern?: string | null;
  common_chat_topics?: string[] | null;
  proactive_flags?: Record<string, boolean> | null;
  updated_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ochrana cron jobu - jednoduchá kontrola tajného klíče z environment proměnné
  const cronSecret = req.headers['x-cron-secret'] || req.query.cron_secret;
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Neautorizovaný přístup k cron jobu.' });
  }

  if (req.method !== 'POST' && req.method !== 'GET') { // Povolíme GET pro snadné testování z prohlížeče
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Metoda ${req.method} není povolena.`);
  }

  const supabaseAdmin = getSupabaseAdmin();
  let processedUsersCount = 0;
  const processingErrors: any[] = [];

  try {
    // 1. Získat seznam uživatelů k analýze
    // Příklad: Uživatelé, jejichž insighty nebyly aktualizovány déle než 24 hodin, nebo noví uživatelé
    // Pro jednoduchost teď vezmeme všechny uživatele (v reálu by to chtělo paginaci a filtrování)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: usersToProcess, error: usersError } = await supabaseAdmin
      .from('user_profiles') // Správné pořadí: from('tabulka').select(...)
      .select('id') // id v user_profiles je user_id z auth.users
      // Zde by mohla být logika pro filtrování uživatelů, kteří potřebují aktualizaci, např.:
      // .lt('user_insights.updated_at', twentyFourHoursAgo) // Pokud bychom joinovali s user_insights
      .limit(5); // Pro testování omezíme na 5 uživatelů

    if (usersError) {
      console.error("Chyba při načítání uživatelů pro cron:", usersError);
      throw usersError;
    }
    if (!usersToProcess || usersToProcess.length === 0) {
      return res.status(200).json({ message: 'Žádní uživatelé k aktualizaci insightů.' });
    }

    for (const user of usersToProcess) {
      const userId = user.id;
      try {
        // Analytická logika zkopírovaná a upravená z /api/user-insights
        // TODO: Refaktorovat analytickou logiku do sdílené funkce, aby se neopakovala

        // Analýza chatu (velmi zjednodušená - potřebuje lepší filtrování zpráv pro konkrétního uživatele)
        const { data: userSessions, error: sessionsError } = await supabaseAdmin
          .from('chat_sessions')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5); // Posledních 5 seancí

        let common_chat_topics: string[] = [];
        if (sessionsError) console.warn(`Chyba načítání session pro uživatele ${userId}:`, sessionsError.message);
        else if (userSessions && userSessions.length > 0) {
          const sessionIds = userSessions.map(s => s.id);
          const { data: chatMessages, error: chatError } = await supabaseAdmin
            .from('chat_messages')
            .select('content, role')
            .in('session_id', sessionIds)
            .order('timestamp', { ascending: false })
            .limit(50); // Posledních 50 zpráv z těchto seancí
          if (chatError) console.warn(`Chyba načítání zpráv pro uživatele ${userId}:`, chatError.message);
          else if (chatMessages) common_chat_topics = analyzeTopics(chatMessages as Message[]);
        }
        
        const { data: diaryEntries, error: diaryError } = await supabaseAdmin
          .from('diary_entries')
          .select('mood_id, entry_date')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false })
          .limit(3);
        if (diaryError) console.warn(`Chyba načítání deníku pro uživatele ${userId}:`, diaryError.message);

        let recent_mood_pattern = null;
        if (diaryEntries && diaryEntries.length === 3) {
          const negativeMoods = ['sad', 'angry'];
          if (diaryEntries.every(e => e.mood_id && negativeMoods.includes(e.mood_id))) recent_mood_pattern = 'consistent_negative';
          else if (diaryEntries.every(e => e.mood_id && e.mood_id === 'happy')) recent_mood_pattern = 'consistent_positive';
        }

        const proactive_flags: Record<string, boolean> = {};
        if (recent_mood_pattern === 'consistent_negative') proactive_flags['suggest_mood_discussion'] = true;
        if (common_chat_topics.includes('stres')) proactive_flags['offer_stress_exercise'] = true;
        if (common_chat_topics.includes('úzkost')) proactive_flags['suggest_anxiety_resources'] = true;

        const insightToUpsert: UserInsightData = {
          user_id: userId,
          recent_mood_pattern,
          common_chat_topics: common_chat_topics.length > 0 ? common_chat_topics : null,
          proactive_flags: Object.keys(proactive_flags).length > 0 ? proactive_flags : null,
          updated_at: new Date().toISOString(),
          last_analyzed_chat_at: common_chat_topics.length > 0 ? new Date().toISOString() : undefined, // Aktualizovat jen pokud byla data
          last_analyzed_diary_at: diaryEntries && diaryEntries.length > 0 ? new Date().toISOString() : undefined,
        };

        const { error: upsertError } = await supabaseAdmin
          .from('user_insights')
          .upsert(insightToUpsert, { onConflict: 'user_id' });

        if (upsertError) throw upsertError;
        processedUsersCount++;
      } catch (userProcessingError: any) {
        console.error(`Chyba při zpracování insightů pro uživatele ${userId}:`, userProcessingError.message);
        processingErrors.push({ userId, error: userProcessingError.message });
      }
    }

    if (processingErrors.length > 0) {
      return res.status(207).json({ message: `Zpracováno ${processedUsersCount} uživatelů s ${processingErrors.length} chybami.`, errors: processingErrors });
    }
    return res.status(200).json({ message: `Úspěšně aktualizovány insighty pro ${processedUsersCount} uživatelů.` });

  } catch (error: any) {
    console.error('API /api/cron/process-user-insights error:', error);
    return res.status(500).json({ error: error.message || 'Chyba při dávkovém zpracování uživatelských insightů.' });
  }
}
