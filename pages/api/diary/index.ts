import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth"; 
import authOptions from "../auth/[...nextauth]"; 
import { getSupabaseAdmin } from '../../../lib/supabaseClient'; // Změna importu

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as Session | null; 
  console.log("API /api/diary - session object received by getServerSession:", JSON.stringify(session, null, 2)); 

  // Pokus o získání ID buď z session.user.id nebo z testovací session.userIdFromToken
  const sessionUserId = session?.user?.id;
  const tokenUserId = (session as any)?.userIdFromToken;
  let effectiveUserId: string | undefined = undefined;

  if (sessionUserId && typeof sessionUserId === 'string' && sessionUserId !== "") {
    effectiveUserId = sessionUserId;
    console.log("API /api/diary - Using ID from session.user.id:", effectiveUserId);
  } else if (tokenUserId && typeof tokenUserId === 'string' && tokenUserId !== "") {
    effectiveUserId = tokenUserId;
    console.log("API /api/diary - Using ID from session.userIdFromToken:", effectiveUserId);
  }

  if (!session || !effectiveUserId) { 
    console.error("API /api/diary - Unauthorized. session.user:", JSON.stringify(session?.user, null, 2), "session.userIdFromToken:", tokenUserId, "Effective User ID:", effectiveUserId);
    return res.status(401).json({ error: 'Nejste přihlášeni nebo chybí ID uživatele v session.' });
  }

  const userId: string = effectiveUserId; 

  if (req.method === 'GET') {
    try {
      const supabaseAdmin = getSupabaseAdmin(); // Získání admin klienta
      const { data, error } = await supabaseAdmin
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error: any) {
      console.error('Supabase GET error:', error);
      res.status(500).json({ error: error.message || 'Chyba při načítání deníkových zápisů.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { content, mood_id, tags, entry_date } = req.body;

      if (!content || !entry_date) {
        return res.status(400).json({ error: 'Chybí obsah nebo datum zápisu.' });
      }
      const supabaseAdmin = getSupabaseAdmin(); // Získání admin klienta
      const { data, error } = await supabaseAdmin
        .from('diary_entries')
        .insert([{ 
          user_id: userId, 
          content, 
          mood_id, 
          tags, 
          entry_date 
        }])
        .select() // Vrátí vložený záznam
        .single(); // Očekáváme jeden záznam

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Supabase POST error:', error);
      res.status(500).json({ error: error.message || 'Chyba při ukládání deníkového zápisu.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metoda ${req.method} není povolena.`);
  }
}
