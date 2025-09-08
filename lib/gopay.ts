import axios from 'axios';

const GOPAY_API_URL = process.env.GOPAY_API_URL || 'https://gw.gopay.cz/api';
const GOPAY_CLIENT_ID = process.env.GOPAY_CLIENT_ID;
const GOPAY_CLIENT_SECRET = process.env.GOPAY_CLIENT_SECRET;
const GOPAY_GOID = process.env.GOPAY_GOID;

interface GoPayToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  if (!GOPAY_CLIENT_ID || !GOPAY_CLIENT_SECRET) {
    throw new Error('GoPay client ID or secret is not configured.');
  }

  const credentials = Buffer.from(`${GOPAY_CLIENT_ID}:${GOPAY_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post<GoPayToken>(
      `${GOPAY_API_URL}/oauth2/token`,
      'grant_type=client_credentials&scope=payment-all',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
      }
    );

    const tokenData = response.data;
    tokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in - 300) * 1000, // Refresh 5 minutes before expiry
    };

    return tokenCache.token;
  } catch (error) {
    console.error('Error getting GoPay access token:', error);
    throw new Error('Could not retrieve GoPay access token.');
  }
}

export async function createGoPayPayment(amount: number, orderNumber: string) {
  if (!GOPAY_GOID) {
    throw new Error('GoPay GOID is not configured.');
  }

  const accessToken = await getAccessToken();

  const paymentData = {
    payer: {
      allowed_payment_instruments: ['PAYMENT_CARD'],
      default_payment_instrument: 'PAYMENT_CARD',
    },
    target: {
      type: 'ACCOUNT',
      goid: GOPAY_GOID,
    },
    amount: amount * 100, // Amount in cents
    currency: 'CZK',
    order_number: orderNumber,
    order_description: 'Předplatné AI Psycholog Premium',
    callback: {
      return_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
      notification_url: `${process.env.NEXTAUTH_URL}/api/gopay/callback`,
    },
    lang: 'CS',
  };

  try {
    const response = await axios.post(
      `${GOPAY_API_URL}/payments/payment`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating GoPay payment:', error.response?.data || error.message);
    throw new Error('Could not create GoPay payment.');
  }
}

export async function verifyGoPayPayment(paymentId: string): Promise<any> {
  const accessToken = await getAccessToken();
  try {
    const response = await axios.get(
      `${GOPAY_API_URL}/payments/payment/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error verifying GoPay payment:', error.response?.data || error.message);
    throw new Error('Could not verify GoPay payment.');
  }
}
