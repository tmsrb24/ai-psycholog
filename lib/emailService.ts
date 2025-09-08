import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'noreply@psychollog.cz'; // Použijeme kontaktní email nebo fallback

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email sending will be disabled.');
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!SENDGRID_API_KEY) {
    console.error('Cannot send email: SENDGRID_API_KEY is not configured.');
    return false;
  }

  const msg = {
    to: options.to,
    from: {
      name: 'AI Psychollog',
      email: FROM_EMAIL,
    },
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${options.to} with subject "${options.subject}"`);
    return true;
  } catch (error: any) {
    console.error('Error sending email with SendGrid:', error.response?.body || error.message);
    // error.response?.body?.errors může obsahovat detailnější chyby od SendGridu
    return false;
  }
};

export const sendWelcomeEmail = async (userEmail: string, userName?: string | null): Promise<boolean> => {
  const subject = 'Vítejte v AI Psychollog!';
  const text = `Dobrý den ${userName || 'uživateli'},\n\nVítejte v aplikaci AI Psychollog. Jsme rádi, že jste se k nám připojil/a.\n\nS pozdravem,\nTým AI Psychollog`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Dobrý den ${userName || 'uživateli'},</h2>
      <p>Vítejte v aplikaci <strong>AI Psychollog</strong>!</p>
      <p>Jsme moc rádi, že jste se k nám připojil/a a těšíme se, že vám naše platforma pomůže na vaší cestě k duševní pohodě.</p>
      <p>Můžete začít chatovat s naším AI psychologem, vést si deník, nebo prozkoumat další funkce.</p>
      <p><a href="${process.env.NEXTAUTH_URL || 'https://www.psychollog.cz'}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Přejít do aplikace</a></p>
      <br>
      <p>S přátelským pozdravem,</p>
      <p><em>Tým AI Psychollog</em></p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  });
};
