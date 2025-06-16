import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, image_url, published_at, author')
      .order('published_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles', details: error.message });
  }
}
