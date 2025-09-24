import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPayUPayment } from '../../lib/payu';
import { getSupabaseAdmin } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId, secret } = req.query;

  if (secret !== process.env.MANUAL_VERIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'orderId is required' });
  }

  try {
    const paymentDetails = await verifyPayUPayment(orderId);
    const status = paymentDetails?.orders?.[0]?.status;

    if (status === 'COMPLETED') {
      const userId = orderId.split('-')[1];
      if (!userId) {
        throw new Error(`Could not extract user ID from order number: ${orderId}`);
      }

      const supabaseAdmin = getSupabaseAdmin();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 31);

      const { data, error } = await supabaseAdmin
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
        )
        .select();

      if (error) {
        throw new Error(`Failed to update subscription for user ${userId}: ${error.message}`);
      }

      res.status(200).json({ success: true, message: `Successfully activated premium subscription for user ${userId}.`, data });
    } else {
      res.status(200).json({ success: false, message: `Payment status is '${status}'. No action taken.` });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'An error occurred during manual verification.', details: error.message });
  }
}