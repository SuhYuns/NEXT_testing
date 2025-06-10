'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ManagerCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    async function ManagerCheck() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/int/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('ismanager')
        .eq('id', user.id)
        .single();

      if (error || !profile?.ismanager) {
        alert('관리자 권한이 없습니다.');
        router.push('/int');
        return;
      }

      setIsAllowed(true);
      setChecking(false);
    }

    ManagerCheck();
  }, [router]);

  if (checking) {
    return <div className="p-10 text-center text-gray-500">권한 확인 중...</div>;
  }

  return <>{isAllowed ? children : null}</>;
}
