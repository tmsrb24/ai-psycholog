import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt"; // Import getToken
// import { getServerSession } from "next-auth/next"; // Už nebudeme používat getServerSession pro získání ID
// import type { Session } from "next-auth"; 
// import authOptions from "../auth/[...nextauth]"; 
import { getSupabaseAdmin } from '../../../lib/supabaseClient';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  console.log("API /api/diary - token object:", JSON.stringify(token, null, 2));

  if (!token || !token.sub) { // Spoléháme na standardní 'sub' v JWT pro ID uživatele
    console.error("API /api/diary - Unauthorized access or missing sub in token. Token:", JSON.stringify(token, null, 2));
    return res.status(401).json({ error: 'Nejste přihlášeni nebo chybí ID uživatele v tokenu.' });
  }

  const userId: string = String(token.sub); // token.sub by mělo být ID uživatele
  const supabaseAdmin = getSupabaseAdmin();

  // --- Kontrola předplatného ---
  try {
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing']) // Povolíme i zkušební verze
      .single();

    if (subscriptionError || !subscription) {
      // Chyba nebo žádné aktivní předplatné
      return res.status(403).json({ error: 'Přístup k deníku je povolen pouze pro uživatele s Premium plánem.' });
    }

    // Zde bychom mohli dále kontrolovat i plan_id, pokud by existovalo více placených úrovní
    // Prozatím stačí, že existuje jakékoliv aktivní předplatné.

  } catch (error) {
    console.error('API /api/diary - Subscription check error:', error);
    return res.status(500).json({ error: 'Chyba při ověřování předplatného.' });
  }
  // --- Konec kontroly předplatného ---

  if (req.method === 'GET') {
    try {
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
  } else if (req.method === 'PUT') {
    try {
      const { id, content, mood_id, tags } = req.body; // entry_date se nemění při update, user_id se bere z tokenu

      if (!id || !content) {
        return res.status(400).json({ error: 'Chybí ID zápisu nebo obsah.' });
      }
      const { data, error } = await supabaseAdmin
        .from('diary_entries')
        .update({ 
          content, 
          mood_id, 
          tags,
          updated_at: new Date().toISOString() // Aktualizujeme čas poslední změny
        })
        .eq('id', id)
        .eq('user_id', userId) // Ujistíme se, že uživatel může upravovat jen své zápisy
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // PostgREST error for "No rows found"
          return res.status(404).json({ error: 'Zápis nebyl nalezen nebo nemáte oprávnění jej upravit.' });
        }
        throw error;
      }
      if (!data) { // Pokud update nic nevrátil (nemělo by se stát, pokud error není)
        return res.status(404).json({ error: 'Zápis nebyl nalezen po aktualizaci.' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      console.error('Supabase PUT error:', error);
      res.status(500).json({ error: error.message || 'Chyba při aktualizaci deníkového zápisu.' });
    }
  }
  // TODO: Přidat DELETE metodu
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']); // Přidána PUT metoda
    res.status(405).end(`Metoda ${req.method} není povolena.`);
  }
}
