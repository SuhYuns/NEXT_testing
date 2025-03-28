import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app"; // ✅ Next.js의 AppProps 타입을 가져옴

export default function MyApp({ Component, pageProps }: AppProps) { // ✅ 올바른 타입 지정
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
