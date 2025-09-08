import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get user count
    const { count: userCount, error: userError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // Get message count
    const { count: messageCount, error: messageError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (messageError) throw messageError;

    const baseUserCount = 72;

    res.status(200).json({
      userCount: (userCount ?? 0) + baseUserCount,
      messageCount: messageCount ?? 0,
    });
  } catch (error: any) {
    console.error('API /api/stats error:', error);
    res.status(500).json({ error: error.message || 'Chyba při načítání statistik.' });
  }
}
