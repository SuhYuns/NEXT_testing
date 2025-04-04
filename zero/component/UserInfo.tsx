'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  name: string;
  department: string;
  position: string;
  code: string;
  ismanager: boolean;
  isinit: boolean;
  isused: boolean;
  created_at: string;
}

export default function UserInfo() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  // 별도의 함수로 프로필 조회
  const fetchProfile = async (user: any) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError) {
      console.error('프로필 가져오기 에러:', profileError.message);
    } else {
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // 최초 유저 정보 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        fetchProfile(user);
      }
    });

    // onAuthStateChange 이벤트 리스너 추가
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
          router.push('/int/login');
        }
      }
    );

    // 클린업: 리스너 해제
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/int/login');
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-end p-3 pr-10 bg-white shadow">
        <span className="mr-4">로그인이 필요합니다</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end p-3 pr-10 bg-white shadow">
      <span className="mr-4">
        👋 안녕하세요, <strong>{profile.name}</strong>님
      </span>
      <button
        onClick={handleLogout}
        className="p-1 px-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        logout
      </button>
    </div>
  );
}
