import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // Upravit cestu podle struktury
import { supabase } from '../../../lib/supabaseClient'; // Upravit cestu podle struktury

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Nejste přihlášeni.' });
  }

  const userId = session.user.id; // Předpokládáme, že session.user.id je unikátní identifikátor

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
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

      const { data, error } = await supabase
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
