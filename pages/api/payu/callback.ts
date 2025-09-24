import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPayUPayment } from '../../../lib/payu';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const signatureHeader = req.headers['openpayu-signature'] as string;
  const body = req.body;

  if (!signatureHeader) {
    return res.status(400).json({ error: 'Signature header is missing.' });
  }

  // Verify the signature
  const PAYU_CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET; // Second key (MD5)
  if (!PAYU_CLIENT_SECRET) {
    console.error('PayU second key (MD5) is not configured.');
    return res.status(500).json({ error: 'Internal server error.' });
  }

  const expectedSignature = crypto
    .createHash('md5')
    .update(JSON.stringify(body) + PAYU_CLIENT_SECRET)
    .digest('hex');

  const signatureParts = signatureHeader.split(';').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as { [key: string]: string });

  if (signatureParts.signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  const { order, localReceiptDateTime, properties } = body;

  if (!order || !order.extOrderId) {
    return res.status(400).json({ error: 'Order ID is missing.' });
  }

  try {
    if (order.status === 'COMPLETED') {
      const userId = order.extOrderId.split('-')[1];

      if (!userId) {
        throw new Error(`Could not extract user ID from order number: ${order.extOrderId}`);
      }

      const supabaseAdmin = getSupabaseAdmin();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 31); // Set subscription for 31 days

      // Upsert subscription for the user
      const { error: upsertError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: 'premium',
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        throw new Error(`Failed to update subscription for user ${userId}: ${upsertError.message}`);
      }

      console.log(`Successfully activated premium subscription for user ${userId}`);
    } else {
      console.log(`PayU payment for order ${order.extOrderId} status is ${order.status}. No action taken.`);
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Error processing PayU callback:', error);
    res.status(500).json({ error: 'Failed to process callback.' });
  }
}