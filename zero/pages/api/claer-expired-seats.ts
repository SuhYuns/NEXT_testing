// /pages/api/clear-expired-seats.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // 서비스 키는 꼭 server-side에서만 사용!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nowIso = new Date().toISOString()

  const { error } = await supabase
    .from('profiles')
    .update({ imm_seat: null, imm_seat_until: null })
    .lt('imm_seat_until', nowIso)
    .neq('imm_seat', null)

  if (error) {
    console.error('초기화 실패:', error.message)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ message: '만료된 자율석 초기화 완료' })
}
