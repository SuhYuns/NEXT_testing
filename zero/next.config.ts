// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // nextzerobar.org (+ www) → /app/platform
      {
        source: '/',
        has: [
          { type: 'host', value: 'nextzerobar.org' },
        ],
        destination: '/app/platform',
      },
      {
        source: '/',
        has: [
          { type: 'host', value: 'www.nextzerobar.org' },
        ],
        destination: '/app/platform',
      },

      // nextgroup.vercel.app → /app/int
      {
        source: '/',
        has: [
          { type: 'host', value: 'nextgroup.vercel.app' },
        ],
        destination: '/app/int',
      },
    ]
  },

  // 만약 URL 자체를 바꿔서(redirect) 보내고 싶다면
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       has: [{ type: 'host', value: 'nextzerobar.org' }],
  //       destination: '/app/platform',
  //       permanent: false,   // 307 Temporary Redirect
  //     },
  //     {
  //       source: '/',
  //       has: [{ type: 'host', value: 'www.nextzerobar.org' }],
  //       destination: '/app/platform',
  //       permanent: false,
  //     },
  //     {
  //       source: '/',
  //       has: [{ type: 'host', value: 'nextgroup.vercel.app' }],
  //       destination: '/app/int',
  //       permanent: false,
  //     },
  //   ]
  // },
}

export default nextConfig
