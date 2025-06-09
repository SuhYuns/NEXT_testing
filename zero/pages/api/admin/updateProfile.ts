import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { uid, name, department, ismanager, isinit } = req.body as {
    uid: string;
    name: string;
    department: string;
    ismanager: boolean;
    isinit: boolean;
  };

  if (!uid) return res.status(400).send('uid required');

  try {
    /* profiles 테이블 업데이트 */
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ name, department, ismanager, isinit })
      .eq('id', uid);

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}
