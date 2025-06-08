import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const token = await getToken({ req, secret });

  if (!token || !token.sub) {
    console.error("API /api/user/account - Unauthorized: No token or sub in token.");
    return res.status(401).json({ message: 'Unauthorized: Missing token or user ID.' });
  }

  const userId = String(token.sub);

  // Double-check if it's a UUID, though the JWT callback should ensure this.
  // If it's not a UUID at this stage, Supabase admin delete will likely fail.
  if (userId.length !== 36) {
      console.error(`API /api/user/account - Invalid user ID format: ${userId}. Must be a UUID.`);
      return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error(`API /api/user/account - Error deleting user ${userId} from Supabase:`, error);
      // Provide a more user-friendly error message if possible
      let userMessage = 'Chyba při mazání účtu.';
      if (error.message.includes('User not found')) {
        userMessage = 'Uživatel nebyl nalezen.';
      }
      return res.status(500).json({ message: userMessage, error: error.message });
    }

    console.log(`API /api/user/account - User ${userId} deleted successfully. Data:`, data);
    // Successfully deleted, no content to return for DELETE is common
    return res.status(204).end(); 

  } catch (e: any) {
    console.error(`API /api/user/account - Unexpected error deleting user ${userId}:`, e);
    return res.status(500).json({ message: 'Neočekávaná chyba serveru při mazání účtu.', error: e.message });
  }
}
