// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

/**
 * service-role key 로 만드는 Admin 전용 Supabase 클라이언트
 *  - .auth.admin.*  (유저 생성·삭제·리스트) 가능
 *  - Edge Runtime X → pages/api (Node) 또는 server component 내에서만 사용
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,      // 반드시 서버 환경변수
  {
    auth: { persistSession: false },
  },
);
