// 📁 pages/api/uploadImage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { IncomingForm, File as FormidableFile } from 'formidable';

// Disable Next.js default body parsing for Formidable
export const config = { api: { bodyParser: false } };

// Admin client using Service Role key for RLS bypass
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Handles POST /api/uploadImage?folder=thumbnails|content
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Determine folder from query string
  const folder = Array.isArray(req.query.folder)
    ? req.query.folder[0]
    : (req.query.folder as string);
  if (!folder) return res.status(400).json({ error: 'folder query param is required' });

  // Parse multipart form
  const form = new IncomingForm();
  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    // files.file can be a single File or array of Files
    const fileField = files.file;
    if (!fileField) return res.status(400).json({ error: 'No file uploaded' });
    const file = Array.isArray(fileField)
      ? fileField[0] as FormidableFile
      : fileField as FormidableFile;

    try {
      // Sanitize filename
      const safeName = (file.originalFilename ?? 'file')
        .replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `${folder}/${Date.now()}_${safeName}`;

            // Read file into buffer to avoid duplex error in Node fetch
      const fileData = await fs.promises.readFile(file.filepath);
      const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
        .upload(filePath, fileData, { upsert: false });
      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
        .getPublicUrl(uploadData.path);
      if (!urlData?.publicUrl) throw new Error('Unable to retrieve public URL');

      return res.status(200).json({ url: urlData.publicUrl });
    } catch (uploadError: any) {
      console.error(uploadError);
      return res.status(500).json({ error: uploadError.message });
    }
  });
}