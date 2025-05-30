import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CopyableEmail from '../../component/CopyableEmail';
import PlatformAnalytics from './analytics'; 
import Script from 'next/script';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZERO ENERGY BAR BLOG",
  description: "사단법인 넥스트의 미디어 블로그",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>

            <Suspense fallback={null}>              
              <PlatformAnalytics />
            </Suspense>
          </>
        )}


        <div className="container mx-auto bg-black px-0 max-w-none text-white">

          <div>
            <div className="flex justify-end items-center gap-4 pt-5 pb-5 mr-2 sm:mr-5 ">
              <a href="/platform">
                <p className="text-[#3d6d69] text-sm sm:text-base hover:opacity-75">ZERO ENERGY BAR BLOG</p>
              </a>
              <a href="https://www.youtube.com/@zeroenergybar" target="_black" className="hover:opacity-75"><img src="/blog/top_link4.png" className="w-6"/></a>
            </div>
            
            <a href="/platform" className="site-header">
              <div className="
                  h-[300px]
                  w-auto
                  bg-[url('https://mkgpxawmsyiucaitvdgf.supabase.co/storage/v1/object/public/blog-uploads/zerobar.jpg')]
                  bg-center    /* 수평·수직 중앙 정렬 */
                  bg-cover     /* 비율 유지하며 가득 채우기 */
                  bg-no-repeat /* 반복 방지 *
              ">
              </div>
            </a>
          </div>
          
          <div className="bg-black py-5 site-header">


          {/* <div className="flex justify-end items-center gap-2 mr-5">
            
            <div className="p-2 flex items-center bg-gray-800 justify-center hover:opacity-75">
              <Link href="/platform/write">
                <span className="text-center text-white text-sm">✏️</span>
              </Link>
            </div>
            <div className="p-2 flex items-center bg-gray-800 justify-center hover:opacity-75">
              <Link href="/platform/manage">
                <span className="text-center text-white text-sm">⚙️</span>
              </Link>
            </div>
          </div> */}
          </div>


            {children}



        <div className="h-[250px] mt-20 relative">

          <div className="flex justify-between text-white m-5 text-xs">
            <div>
              <div className="flex items-center gap-4 mr-5 pt-5 pb-5">
                <a href="https://nextgroup.or.kr/" target="_black" className="hover:opacity-75"><img src="/blog/top_link1.png" className="w-6"/></a>
                <a href="https://www.linkedin.com/company/next-group-korea/" target="_black" className="hover:opacity-75"><img src="/blog/top_link2.png" className="w-6"/></a>
                <a href="https://t.me/NEXTGroup2050" target="_black" className="hover:opacity-75"><img src="/blog/top_link3.png" className="w-6"/></a>
                <a href="https://www.youtube.com/@zeroenergybar" target="_black" className="hover:opacity-75"><img src="/blog/top_link4.png" className="w-6"/></a>
              </div> 
              <p className="mb-6 font-bold">NEXT group</p>
              
              <p>서울 강남구 봉은사로 213</p>
              <p>센트럴타워 8-9 층</p>
              <p className="text-[#3d6d69]">COPYRIGHT 2025, NEXT GROUP, ALL RIGHTS RESERVED</p>

            </div>
            <div className="mt-5">
              <h3 className="text-base font-bold mb-2">Contact</h3>

              <div>
                <p>미디어 협업 질문</p>
                <CopyableEmail email="media@nextgroup.or.kr" />
              </div>
              <div>
                <p>기타 문의</p>
                <CopyableEmail email="contact@nextgroup.or.kr" />
              </div>
            </div>
          </div>
            
        </div>
        </div>
        
      </body>
    </html>
  );
}
