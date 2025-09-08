import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyGoPayPayment } from '../../../lib/gopay';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const paymentId = req.query.id as string;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID is missing.' });
  }

  try {
    const paymentDetails = await verifyGoPayPayment(paymentId);

    if (paymentDetails.state === 'PAID') {
      const orderNumber = paymentDetails.order_number;
      // Extract user ID from order number (e.g., "AIPS-USERID-TIMESTAMP")
      const userId = orderNumber.split('-')[1];

      if (!userId) {
        throw new Error(`Could not extract user ID from order number: ${orderNumber}`);
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
      // Handle other payment states if necessary (e.g., CANCELED, TIMEOUTED)
      console.log(`GoPay payment ${paymentId} status is ${paymentDetails.state}. No action taken.`);
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Error processing GoPay callback:', error);
    res.status(500).json({ error: 'Failed to process callback.' });
  }
}
