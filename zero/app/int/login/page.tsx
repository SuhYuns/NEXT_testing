'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase'; // ✅ 기존 방식 유지!

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 에러 메시지 가공
      if (error.message.includes('missing email or phone')) {
        setError('⚠️ 이메일을 입력해주세요.'); // 🔁 여기서 커스터마이징
      } else if (error.message.includes('Invalid login credentials')) {
        setError('⚠️ 아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError(error.message); // 기본 메시지도 fallback으로 제공
      }
      return;
    }

    router.push('/int');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
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

        <p className='text-center mt-5 text-gray-500'>계정 생성은 IT 관리자에게 문의하세요</p>
      </form>
    </div>
  );
}
