// app/int/info/account/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Account {
  idx: string;
  name: string;
  url: string;
  description: string;
  login_pwd: string;
  state: boolean;
  recentChangeDate: string; // 스키마에 맞춰 camelCase 또는 snake_case
  login_id: string;
}

export default function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // 1) 로그인된 유저 꺼내기
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        console.error('로그인 정보 없음', userErr);
        setLoading(false);
        return;
      }

      // 2) accountAccess → account(*) 조인, user 컬럼 필터링
      const { data, error } = await supabase
        .from('accountAccess')
        .select(`
          account:account (
            idx,
            name,
            url,
            description,
            login_pwd,
            state,
            recentChangeDate,
            login_id
          )
        `)
        .eq('user', user.id);

      if (error) {
        console.error('accountAccess 조회 에러', error);
      } else {
        // data 는 [{ account: { ... } }, …]
        setAccounts(data.map((r) => r.account));
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <p>로딩중…</p>;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('클립보드에 복사되었습니다'))
      .catch(() => alert('복사에 실패했습니다'));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">공용계정 리스트</h1>
      <table className="w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">사이트명</th>
            <th className="px-4 py-2 border">설명</th>
            <th className="px-4 py-2 border">아이디</th>
            <th className="px-4 py-2 border">비밀번호</th>
            <th className="px-4 py-2 border">비밀번호 변경일</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acct) => (
            <tr key={acct.idx} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <a href={acct.url} target="_blank" className="text-blue-600 underline">
                  {acct.name}
                </a>
              </td>
              <td className="px-4 py-2 border">{acct.description}</td>
              <td className="px-4 py-2 border">{acct.login_id} 
                <button
                    onClick={() => copyToClipboard(acct.login_id)}
                    className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-2"
                >
                    복사
                </button>
                </td>
              <td className="px-4 py-2 border "><span className='blur-sm hover:blur-none'>{acct.login_pwd}</span>
              <button
                    onClick={() => copyToClipboard(acct.login_pwd)}
                    className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-2"
                >
                    복사
                </button>
              </td>
              <td className="px-4 py-2 border">
                {acct.recentChangeDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
