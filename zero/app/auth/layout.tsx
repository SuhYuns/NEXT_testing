

import AuthProvider from "./SessionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> {/* ✅ 서버 컴포넌트에서 클라이언트 컴포넌트로 전달 */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
