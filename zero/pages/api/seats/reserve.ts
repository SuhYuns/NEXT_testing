import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

/**
 * POST /api/seats/reserve
 * body: { seatId: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log('🍪 쿠키 확인:', req.headers.cookie);

  /* ───── 0. 요청 메서드 확인 ───── */
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* ───── 1. 요청 파라미터 확인 ───── */
  const { seatId } = req.body as { seatId?: string };
  if (!seatId) {
    return res.status(400).json({ error: 'seatId가 필요합니다.' });
  }

  /* ───── 2. Supabase 클라이언트 생성 및 세션 확인 ───── */
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  const uid = session.user.id;
  const nowIso = new Date().toISOString();

  /* ───── 3‑a. 요청한 좌석이 이미 예약되어 있는지 확인 ───── */
  const { count: seatOccupied } = await supabase
    .from('profiles')
    .select('*', { head: true, count: 'exact' })
    .eq('current_seat', seatId)
    .gt('current_seat_until', nowIso);

  if (seatOccupied && seatOccupied > 0) {
    return res.status(409).json({ error: '이미 사용 중인 좌석입니다.' });
  }

  /* ───── 3‑b. 요청자가 다른 좌석을 이미 가지고 있는지 확인 ───── */
  const { data: me, error: meErr } = await supabase
    .from('profiles')
    .select('current_seat, current_seat_until')
    .eq('id', uid)
    .single();

  if (meErr) {
    return res.status(500).json({ error: meErr.message });
  }

  if (me?.current_seat && me.current_seat_until! > nowIso) {
    return res.status(409).json({ error: '이미 예약된 좌석이 있습니다.' });
  }

  /* ───── 4. 예약 만료시간 설정 (4시간 후, UTC 기준) ───── */
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4시간 후
  const untilIso = expiresAt.toISOString();

  /* ───── 5. 좌석 정보 업데이트 ───── */
  const { error: updErr } = await supabase
    .from('profiles')
    .update({
      current_seat: seatId,
      current_seat_until: untilIso,
    })
    .eq('id', uid);

  if (updErr) {
    return res.status(500).json({ error: updErr.message });
  }

  /* ───── 6. 성공 응답 ───── */
  return res.status(200).json({ until: untilIso });
}
