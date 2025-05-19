import type { NextApiRequest, NextApiResponse } from 'next';
// import { MongoClient } from 'mongodb'; // MongoDB not used for now
// import bcrypt from 'bcryptjs'; // Bcrypt not used if not storing passwords
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
}

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
  // This endpoint will only attempt to send a welcome email if Resend is configured.

  if (!resend) {
    console.error('Resend client is not initialized. RESEND_API_KEY might be missing.');
    // Still return a "success" to the client as user data was validated, but email part failed.
    // Or, decide if this should be a server error. For now, let's inform about email part.
    return res.status(200).json({ 
      message: 'Žádost o registraci přijata. Problém s konfigurací odesílání e-mailů. Kontaktujte podporu.',
      emailSent: false
    });
  }

  try {
    const { data, error: emailSendError } = await resend.emails.send({
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

    if (emailSendError) {
      console.error('Error sending registration email:', JSON.stringify(emailSendError, null, 2));
      return res.status(500).json({ message: 'Chyba při odesílání potvrzovacího e-mailu.', errorDetail: emailSendError.message, emailSent: false });
    }
    
    console.log(`"Registration" email sent to ${email} with ID ${data?.id} (user not stored in DB).`);
    
    return res.status(200).json({ 
      message: 'Potvrzovací e-mail byl odeslán. Registrace e-mailem a heslem je momentálně ve vývoji.',
      emailSent: true,
      emailId: data?.id
    });

  } catch (error) { // Catch any other unexpected errors
    console.error('Unexpected error in registration request / sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba serveru.';
    return res.status(500).json({ message: 'Interní chyba serveru při odesílání e-mailu.', errorDetail: errorMessage, emailSent: false });
  }
}
