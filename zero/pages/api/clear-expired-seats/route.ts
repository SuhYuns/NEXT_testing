// app/api/clear-expired-seats/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 서버 전용 Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  const nowIso = new Date().toISOString()

  const { error } = await supabase
    .from('profiles')
    .update({ imm_seat: null, imm_seat_until: null })
    .lt('imm_seat_until', nowIso)
    .neq('imm_seat', null)

  if (error) {
    console.error('초기화 실패:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '만료된 자율석 초기화 완료' }, { status: 200 })
}
