// app/int/info/account/all/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import EditCheck from '@/component/EditCheck';
import Modal from '@/component/Modal';
import { useRouter } from 'next/navigation';

// ───────────────── 타입 & 상수 ─────────────────
interface AccountRow {
  idx: string;
  name: string;
  url: string | null;
  description: string | null;
  login_id: string | null;
  login_pwd: string | null;
  recentChangeDate: string | null;
}

interface ProfileRow {
  id: string;
  name: string | null;
  department: string | null;
}

const PAGE_SIZE = 10;

// ───────────────── 페이지 컴포넌트 ─────────────────
export default function AllAccountsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<AccountRow | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());

  // ───────── 계정 목록 fetch ─────────
  const fetchAccounts = useCallback(async () => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase.from('account').select('*', { count: 'exact' });
    if (query.trim()) q = q.ilike('name', `%${query.trim()}%`);

    const { data, count, error } = await q.range(from, to);
    if (error) return alert('계정 조회 실패: ' + error.message);

    setRows(data as AccountRow[]);
    setTotal(count ?? 0);
  }, [page, query]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">전체 계정 관리</h1>

      {/* 검색 */}
      <div className="flex items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="사이트명을 입력하세요…"
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={() => router.back()}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          ← 돌아가기
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1 w-1/4">사이트명</th>
              <th className="border px-2 py-1">URL</th>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">최근 변경</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.idx}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setEditing(r)}
              >
                <td className="border px-2 py-1">{r.name}</td>
                <td className="border px-2 py-1 truncate max-w-xs">{r.url}</td>
                <td className="border px-2 py-1">{r.login_id}</td>
                <td className="border px-2 py-1">
                  {r.recentChangeDate
                    ? new Date(r.recentChangeDate).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          {total === 0
            ? '0'
            : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} / ${total}`}
        </span>
        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <button
            disabled={page * PAGE_SIZE >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>

      {/* 편집 모달 */}
      {editing && (
        <EditAccountModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={fetchAccounts}
          selectedProfiles={selectedProfiles}
          setSelectedProfiles={setSelectedProfiles}
        />
      )}
    </div>
  );
}

// ───────────────────────── 계정 편집 모달 ─────────────────────────
function EditAccountModal({
  initial,
  onClose,
  onSaved,
  selectedProfiles,
  setSelectedProfiles,
}: {
  initial: AccountRow;
  onClose: () => void;
  onSaved: () => void;
  selectedProfiles: Set<string>;
  setSelectedProfiles: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [form, setForm] = useState<AccountRow>(initial);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [deptMap, setDeptMap] = useState<Record<string, ProfileRow[]>>({});
  const [toast, setToast] = useState(false);

  // ───────── helper: 부서별 map 구축 ─────────
  const buildDeptMap = (list: ProfileRow[]) => {
    const map: Record<string, ProfileRow[]> = {};
    list.forEach((p) => {
      const dept = p.department ?? '기타';
      if (!map[dept]) map[dept] = [];
      map[dept].push(p);
    });
    return map;
  };

  // 사용자 목록 + 기존 접근권한 로드
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('id,name,department').order('name');
      const profs = (data || []) as ProfileRow[];
      setProfiles(profs);
      setDeptMap(buildDeptMap(profs));

      const { data: access } = await supabase
        .from('accountAccess')
        .select('user')
        .eq('account', initial.idx);
      setSelectedProfiles(new Set(access?.map((r) => r.user)));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.idx]);

  // ───────── 개별/부서 토글 ─────────
  const toggleProfile = (uid: string) =>
    setSelectedProfiles((prev) => {
      const s = new Set(prev);
      s.has(uid) ? s.delete(uid) : s.add(uid);
      return s;
    });

  const toggleDepartment = (dept: string) =>
    setSelectedProfiles((prev) => {
      const ids = (deptMap[dept] || []).map((p) => p.id);
      const allSelected = ids.every((id) => prev.has(id));
      const s = new Set(prev);
      ids.forEach((id) => {
        allSelected ? s.delete(id) : s.add(id);
      });
      return s;
    });

  // ───────── 저장 ─────────
  const save = async () => {
    const { error: accErr } = await supabase
      .from('account')
      .update({
        name: form.name,
        url: form.url,
        description: form.description,
        login_id: form.login_id,
        login_pwd: form.login_pwd,
        recentChangeDate: new Date().toISOString().slice(0, 10),
      })
      .eq('idx', form.idx);
    if (accErr) return alert('계정 저장 실패: ' + accErr.message);

    await supabase.from('accountAccess').delete().eq('account', form.idx);
    if (selectedProfiles.size) {
      const arr = Array.from(selectedProfiles).map((uid) => ({ account: form.idx, user: uid }));
      const { error: aaErr } = await supabase.from('accountAccess').insert(arr);
      if (aaErr) return alert('권한 저장 실패: ' + aaErr.message);
    }

    setToast(true);
    onSaved();
  };

  // ───────── 렌더 ─────────
  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">계정 수정</h3>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label>
          사이트명
          <input
            className="border p-1 w-full mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          URL
          <input
            className="border p-1 w-full mt-1"
            value={form.url ?? ''}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
        </label>
        <label className="col-span-2">
          설명
          <textarea
            rows={2}
            className="border p-1 w-full mt-1"
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label>
          로그인 ID
          <input
            className="border p-1 w-full mt-1"
            value={form.login_id ?? ''}
            onChange={(e) => setForm({ ...form, login_id: e.target.value })}
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            className="border p-1 w-full mt-1"
            value={form.login_pwd ?? ''}
            onChange={(e) => setForm({ ...form, login_pwd: e.target.value })}
          />
        </label>
      </div>

      {/* ── 부서별 토글 ── */}
      <h4 className="mt-4 font-medium text-sm">부서별 선택</h4>
      <div className="flex flex-wrap gap-3 mb-3 text-sm">
        {Object.entries(deptMap).map(([dept, list]) => {
          const allSelected = list.every((pr) => selectedProfiles.has(pr.id));
          return (
            <label key={dept} className="flex items-center">
              <input
                type="checkbox"
                className="mr-1"
                checked={allSelected}
                onChange={() => toggleDepartment(dept)}
              />
              {dept} ({list.length})
            </label>
          );
        })}
      </div>

      {/* 접근 권한 - 개별 */}
      <div className="border p-2 max-h-40 overflow-y-auto text-sm">
        {profiles.map((p) => (
          <label key={p.id} className="flex items-center mb-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={selectedProfiles.has(p.id)}
              onChange={() => toggleProfile(p.id)}
            />
            {p.name || p.id} <span className="ml-1 text-gray-400">({p.department ?? '기타'})</span>
          </label>
        ))}
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end space-x-2 mt-5">
        <button className="px-3 py-1 border rounded" onClick={onClose}>
          취소
        </button>
        <button className="px-4 py-1 bg-green-600 text-white rounded" onClick={save}>
          저장
        </button>
      </div>

      {/* ✅ 수정 완료 토스트 */}
      {toast && <EditCheck onClose={() => setToast(false)} />}
    </Modal>
  );
}
