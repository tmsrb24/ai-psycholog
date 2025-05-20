import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth"; 
import { authOptions } from "../auth/[...nextauth]"; 
import { getSupabaseAdmin } from '../../../lib/supabaseClient'; // Změna importu
import { UserProfileData } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as Session | null; // Explicitní aserce na Session | null
  console.log("API /api/user/profile - session object:", JSON.stringify(session, null, 2)); // DEBUG LOG

  // Přísnější kontrola session a session.user
  if (!session || !session.user || typeof session.user.id !== 'string' || typeof session.user.email !== 'string') {
    console.error("API /api/user/profile - Unauthorized access or missing user ID/email. Session user:", JSON.stringify(session?.user, null, 2));
    return res.status(401).json({ error: 'Nejste přihlášeni nebo chybí potřebné údaje v session (id, email).' });
  }

  const userId: string = session.user.id;
  const userEmail: string = session.user.email;
  const userName: string | null | undefined = session.user.name;
  const userAvatar: string | null | undefined = session.user.image;

  if (req.method === 'GET') {
    try {
      const supabaseAdmin = getSupabaseAdmin(); // Získání admin klienta
      let { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') { // PGRST116: "JSON object requested, multiple (or no) rows returned" (no rows)
        // Profil neexistuje, vytvoříme ho s výchozími hodnotami
        console.log(`Profil pro uživatele ${userId} nenalezen, vytvářím nový.`);
        const defaultPreferences: UserProfileData['preferences'] = {
          responseLength: 'medium',
          communicationStyle: 'casual',
          notificationFrequency: 'none',
          assistantGender: 'male',
        };
        const supabaseAdminInsert = getSupabaseAdmin(); // Získání admin klienta pro insert
        const { data: newProfile, error: insertError } = await supabaseAdminInsert
          .from('user_profiles')
          .insert({ 
            id: userId, 
            email: userEmail, 
            name: userName, 
            avatar_url: userAvatar,
            preferences: defaultPreferences 
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }
      
      res.status(200).json(profile);
    } catch (error: any) {
      console.error('Supabase GET /user/profile error:', error);
      res.status(500).json({ error: error.message || 'Chyba při načítání profilu.' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Explicitní typování pro req.body
      const requestBody = req.body as Partial<Pick<UserProfileData, 'name' | 'avatar_url' | 'preferences'>>;
      const { name, avatar_url, preferences } = requestBody;


      // Ověření, že alespoň něco přišlo k aktualizaci
      if (typeof name === 'undefined' && typeof avatar_url === 'undefined' && typeof preferences === 'undefined') {
        return res.status(400).json({ error: 'Žádná data k aktualizaci.' });
      }
      
      const updateData: Partial<UserProfileData & { updated_at: string }> = {};
      if (typeof name !== 'undefined') updateData.name = name;
      if (typeof avatar_url !== 'undefined') updateData.avatar_url = avatar_url;
      if (typeof preferences !== 'undefined') updateData.preferences = preferences;
      updateData.updated_at = new Date().toISOString();

      const supabaseAdminUpdate = getSupabaseAdmin(); // Získání admin klienta pro update
      const { data, error } = await supabaseAdminUpdate
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      res.status(200).json(data);
    } catch (error: any) {
      console.error('Supabase PUT /user/profile error:', error);
      res.status(500).json({ error: error.message || 'Chyba při aktualizaci profilu.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Metoda ${req.method} není povolena.`);
  }
}
