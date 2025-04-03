'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UserInfo() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);

  // 로그인한 유저 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        // 로그인 안 되어 있으면 login 페이지로 이동
        router.push('/int/login');
      }

      
    };

    fetchUser();
  }, [router]);

  // 로그아웃 처리
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/int/login'); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      {user ? (
        <div className="border p-4 rounded shadow">
          <p className="text-xl mb-2">
            👋 안녕하세요, <strong>{user.email}</strong>님!
          </p>
          <p className="text-sm text-gray-500 mb-4">
            유저 ID: {user.id}
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <p>로그인 정보를 불러오는 중...</p>
      )}
    </div>
  );
}

