// pages/api/seats/cancel.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createPagesServerClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      current_seat: null,
      current_seat_until: null,
    })
    .eq('id', session.user.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: '예약이 취소되었습니다.' });
}
