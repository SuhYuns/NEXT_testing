import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: ['/'] };

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? 'no-host';
  console.log('[middleware] host:', host);

  if (host.endsWith('nextzerobar.org')) {
    return NextResponse.rewrite(new URL('/app/platform', req.url));
  }
  if (host === 'nextgroup.vercel.app') {
    return NextResponse.rewrite(new URL('/app', req.url));
  }
  return NextResponse.next();
}