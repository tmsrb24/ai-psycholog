import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Construct the redirect URL for the password reset link
  const redirectTo = `${process.env.NEXTAUTH_URL}/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error('Error sending password reset email:', error.message);
    // Don't reveal if the email exists or not for security reasons
    return res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
  }

  return res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
}
