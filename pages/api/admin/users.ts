import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt"; // Import getToken
// import { getServerSession } from "next-auth/next"; // Nahrazeno getToken
// import type { Session } from "next-auth"; 
// import { authOptions } from "../auth/[...nextauth]"; 
import { getSupabaseAdmin } from '../../../lib/supabaseClient';

// Předpokládáme, že ADMIN_EMAIL je nastaven v .env.local a na Vercelu
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  console.log("API /api/admin/users - token object:", JSON.stringify(token, null, 2));

  if (!token || !token.email) { // Pro admina potřebujeme email pro ověření
    console.error("API /api/admin/users - Unauthorized access or missing email in token. Token:", JSON.stringify(token, null, 2));
    return res.status(401).json({ error: 'Nejste přihlášeni nebo chybí email v tokenu.' });
  }
  
  const userEmail: string = String(token.email);

  if (userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Nemáte oprávnění k přístupu k této stránce.' });
  }

  if (req.method === 'GET') {
    try {
      // Pro administrátorský přístup můžeme použít service_role klíč, pokud je potřeba obejít RLS,
      // ale prozatím zkusíme s anon klíčem a spoléháme na to, že pro admina RLS povolí čtení všech.
      // Nebo lépe, vytvoříme specifickou RLS politiku pro admina.
      // Pro jednoduchost zde předpokládáme, že admin má právo číst všechny profily.
      // V reálné aplikaci by se zde použil Supabase klient inicializovaný se service_role klíčem,
      // pokud by RLS bránilo v přístupu.
      const supabaseAdmin = getSupabaseAdmin(); // Získání admin klienta
      const { data: profiles, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, name, created_at, avatar_url') // Vybereme jen potřebné sloupce
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      res.status(200).json(profiles);
    } catch (error: any) {
      console.error('Supabase GET /admin/users error:', error);
      res.status(500).json({ error: error.message || 'Chyba při načítání uživatelských profilů.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} není povolena.`);
  }
}
