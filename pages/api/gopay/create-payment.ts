import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { createGoPayPayment } from '../../../lib/gopay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // For a real application, you might create an order in your database first
    const orderNumber = `AIPS-${token.sub.substring(0, 8)}-${Date.now()}`;
    const premiumPlanPrice = 349; // In CZK, as seen on pricing page

    const payment = await createGoPayPayment(premiumPlanPrice, orderNumber);

    // The response from GoPay includes the gateway URL (gw_url) to redirect the user to.
    res.status(200).json({ gw_url: payment.gw_url });

  } catch (error: any) {
    console.error('Error creating GoPay payment session:', error);
    res.status(500).json({ error: 'Failed to create payment session.' });
  }
}
