// zero/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: ['/'] };

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';

  if (host.endsWith('nextzerobar.org')) {
    // ‘app’ 폴더 제거
    return NextResponse.rewrite(new URL('/platform' + req.nextUrl.search, req.url));
  }

  if (host === 'nextgroup.vercel.app') {
    return NextResponse.rewrite(new URL('/int' + req.nextUrl.search, req.url));
  }

  return NextResponse.next();
}
