import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password, firstName, lastName, phone } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'First name, last name, email and password are required.' });
  }

  // Simple password validation (you can make this more complex)
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  console.log(`[API /api/auth/register] Attempting to sign up user with email: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        phone: phone || null, // Store phone if provided, otherwise null
      }
    }
  });

  if (error) {
    console.error(`[API /api/auth/register] Supabase signUp error for ${email}:`, error.message);
    // Provide a more user-friendly error message
    let errorMessage = 'An error occurred during registration.';
    if (error.message.includes('User already registered')) {
      errorMessage = 'A user with this email already exists.';
    } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 8 characters long.'; // Keep consistent with our check
    }
    return res.status(400).json({ error: errorMessage });
  }

  // Supabase signUp returns a user object if successful, but it might be null if email confirmation is required.
  // The user object will have a null session until the email is confirmed.
  if (data.user) {
    console.log(`[API /api/auth/register] Successfully initiated sign up for user: ${data.user.email}, ID: ${data.user.id}`);
    // Note: Supabase handles sending the confirmation email if enabled in your Supabase project settings.
    // The user will not be fully "signed in" until they confirm their email.
    return res.status(201).json({ message: 'Registration successful. Please check your email to confirm your account.', user: data.user });
  }

  // Fallback response if data.user is null but there was no error (e.g., email confirmation pending)
  return res.status(201).json({ message: 'Registration successful. Please check your email to confirm your account.' });
}
