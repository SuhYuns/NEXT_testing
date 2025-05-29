// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';

  if (host === 'nextzerobar.org' || host === 'www.nextzerobar.org') {
    // 리라이트 (주소창은 그대로 '/', 내부에선 /app/platform 렌더)
    return NextResponse.rewrite(new URL('/app/platform', req.url));
  }

  if (host === 'nextgroup.vercel.app') {
    return NextResponse.rewrite(new URL('/app/int', req.url));
  }

  // 그 외는 원래대로 처리
  return NextResponse.next();
}

// 이 미들웨어를 루트 경로에만 적용하고 싶다면 matcher를 걸어줄 수도 있습니다.
// export const config = { matcher: ['/'] }
