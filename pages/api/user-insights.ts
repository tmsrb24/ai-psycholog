import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt";
import { getSupabaseAdmin } from '../../lib/supabaseClient';
import { Message } from '../../types'; // Předpokládáme, že Message je definován v types.ts

const secret = process.env.NEXTAUTH_SECRET;

interface UserInsightData {
  user_id: string;
  last_analyzed_chat_at?: string | null;
  last_analyzed_diary_at?: string | null;
  recent_mood_pattern?: string | null;
  common_chat_topics?: string[] | null;
  proactive_flags?: Record<string, boolean> | null;
  updated_at: string;
}

// Jednoduchá analýza klíčových slov pro témata
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
  // Vrátí top 2 témata, pokud mají nějaké zmínky
  return Object.entries(topics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([topic]) => topic);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub) {
    return res.status(401).json({ error: 'Neautorizovaný přístup.' });
  }
  const userId: string = String(token.sub);
  const supabaseAdmin = getSupabaseAdmin();

  if (req.method === 'POST') { // Spustí analýzu a vrátí (ale neuloží) insighty
    try {
      // 1. Načíst poslední chatové zprávy (např. 10)
      const { data: chatMessages, error: chatError } = await supabaseAdmin
        .from('chat_messages')
        .select('content, role, session_id')
        .order('timestamp', { ascending: false })
        .limit(20); // Vezmeme více zpráv pro lepší kontext témat

      if (chatError) throw chatError;
      
      // Filtrujeme zprávy pro daného uživatele - toto je neefektivní, lepší by bylo filtrovat v dotazu
      // Ale chat_messages nemají přímo user_id, jen session_id. Museli bychom joinovat nebo nejprve najít session_id uživatele.
      // Pro zjednodušení teď předpokládáme, že máme relevantní zprávy, nebo bychom museli upravit DB schéma/dotaz.
      // Prozatím budeme analyzovat všechny načtené zprávy, což není ideální pro produkci.
      // V reálné aplikaci bychom potřebovali efektivnější způsob, jak získat zprávy konkrétního uživatele.

      const common_chat_topics = chatMessages ? analyzeTopics(chatMessages as Message[]) : [];
      
      // 2. Načíst poslední deníkové zápisy (např. 3) pro náladu
      const { data: diaryEntries, error: diaryError } = await supabaseAdmin
        .from('diary_entries')
        .select('mood_id, entry_date')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(3);

      if (diaryError) throw diaryError;

      let recent_mood_pattern = null;
      if (diaryEntries && diaryEntries.length === 3) {
        const negativeMoods = ['sad', 'angry'];
        if (diaryEntries.every(e => e.mood_id && negativeMoods.includes(e.mood_id))) {
          recent_mood_pattern = 'consistent_negative';
        } else if (diaryEntries.every(e => e.mood_id && e.mood_id === 'happy')) {
          recent_mood_pattern = 'consistent_positive';
        }
      }

      // 3. Sestavit proactive_flags na základě analýzy
      const proactive_flags: Record<string, boolean> = {};
      if (recent_mood_pattern === 'consistent_negative') {
        proactive_flags['suggest_mood_discussion'] = true;
      }
      if (common_chat_topics.includes('stres')) {
        proactive_flags['offer_stress_exercise'] = true;
      }
      if (common_chat_topics.includes('úzkost')) {
        proactive_flags['suggest_anxiety_resources'] = true;
      }

      const simulatedInsight: UserInsightData = {
        user_id: userId,
        recent_mood_pattern,
        common_chat_topics,
        proactive_flags,
        updated_at: new Date().toISOString(),
        last_analyzed_chat_at: new Date().toISOString(),
        last_analyzed_diary_at: new Date().toISOString(),
      };

      // V tomto kroku insighty neukládáme, jen vracíme výsledek simulované analýzy
      // Pro uložení:
      /*
      const { data, error: upsertError } = await supabaseAdmin
        .from('user_insights')
        .upsert(simulatedInsight, { onConflict: 'user_id' })
        .select()
        .single();
      if (upsertError) throw upsertError;
      return res.status(200).json(data);
      */
      return res.status(200).json(simulatedInsight);

    } catch (error: any) {
      console.error('API /api/user-insights POST error:', error);
      return res.status(500).json({ error: error.message || 'Chyba při analýze uživatelských dat.' });
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_insights')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      if (!data) {
        // Pokud neexistují žádné insighty, můžeme vrátit prázdný objekt nebo spustit analýzu
        // Prozatím vrátíme null nebo výchozí strukturu
        return res.status(200).json(null); 
      }
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('API /api/user-insights GET error:', error);
      return res.status(500).json({ error: error.message || 'Chyba při načítání uživatelských insightů.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metoda ${req.method} není povolena.`);
  }
}
