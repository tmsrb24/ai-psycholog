import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { supabase } from '../../../lib/supabaseClient';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const file = files.avatar?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const fileContent = fs.readFileSync(file.filepath);
      const fileName = `${session.user.id}-${Date.now()}-${file.originalFilename}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileContent, {
          contentType: file.mimetype || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      const avatarUrl = urlData.publicUrl;

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      res.status(200).json({ avatarUrl });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ error: 'Failed to upload avatar', details: error.message });
    }
  });
}
