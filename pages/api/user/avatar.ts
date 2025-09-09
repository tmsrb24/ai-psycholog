import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable from 'formidable';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';
import fs from 'fs';

const supabase = getSupabaseAdmin();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const avatarFile = files.avatar?.[0];
    if (!avatarFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const fileContent = await fs.promises.readFile(avatarFile.filepath);
      const fileName = `${session.user.id}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileContent, {
          contentType: avatarFile.mimetype || 'image/jpeg',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      await supabase
        .from('users')
        .update({ image: publicUrl })
        .eq('id', session.user.id);

      res.status(200).json({ message: 'Avatar updated successfully', url: publicUrl });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading file' });
    }
  });
}