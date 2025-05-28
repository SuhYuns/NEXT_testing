'use client';

import { useEffect } from 'react';

export default function ProfilePage() {
  useEffect(() => {
    // sessionStorage에 'reloaded' 플래그가 있는지 확인
    if (!sessionStorage.getItem('reloaded')) {
      // 플래그 설정 후 새로고침
      sessionStorage.setItem('reloaded', 'true');
      window.location.reload();
    } else {
      // 새로고침 후 flag 제거(선택 사항: 다음 방문을 위해 플래그를 제거)
      sessionStorage.removeItem('reloaded');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className='mt-10 mb-15'>
        <h1 className="text-3xl font-bold text-[#59bd7b]">환영합니다.</h1>
        <h1 className="text-3xl font-bold text-[#59bd7b]">사단법인 넥스트입니다.</h1>
        <p className="text-[#3d6d69]">Find the NEXT, envision the realization of a sustainable net-zero economic system</p>
      </div>

      {/* 데스크톱용(640px 이상) */}
      <img
        src="https://mkgpxawmsyiucaitvdgf.supabase.co/storage/v1/object/public/blog-uploads/intro-next-pc.png"
        alt="NEXT 소개 PC"
        className="mx-auto hidden sm:block"
      />

      {/* 모바일용(640px 미만) */}
      <img
        src="https://mkgpxawmsyiucaitvdgf.supabase.co/storage/v1/object/public/blog-uploads/intro-next-mo.png"
        alt="NEXT 소개 Mobile"
        className="mx-auto sm:hidden"
      />

    </main>
  );
}
