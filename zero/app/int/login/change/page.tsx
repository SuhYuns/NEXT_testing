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
      <h1 className="text-2xl font-bold">최초로 로그인 하셨군요! 환영합니다 👏</h1>
      <h1 className="text-2xl font-bold">비밀번호를 변경해 주세요 👏</h1>
    </main>
  );
}
