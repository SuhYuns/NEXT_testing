'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export default function PlatformAnalytics() {
  const pathname      = usePathname();
  const searchParams  = useSearchParams();

  const queryString = searchParams?.toString() ?? '';

  useEffect(() => {
    if (!GA_ID) return;
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    window.gtag?.('config', GA_ID, { page_path: url });
  }, [pathname, queryString]);     
  
  return null;
}
