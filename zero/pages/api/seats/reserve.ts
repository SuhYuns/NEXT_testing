import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// 직접 Supabase 클라이언트 생성 (서비스 역할 키 X, 인증 없이 사용 가능)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { seatId, userId } = req.body as { seatId?: string; userId?: string };
  if (!seatId || !userId) {
    return res.status(400).json({ error: 'seatId와 userId가 필요합니다.' });
  }

  const nowIso = new Date().toISOString();

  // 1. 해당 좌석이 고정석 or 자율석으로 이미 예약되어 있는지 확인
  const { count: seatInUse, error: seatErr } = await supabase
    .from('profiles')
    .select('*', { head: true, count: 'exact' })
    .or(`current_seat.eq.${seatId},and(imm_seat.eq.${seatId},imm_seat_until.gt.${nowIso})`);

  if (seatErr) {
    return res.status(500).json({ error: seatErr.message });
  }

  if (seatInUse && seatInUse > 0) {
    return res.status(409).json({ error: '이미 사용 중인 좌석입니다.' });
  }

  // 2. 유저가 이미 자율석을 예약 중인지 확인
  const { data: me, error: meErr } = await supabase
    .from('profiles')
    .select('imm_seat, imm_seat_until')
    .eq('id', userId)
    .single();

  if (meErr) {
    return res.status(500).json({ error: meErr.message });
  }

  if (me?.imm_seat && me.imm_seat_until > nowIso) {
    return res.status(409).json({ error: '이미 자율석을 예약 중입니다.' });
  }

  // 3. 예약 처리 (4시간 후 만료)
  const untilIso = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      imm_seat: seatId,
      imm_seat_until: untilIso,
    })
    .eq('id', userId);

  if (updateErr) {
    return res.status(500).json({ error: updateErr.message });
  }

  return res.status(200).json({ until: untilIso });
}
