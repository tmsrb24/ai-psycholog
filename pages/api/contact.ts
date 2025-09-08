import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../lib/emailService';

const TARGET_EMAIL = process.env.CONTACT_FORM_TARGET_EMAIL || 'info@psychollog.cz';
const FROM_EMAIL_CONTACT_FORM = process.env.CONTACT_FORM_FROM_EMAIL || 'formular@psychollog.cz'; // Musí být z ověřené domény na SendGrid

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Chybí povinné údaje ve formuláři.' });
  }

  // Validace emailu (jednoduchá)
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Neplatná emailová adresa.' });
  }

  const emailSubjectToAdmin = `Nový dotaz z kontaktního formuláře: ${subject}`;
  const emailTextToAdmin = `
    Jméno: ${name}
    Email odesílatele: ${email}
    Předmět: ${subject}
    Zpráva:
    ${message}
  `;
  const emailHtmlToAdmin = `
    <p>Dobrý den,</p>
    <p>obdrželi jste novou zprávu z kontaktního formuláře na webu psychollog.cz:</p>
    <hr>
    <p><strong>Jméno:</strong> ${name}</p>
    <p><strong>Email odesílatele:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Předmět:</strong> ${subject}</p>
    <p><strong>Zpráva:</strong></p>
    <div style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9;">
      ${message.replace(/\n/g, '<br>')}
    </div>
    <hr>
    <p>Prosím, odpovězte přímo na email odesílatele.</p>
  `;

  try {
    const emailSent = await sendEmail({
      to: TARGET_EMAIL,
      subject: emailSubjectToAdmin,
      text: emailTextToAdmin,
      html: emailHtmlToAdmin,
      replyTo: email,
    });

    if (emailSent) {
      // Volitelně: Odeslat potvrzovací email odesílateli
      // const subjectToUser = "Váš dotaz byl přijat | AI Psychollog";
      // const textToUser = `Dobrý den ${name},\n\nděkujeme za Vaši zprávu. Co nejdříve se Vám ozveme.\n\nS pozdravem,\nTým AI Psychollog`;
      // const htmlToUser = `<p>Dobrý den ${name},</p><p>děkujeme za Vaši zprávu. Co nejdříve se Vám ozveme.</p><p>S pozdravem,<br>Tým AI Psychollog</p>`;
      // await sendEmail({ to: email, subject: subjectToUser, text: textToUser, html: htmlToUser });
      
      return res.status(200).json({ message: 'Zpráva úspěšně odeslána.' });
    } else {
      throw new Error('SendGrid selhal při odesílání emailu.');
    }
  } catch (error) {
    console.error('Chyba při odesílání kontaktního formuláře:', error);
    return res.status(500).json({ message: 'Chyba serveru při odesílání zprávy.' });
  }
}
