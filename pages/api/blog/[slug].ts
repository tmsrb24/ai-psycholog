import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error for no rows found
        return res.status(404).json({ error: 'Article not found' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch article', details: error.message });
  }
}
