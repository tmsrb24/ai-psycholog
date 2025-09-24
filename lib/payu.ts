import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const PAYU_API_URL = process.env.PAYU_API_URL || 'https://secure.payu.com';
const PAYU_CLIENT_ID = process.env.PAYU_CLIENT_ID; // This is the POS ID from the PayU dashboard
const PAYU_CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET; // This is the "Second key (MD5)"
const PAYU_OAUTH_CLIENT_ID = process.env.PAYU_OAUTH_CLIENT_ID; // This is the OAuth Client ID
const PAYU_OAUTH_CLIENT_SECRET = process.env.PAYU_OAUTH_CLIENT_SECRET; // This is the OAuth Client Secret
const PAYU_POS_ID = process.env.PAYU_POS_ID;

interface PayUToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  grant_type: string;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  if (!PAYU_OAUTH_CLIENT_ID || !PAYU_OAUTH_CLIENT_SECRET) {
    throw new Error('PayU OAuth client ID or secret is not configured.');
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', PAYU_OAUTH_CLIENT_ID);
  params.append('client_secret', PAYU_OAUTH_CLIENT_SECRET);

  try {
    const response = await axios.post<PayUToken>(
      `${PAYU_API_URL}/pl/standard/user/oauth/authorize`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
    console.error('Error getting PayU access token:', error);
    throw new Error('Could not retrieve PayU access token.');
  }
}

export async function createPayUPayment(amount: number, orderNumber: string, user: { email: string, id: string }) {
  if (!PAYU_POS_ID) {
    throw new Error('PayU POS ID is not configured.');
  }

  const accessToken = await getAccessToken();
  const customerIp = '127.0.0.1'; // In a real scenario, get the user's IP

  const paymentData = {
    notifyUrl: `${process.env.NEXTAUTH_URL}/api/payu/callback`,
    continueUrl: `${process.env.NEXTAUTH_URL}/profile`,
    customerIp,
    merchantPosId: PAYU_POS_ID,
    description: 'AI Psycholog Premium Subscription',
    currencyCode: 'CZK',
    totalAmount: (amount * 100).toString(), // Amount in cents as a string
    extOrderId: orderNumber,
    buyer: {
      email: user.email,
      extCustomerId: user.id,
    },
    products: [
      {
        name: 'AI Psycholog Premium',
        unitPrice: (amount * 100).toString(),
        quantity: '1',
      },
    ],
  };

  try {
    const response = await axios.post(
      `${PAYU_API_URL}/api/v2_1/orders`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        maxRedirects: 0, // Prevent axios from following the redirect
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept success and redirect statuses
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating PayU payment:', error.response?.data || error.message);
    throw new Error('Could not create PayU payment.');
  }
}

export async function verifyPayUPayment(orderId: string): Promise<any> {
    const accessToken = await getAccessToken();
    try {
      const response = await axios.get(
        `${PAYU_API_URL}/api/v2_1/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error verifying PayU payment. Full error object:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.error('PayU API Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('PayU API Response Status:', error.response.status);
        console.error('PayU API Response Headers:', JSON.stringify(error.response.headers, null, 2));
      }
      throw new Error('Could not verify PayU payment.');
    }
  }