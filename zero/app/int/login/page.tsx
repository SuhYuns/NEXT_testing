'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('missing email or phone')) {
        setError('⚠️ 이메일을 입력해주세요.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('⚠️ 아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError(error.message);
      }
      return;
    }

    if (data.session) {
      const { access_token, refresh_token, expires_in } = data.session;

      // ✅ Supabase가 필요로 하는 쿠키 설정
      document.cookie = `sb-access-token=${access_token}; path=/; max-age=${expires_in}; SameSite=Lax; Secure`;
      document.cookie = `sb-refresh-token=${refresh_token}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax; Secure`;
    }

    router.refresh();
    router.push('/int');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-10 rounded bg-white shadow-lg">
      <h1 className="text-2xl mt-10 mb-10 text-center">Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="아이디 (email 형식)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-3 p-2 border"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full mb-3 p-2 border"
        />
        {error && <p className="text-red-500 text-center mb-5">{error}</p>}
        <button type="submit" className="bg-[#59bd7b] text-white w-full px-4 py-2 rounded">
          로그인
        </button>

        <p className="text-center mt-5 text-gray-500">계정 생성은 IT 관리자에게 문의하세요</p>
      </form>
    </div>
  );
}
