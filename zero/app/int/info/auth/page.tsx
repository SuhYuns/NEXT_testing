// app/int/admin/users/page.tsx
// ★ server component (no 'use client')

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ClientPart from './ClientPart';

export const revalidate = 0;  // 항상 최신

export default async function AdminUsersPage() {
  /* 1) Auth 유저 목록 */
  const { data: authList, error: authErr } =
    await supabaseAdmin.auth.admin.listUsers();
  if (authErr) throw new Error(authErr.message);

  /* 2) profiles 테이블 */
  const { data: profiles, error: profErr } =
    await supabaseAdmin.from('profiles').select('*');
  if (profErr) throw new Error(profErr.message);

  return <ClientPart authList={authList.users} profiles={profiles} />;
}
