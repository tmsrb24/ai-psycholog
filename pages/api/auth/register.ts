import type { NextApiRequest, NextApiResponse } from 'next';
// import { MongoClient } from 'mongodb'; // MongoDB not used for now
// import bcrypt from 'bcryptjs'; // Bcrypt not used if not storing passwords
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// MongoDB connection details removed as MongoDB is not used for now
// const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-psycholog";
// const options = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // MongoDB logic (user creation, duplicate check, password hashing) is removed for now.
  // This means users registered via this endpoint are not stored in a database.
  // This endpoint will only attempt to send a welcome email.

  try {
    // Send confirmation email
    // This email is sent regardless of whether the user is actually stored,
    // as per current requirement to remove DB but keep email.
    await resend.emails.send({
      from: 'AI Psycholog <noreply@psychollog.cz>',
      to: [email],
      subject: 'Vítejte v AI Psycholog!',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Vítejte v AI Psycholog, ${name}!</h2>
          <p>Děkujeme Vám za projevený zájem o registraci na naší platformě.</p>
          <p>Tento e-mail potvrzuje, že jsme přijali Vaši žádost o registraci.</p>
          <p>Upozornění: V současné době je funkce registrace e-mailem a heslem ve vývoji a uživatelské účty se neukládají do databáze. Pro plnohodnotné přihlášení prosím využijte možnost přihlášení přes Google.</p>
          <p>Pokud máte jakékoli dotazy, neváhejte nás kontaktovat.</p>
          <br>
          <p>S přátelským pozdravem,</p>
          <p><strong>Tým AI Psycholog</strong></p>
          <p><a href="https://www.psychollog.cz">www.psychollog.cz</a></p>
        </div>
      `,
    });
    console.log(`"Registration" email sent to ${email} (user not stored in DB).`);
    
    // Return a response indicating email was sent, but be clear about registration status
    return res.status(200).json({ 
      message: 'Potvrzovací e-mail byl odeslán. Registrace e-mailem a heslem je momentálně ve vývoji.' 
      // We don't return a userId as no user is created in DB
    });

  } catch (error) {
    console.error('Error processing registration request / sending email:', error);
    return res.status(500).json({ message: 'Internal server error during email dispatch.' });
  }
  // No client.close() as no DB client was opened
}
