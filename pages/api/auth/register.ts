import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-psycholog";
const options = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get user data from request body
  const { name, email, password } = req.body;

  // Validate user data
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // Connect to MongoDB
  let client;
  try {
    client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user into database
    const result = await usersCollection.insertOne(user);

    // Send confirmation email
    if (result.insertedId) {
      try {
        await resend.emails.send({
          from: 'AI Psycholog <noreply@psychollog.cz>',
          to: [email],
          subject: 'Vítejte v AI Psycholog!',
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Vítejte v AI Psycholog, ${name}!</h2>
              <p>Děkujeme Vám za registraci na naší platformě.</p>
              <p>Jsme rádi, že jste se k nám připojil/a a těšíme se, až začnete využívat naše služby pro podporu Vaší psychické pohody.</p>
              <p>Pokud máte jakékoli dotazy, neváhejte nás kontaktovat.</p>
              <br>
              <p>S přátelským pozdravem,</p>
              <p><strong>Tým AI Psycholog</strong></p>
              <p><a href="https://www.psychollog.cz">www.psychollog.cz</a></p>
            </div>
          `,
        });
        console.log(`Registration email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending registration email:', emailError);
        // Do not block registration if email fails, but log the error
      }
    }

    // Return success response
    return res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertedId,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
