import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { createPayUPayment } from '../../../lib/payu';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.sub || !token.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const orderNumber = `AIPS-${token.sub.substring(0, 8)}-${Date.now()}`;
    const premiumPlanPrice = 249; // In CZK, as seen on pricing page

    const user = {
        email: token.email,
        id: token.sub
    }

    const payment = await createPayUPayment(premiumPlanPrice, orderNumber, user);

    // The response from PayU includes the redirect URI to redirect the user to.
    res.status(200).json({ redirectUri: payment.redirectUri });

  } catch (error: any) {
    console.error('Error creating PayU payment session:', error.message);
    if (error.response) {
      console.error('PayU API Response:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to create payment session.', details: error.message });
  }
}