// pages/api/seats/cancel.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ 서버 전용 키 사용!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId가 필요합니다.' });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      imm_seat: null,
      imm_seat_until: null,
    })
    .eq('id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: '자율석 예약이 취소되었습니다.' });
}
