// pages/api/admin/createUser.ts  (App Router라면 app/api/.. route.ts)
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password, name, department, ismanager } = req.body as {
    email: string;
    password: string;
    name: string;
    department: string;
    ismanager: boolean;
  };

  try {
    /* 1) Auth 유저 생성 */
    const { data: user, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (authErr || !user) throw authErr || new Error('user null');

    const uid = user.user?.id!;
    /* 2) profiles 행 삽입 */
    const { error: profErr } = await supabaseAdmin.from('profiles').insert([
      {
        id: uid,
        name,
        department,
        ismanager,
      },
    ]);
    if (profErr) throw profErr;

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}
