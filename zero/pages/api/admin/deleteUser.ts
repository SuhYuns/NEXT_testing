// pages/api/admin/deleteUser.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // service-role 클라이언트

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const uid = req.query.uid as string | undefined;
  if (!uid) return res.status(400).send('uid query param required');

  try {
    /* 1) Auth 유저 삭제 */
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (authErr) throw authErr;

    /* 2) profiles 행 삭제 */
    const { error: profErr } = await supabaseAdmin.from('profiles').delete().eq('id', uid);
    if (profErr) throw profErr;

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}
