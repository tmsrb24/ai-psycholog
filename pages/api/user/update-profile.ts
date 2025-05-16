import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { MongoClient, ObjectId } from 'mongodb';

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

  // Get the session to verify the user is authenticated
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Get user data from request body
  const { name, email } = req.body;

  // Validate user data
  if (!name || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Connect to MongoDB
  let client;
  try {
    client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if email is already taken by another user
    if (email !== session.user?.email) {
      const existingUser = await usersCollection.findOne({ 
        email,
        _id: { $ne: new ObjectId(session.user?.id as string) }
      });
      
      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }

    // Update user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(session.user?.id as string) },
      { 
        $set: {
          name,
          email,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return success response
    return res.status(200).json({
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
