// app/int/info/account/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/component/Modal';

interface Profile {
  id: string;
  name: string | null;
}

interface Account {
  idx: string;
  name: string;
  url: string;
  description: string;
  login_id: string;
  login_pwd: string;
  state: boolean;
  recentChangeDate: string | null;
}

export default function AccountPage() {
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 신규 계정 폼 상태
  const [form, setForm] = useState({
    name: '',
    url: '',
    description: '',
    login_id: '',
    login_pwd: '',
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());

  // 1) 내 프로필 가져와서 ismanager 체크, 전체 account & profiles 불러오기
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 내 profiles
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('ismanager')
        .eq('id', user.id)
        .single();
      setIsManager(myProfile?.ismanager ?? false);

      // 전체 계정 목록
    //   const { data: accs } = await supabase
    //     .from('account')
    //     .select('*')
    //     .order('name');
    //   setAccountList(accs || []);

    const { data: accessRows, error: aaErr } = await supabase
    .from('accountAccess')
    .select('account')
    .eq('user', user.id);
    if (aaErr) {
    console.error('accountAccess 조회 에러:', aaErr.message);
    return;
    }
    const accountIds = accessRows?.map((r) => r.account) || [];

    // accountIds 배열이 비어있으면 빈 리스트로
    if (accountIds.length === 0) {
    setAccountList([]);
    } else {
    const { data: accs, error: accErr } = await supabase
        .from('account')
        .select('*')
        .in('idx', accountIds)
        .order('name');
    if (accErr) {
        console.error('계정 목록 조회 에러:', accErr.message);
        return;
    }
    setAccountList(accs || []);
    }

      // 전체 프로필 (for 선택)
      const { data: profs } = await supabase
        .from('profiles')
        .select('id,name')
        .order('name');
      setProfiles(profs || []);
    };
    init();
  }, []);

  // 체크박스 토글
  const toggleProfile = (pid: string) => {
    setSelectedProfiles(prev => {
      const s = new Set(prev);
      if (s.has(pid)) s.delete(pid);
      else s.add(pid);
      return s;
    });
  };

  // 모달 제출 핸들러
  const handleCreate = async () => {
    // 2-1) account insert
    const { data: newAcc, error: accErr } = await supabase
      .from('account')
      .insert([{
        name: form.name,
        url: form.url,
        description: form.description,
        login_id: form.login_id,
        login_pwd: form.login_pwd,
        state: true,
        recentChangeDate: new Date().toISOString(),
      }])
      .select('idx')
      .single();
    if (accErr || !newAcc?.idx) {
      alert('계정 생성 실패: ' + accErr?.message);
      return;
    }

    const accountId = newAcc.idx;

    // 2-2) 선택된 프로필만큼 accountAccess insert
    const inserts = Array.from(selectedProfiles).map(pid => ({
      account: accountId,
      user: pid,
    }));
    const { error: aaErr } = await supabase
      .from('accountAccess')
      .insert(inserts);
    if (aaErr) {
      alert('계정 접근 권한 부여 실패: ' + aaErr.message);
      return;
    }

    // 재로딩
    const { data: accs } = await supabase
      .from('account')
      .select('*')
      .order('name');
    setAccountList(accs || []);

    // 닫고 초기화
    setShowModal(false);
    setForm({ name:'', url:'', description:'', login_id:'', login_pwd:'' });
    setSelectedProfiles(new Set());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('클립보드에 복사되었습니다'))
      .catch(() => alert('복사에 실패했습니다'));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">공용 계정 관리</h1>

      {isManager && (
        <button
          onClick={() => setShowModal(true)}
          className="mb-4 px-4 py-2 bg-[#59bd7b] text-white rounded hover:shadow-sm"
        >
          계정 등록
        </button>
      )}

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">사이트명</th>
            <th className="border px-4 py-2">설명</th>
            <th className="border px-4 py-2">아이디</th>
            <th className="border px-4 py-2">비밀번호</th>
            <th className="border px-4 py-2">최근 변경일</th>
          </tr>
        </thead>
        <tbody>
          {accountList.map(ac => (
            <tr key={ac.idx}>
              <td className="border px-4 py-2">{ac.name}</td>
              <td className="border px-4 py-2">{ac.description}</td>
              <td className="px-4 py-2 border">{ac.login_id} 
                <button
                    onClick={() => copyToClipboard(ac.login_id)}
                    className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-2"
                >
                    복사
                </button>
                </td>
              <td className="px-4 py-2 border "><span className='blur-sm hover:blur-none'>{ac.login_pwd}</span>
              <button
                    onClick={() => copyToClipboard(ac.login_pwd)}
                    className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-2"
                >
                    복사
                </button>
              </td>
              <td className="border px-4 py-2">
                {ac.recentChangeDate
                  ? new Date(ac.recentChangeDate).toLocaleDateString()
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- 등록 모달 --- */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-bold mb-4">새 계정 등록</h2>

          <div className="grid grid-cols-2 gap-4">
            <label>
              사이트명
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border p-2"
              />
            </label>
            <label>
              URL
              <input
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                className="mt-1 w-full border p-2"
              />
            </label>
            <label className="col-span-2">
              설명
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full border p-2"
                rows={3}
              />
            </label>
            <label>
              로그인 ID
              <input
                value={form.login_id}
                onChange={e => setForm(f => ({ ...f, login_id: e.target.value }))}
                className="mt-1 w-full border p-2"
              />
            </label>
            <label>
              비밀번호
              <input
                value={form.login_pwd}
                onChange={e => setForm(f => ({ ...f, login_pwd: e.target.value }))}
                className="mt-1 w-full border p-2"
                type="password"
              />
            </label>
          </div>

          <h3 className="mt-6 font-semibold">접근 권한 부여할 사용자 선택</h3>
          <div className="max-h-60 overflow-y-auto border p-2 mt-2">
            {profiles.map(p => (
              <label key={p.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={selectedProfiles.has(p.id)}
                  onChange={() => toggleProfile(p.id)}
                  className="mr-2"
                />
                {p.name || p.id}
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              취소
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              등록하기
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
