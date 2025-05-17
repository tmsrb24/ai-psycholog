import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import stripe from '../../../lib/stripe';

// Log environment variables for debugging (will be removed in production)
console.log("Stripe API Key exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user session to ensure they're logged in
    const session = await getSession({ req });
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'You must be logged in to subscribe' });
    }

    const userEmail = session.user.email;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Create a Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: 'AI Psycholog Premium',
              description: 'Měsíční předplatné pro AI Psychologa',
              images: ['https://www.psychollog.cz/logo.png'], // Replace with your actual logo URL
            },
            unit_amount: 34900, // 349 CZK in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL || 'https://www.psychollog.cz'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'https://www.psychollog.cz'}/checkout/cancel`,
      customer_email: userEmail,
      metadata: {
        userId: session.user.id || '',
      },
      billing_address_collection: 'auto',
      payment_method_collection: 'always',
      allow_promotion_codes: true,
    });

    return res.status(200).json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
