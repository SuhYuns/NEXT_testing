'use client'; // Next.js 13 이상에서 클라이언트 컴포넌트로 명시해야 함

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = 'https://www.nextgroup.or.kr';
  }, []);

  return (
    <div>
      {/* 이동 중일 때 보여줄 메시지나 로딩 스피너 등 */}
      <div>NEXT group</div>
    </div>
  );
}
