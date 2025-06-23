import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  if (!token || !token.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = token.sub;
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { data, error } = await supabaseAdmin.rpc('increment_session_count', { user_id: userId });

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
