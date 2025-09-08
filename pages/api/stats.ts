import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // --- DEBUGGING: Return hardcoded data to isolate the issue ---
  return res.status(200).json({
    userCount: 123,
    messageCount: 4567,
  });
}
