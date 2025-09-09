import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt"; // Import getToken
// import { getServerSession } from "next-auth/next"; // Nahrazeno getToken
// import type { Session } from "next-auth"; 
// import { authOptions } from "../auth/[...nextauth]"; 
import { getSupabaseAdmin } from '../../../lib/supabaseClient';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  const supabaseAdmin = getSupabaseAdmin();

  if (!token || !token.sub) {
    return res.status(401).json({ error: 'Nejste přihlášeni.' });
  }

  // Ověření role administrátora
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', token.sub)
    .single();

  if (profileError || !userProfile || userProfile.role !== 'admin') {
    return res.status(403).json({ error: 'Nemáte oprávnění k přístupu k této stránce.' });
  }

  // Pokud je uživatel admin, pokračujeme
  if (req.method === 'GET') {
    try {
      // Pro administrátorský přístup můžeme použít service_role klíč, pokud je potřeba obejít RLS,
      // ale prozatím zkusíme s anon klíčem a spoléháme na to, že pro admina RLS povolí čtení všech.
      // Nebo lépe, vytvoříme specifickou RLS politiku pro admina.
      // Pro jednoduchost zde předpokládáme, že admin má právo číst všechny profily.
      // V reálné aplikaci by se zde použil Supabase klient inicializovaný se service_role klíčem,
      // pokud by RLS bránilo v přístupu.
      const supabaseAdmin = getSupabaseAdmin(); // Získání admin klienta
      
      // Krok 1: Načtení všech profilů
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, name, created_at, avatar_url, role')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Krok 2: Načtení všech předplatných
      const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id, plan_id');

      if (subscriptionsError) throw subscriptionsError;

      // Krok 3: Ruční spojení dat
      const subscriptionsMap = new Map(subscriptions.map(sub => [sub.user_id, sub.plan_id]));

      const usersWithSubscriptions = profiles.map(profile => {
        const plan = subscriptionsMap.get(profile.id) || 'free';
        return {
          ...profile,
          // Frontend očekává pole, i když bude obsahovat jen jeden prvek nebo bude prázdné
          subscriptions: plan !== 'free' ? [{ plan_id: plan }] : [],
        };
      });

      res.status(200).json(usersWithSubscriptions);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Supabase GET /admin/users error:', error);
        res.status(500).json({ error: error.message || 'Chyba při načítání uživatelských profilů.' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} není povolena.`);
  }
}
