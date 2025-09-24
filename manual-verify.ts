// manual-verify.ts
// This script manually verifies a PayU order and updates the user's subscription in Supabase.
// Usage: tsx manual-verify.ts <orderId>

import { verifyPayUPayment } from './lib/payu';
import { getSupabaseAdmin } from './lib/supabaseClient';

async function manualVerify(orderId: string) {
  if (!orderId) {
    console.error('Usage: tsx manual-verify.ts <orderId>');
    process.exit(1);
  }

  console.log(`Verifying payment for order: ${orderId}`);

  try {
    const paymentDetails = await verifyPayUPayment(orderId);
    const status = paymentDetails?.orders?.[0]?.status;

    if (status === 'COMPLETED') {
      console.log('Payment status is COMPLETED. Updating subscription...');

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
        .upsert({
          user_id: userId,
          plan_id: 'premium',
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }, { onConflict: 'user_id' })
        .select();

      if (error) {
        throw new Error(`Failed to update subscription for user ${userId}: ${error.message}`);
      }

      console.log(`Successfully activated premium subscription for user ${userId}.`);
      console.log('Subscription details:', data);
    } else {
      console.log(`Payment status is '${status}'. No action taken.`);
    }
  } catch (error) {
    console.error('An error occurred during manual verification:', error);
  }
}

const orderId = process.argv[2];
manualVerify(orderId);