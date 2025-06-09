import type { NextApiRequest, NextApiResponse } from 'next';
import { initializePubMedRAG } from '../../lib/ragPubMedService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const cronSecret = process.env.CRON_SECRET;
  const requestSecret = req.headers['x-cron-secret'] || req.query.secret;

  if (!cronSecret || requestSecret !== cronSecret) {
    console.warn('[API /api/warm-rag] Unauthorized attempt to warm RAG.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[API /api/warm-rag] Attempting to initialize/warm PubMed RAG...');
    await initializePubMedRAG("psychotherapy techniques for common mental health issues", 3); // Default query and article count
    console.log('[API /api/warm-rag] PubMed RAG initialization/warming call completed.');
    return res.status(200).json({ message: 'RAG system warmed successfully.' });
  } catch (error: any) {
    console.error('[API /api/warm-rag] Error during RAG warming:', error);
    return res.status(500).json({ error: 'Failed to warm RAG system.', details: error.message });
  }
}
