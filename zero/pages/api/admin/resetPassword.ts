// pages/api/admin/resetPassword.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';   // service-role 클라이언트

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { uid, newPassword } = req.body as { uid: string; newPassword: string };

  if (!uid || !newPassword) return res.status(400).send('uid / newPassword required');

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, {
      password: newPassword,
    });

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}
