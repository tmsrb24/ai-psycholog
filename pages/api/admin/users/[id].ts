import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt";
import { getSupabaseAdmin } from '../../../../lib/supabaseClient';

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
    return res.status(403).json({ error: 'Nemáte oprávnění k provedení této akce.' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Chybné ID uživatele.' });
  }

  // Ochrana proti smazání vlastního účtu
  if (id === token.sub) {
    return res.status(400).json({ error: 'Nemůžete smazat vlastní účet.' });
  }

  if (req.method === 'DELETE') {
    try {
      // Mazání uživatele vyžaduje service_role klíč, který getSupabaseAdmin() poskytuje
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

      if (deleteError) {
        // Supabase automaticky maže související data v user_profiles díky foreign key s ON DELETE CASCADE
        // Pokud by to tak nebylo, museli bychom zde mazat i profil ručně.
        throw deleteError;
      }
      
      res.status(200).json({ message: 'Uživatel byl úspěšně smazán.' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting user ${id}:`, error);
        res.status(500).json({ error: error.message || 'Chyba při mazání uživatele.' });
      }
    }
  } else if (req.method === 'PUT') {
    try {
      const { role } = req.body;
      if (!role || (role !== 'admin' && role !== 'user')) {
        return res.status(400).json({ error: 'Neplatná role.' });
      }

      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ role })
        .eq('id', id);

      if (updateError) throw updateError;

      res.status(200).json({ message: 'Role uživatele byla úspěšně změněna.' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error updating role for user ${id}:`, error);
        res.status(500).json({ error: error.message || 'Chyba při změně role uživatele.' });
      }
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PUT']);
    res.status(405).end(`Metoda ${req.method} není povolena.`);
  }
}
