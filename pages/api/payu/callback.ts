import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPayUPayment } from '../../../lib/payu';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';
import crypto from 'crypto';

// Helper to get raw body
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const signatureHeader = req.headers['openpayu-signature'] as string;
  if (!signatureHeader) {
    return res.status(400).json({ error: 'Signature header is missing.' });
  }

  const rawBody = await getRawBody(req);
  const body = JSON.parse(rawBody.toString());

  // Verify the signature
  const PAYU_CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET; // Second key (MD5)
  if (!PAYU_CLIENT_SECRET) {
    console.error('PayU second key (MD5) is not configured.');
    return res.status(500).json({ error: 'Internal server error.' });
  }

  const expectedSignature = crypto
    .createHash('md5')
    .update(rawBody.toString() + PAYU_CLIENT_SECRET)
    .digest('hex');

  const signatureParts = signatureHeader.split(';').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as { [key: string]: string });

  if (signatureParts.signature !== expectedSignature) {
    console.error(`Invalid signature. Expected: ${expectedSignature}, Got: ${signatureParts.signature}`);
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  const { order, localReceiptDateTime, properties } = body;

  if (!order || !order.extOrderId) {
    return res.status(400).json({ error: 'Order ID is missing.' });
  }

  try {
    // The orderId from PayU is the actual transaction identifier
    const payuOrderId = order.orderId;
    if (!payuOrderId) {
      return res.status(400).json({ error: 'PayU Order ID is missing in callback.' });
    }

    // Verify the payment status directly with PayU as a source of truth
    const paymentDetails = await verifyPayUPayment(payuOrderId);
    const paymentStatus = paymentDetails?.orders?.[0]?.status;

    if (paymentStatus === 'COMPLETED') {
      const extOrderId = paymentDetails.orders[0].extOrderId;
      const userId = extOrderId.split('-')[1];

      if (!userId) {
        throw new Error(`Could not extract user ID from extOrderId: ${extOrderId}`);
      }

      const supabaseAdmin = getSupabaseAdmin();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 31); // Set subscription for 31 days

      const { error: upsertError } = await supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            plan_id: 'premium',
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (upsertError) {
        throw new Error(`Failed to update subscription for user ${userId}: ${upsertError.message}`);
      }

      console.log(`Successfully verified and activated premium subscription for user ${userId}`);
    } else {
      console.log(`PayU payment for order ${payuOrderId} has status '${paymentStatus}'. No action taken.`);
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Error processing PayU callback:', error);
    res.status(500).json({ error: 'Failed to process callback.' });
  }
}