import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXT THINKING",
  description: "사단법인 넥스트의 미디어 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >


        <div className="container mx-auto bg-black text-white">   
          <a href="/platform">
            <div className="
                h-[300px]
                relative
                bg-[url(https://mkgpxawmsyiucaitvdgf.supabase.co/storage/v1/object/public/blog-uploads//zerobar.jpg)] 
                mb-10
                mx-auto
            ">

                <div className="absolute inset-0 bg-black opacity-50 z-0 align-center"></div>

                {/* 텍스트 컨텐츠 - z-index를 오버레이보다 높게 설정 */}
                  {/* <div className="relative z-10 flex items-center justify-center h-full">
                  
                      <h1 className="text-5xl font-bold text-white w-f">NEXT THINKING</h1>
                  </div> */}
                
            </div>
            </a>


            {children}



        <div className="h-[300px] mt-10 relative">

          <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
          <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

          <div className="relative z-10 flex justify-right pt-10 ml-10">
              <h1 className="text-l text-white w-f">NEXT group</h1>
          </div>
            
        </div>
        </div>
        
      </body>
    </html>
  );
}
