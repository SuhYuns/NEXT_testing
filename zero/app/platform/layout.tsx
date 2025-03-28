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


        <div className="container mx-auto">   
            <div className="
                h-[300px]
                relative 
                bg-cover
                bg-left
                bg-[url(https://www.venturesquare.net/wp-content/uploads/2023/06/%EC%9D%B4%EB%AF%B8%EC%A7%80-%ED%83%84%EC%86%8C%EC%A4%91%EB%A6%BD-%EA%B4%80%EB%A0%A8-%EC%9D%B4%EB%AF%B8%EC%A7%80.jpg)] 
                p-4 mb-10 
                z-0
            ">

                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

                {/* 텍스트 컨텐츠 - z-index를 오버레이보다 높게 설정 */}
                <a href="/platform">
                  <div className="relative z-10 flex items-center justify-center h-full">
                  
                      <h1 className="text-5xl font-bold text-white w-f">NEXT THINKING</h1>
                  </div>
                </a>
                
            </div>


            {children}



        <div className="h-[300px] bg-green-100 mt-10 relative">

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
