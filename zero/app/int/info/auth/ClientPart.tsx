// app/int/admin/users/ClientPart.tsx
'use client';

import { useMemo, useState } from 'react';
import Modal from '@/component/Modal';
import EditCheck from '@/component/EditCheck';
import type { User } from '@supabase/supabase-js';

/* ───────── 타입 ───────── */
interface ProfileRow {
  id: string;
  name: string | null;
  department: string | null;
  ismanager?: boolean | null;
}
interface Props {
  authList: User[];      // Supabase Auth user 타입 그대로
  profiles: ProfileRow[];
}

const PAGE_SIZE = 10;

export default function ClientPart({ authList, profiles }: Props) {
  /* 1️⃣ Auth + Profile 병합 */
  const merged = useMemo(() => {
    return authList.map((u) => ({
      ...u,
      profile: profiles.find((p) => p.id === u.id) ?? null,
    }));
  }, [authList, profiles]);

  /* 2️⃣ 검색 & 페이지 */
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    if (!query.trim()) return merged;
    const q = query.toLowerCase();
    return merged.filter((r) => {
      const email = r.email ?? '';
      const name = r.profile?.name ?? '';
      const dept = r.profile?.department ?? '';
      return (
        email.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q)
      );
    });
  }, [merged, query]);
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* 3️⃣ Toast */
  const [toast, setToast] = useState(false);

  /* ────────── 생성 모달 ────────── */
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', name: '', department: '', ismanager: false });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!createForm.email.trim() || !createForm.password.trim()) return alert('이메일·패스워드 입력');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/createUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createForm) });
      if (!res.ok) throw new Error(await res.text());
      setToast(true); setShowCreate(false); location.reload();
    } catch (e:any) { alert(e.message); } finally { setLoading(false); }
  };

  /* ────────── 편집 모달 ────────── */
  const [editRow, setEditRow] = useState<(User & { profile: ProfileRow | null }) | null>(null);
  const [editForm, setEditForm] = useState({ name: '', department: '', ismanager: false });
  const [saving, setSaving] = useState(false);

  const openEdit = (row: User & { profile: ProfileRow | null }) => {
    setEditRow(row);
    setEditForm({
      name: row.profile?.name ?? '',
      department: row.profile?.department ?? '',
      ismanager: !!row.profile?.ismanager,
    });
  };

  const handleUpdate = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/updateProfile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: editRow.id, ...editForm }) });
      if (!res.ok) throw new Error(await res.text());
      setToast(true); setEditRow(null); location.reload();
    } catch (e:any) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!editRow) return;
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/deleteUser?uid=${editRow.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setToast(true); setEditRow(null); location.reload();
    } catch (e:any) { alert(e.message); } finally { setSaving(false); }
  };

  /* ───────── JSX ───────── */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">유저 / 프로필 관리</h1>

      {/* 검색·버튼 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1);}} placeholder="이메일·이름·부서 검색…" className="flex-1 border p-2 rounded" />
        <button onClick={()=>setShowCreate(true)} className="px-4 py-2 bg-[#59bd7b] text-white rounded hover:shadow-sm">새 유저 만들기</button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead><tr><th className="border px-2 py-1">UID</th><th className="border px-2 py-1">이메일</th><th className="border px-2 py-1">이름</th><th className="border px-2 py-1">부서</th><th className="border px-2 py-1">권한</th><th className="border px-2 py-1">가입일</th></tr></thead>
          <tbody>{paged.map(r=>(<tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>openEdit(r)}><td className="border px-2 py-1 truncate max-w-[160px]">{r.id}</td><td className="border px-2 py-1">{r.email??'—'}</td><td className="border px-2 py-1">{r.profile?.name??'—'}</td><td className="border px-2 py-1">{r.profile?.department??'—'}</td><td className="border px-2 py-1">{r.profile?.ismanager?'관리자':'일반'}</td><td className="border px-2 py-1">{new Date(r.created_at).toLocaleDateString()}</td></tr>))}</tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-between items-center mt-4 text-sm"><span>{total===0?'0':`${(page-1)*PAGE_SIZE+1}-${Math.min(page*PAGE_SIZE,total)} / ${total}`}</span><div className="space-x-2"><button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-50">이전</button><button disabled={page*PAGE_SIZE>=total} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded disabled:opacity-50">다음</button></div></div>

      {/* ─── 생성 모달 ─── */}
      {showCreate && (
        <Modal onClose={()=>setShowCreate(false)}>
          <h2 className="text-lg font-semibold mb-4">새 유저 생성</h2>
          <div className="grid gap-3 text-sm">
            <label className="flex flex-col">이메일<input className="border p-2 mt-1" value={createForm.email} onChange={e=>setCreateForm({...createForm,email:e.target.value})}/></label>
            <label className="flex flex-col">패스워드<input type="password" className="border p-2 mt-1" value={createForm.password} onChange={e=>setCreateForm({...createForm,password:e.target.value})}/></label>
            <label className="flex flex-col">이름<input className="border p-2 mt-1" value={createForm.name} onChange={e=>setCreateForm({...createForm,name:e.target.value})}/></label>
            <label className="flex flex-col">부서<input className="border p-2 mt-1" value={createForm.department} onChange={e=>setCreateForm({...createForm,department:e.target.value})}/></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={createForm.ismanager} onChange={e=>setCreateForm({...createForm,ismanager:e.target.checked})}/>관리자 권한</label>
          </div>
          <div className="flex justify-end gap-2 mt-6"><button onClick={()=>setShowCreate(false)} className="border px-4 py-2 rounded">취소</button><button disabled={loading} onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading?'처리 중…':'생성'}</button></div>
        </Modal>
      )}

      {/* ─── 편집 모달 ─── */}
      {editRow && (
        <Modal onClose={()=>setEditRow(null)}>
          <h2 className="text-lg font-semibold mb-4">프로필 수정 / 삭제</h2>
          <div className="grid gap-3 text-sm">
            <label className="flex flex-col">이름<input className="border p-2 mt-1" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/></label>
            <label className="flex flex-col">부서<input className="border p-2 mt-1" value={editForm.department} onChange={e=>setEditForm({...editForm,department:e.target.value})}/></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editForm.ismanager} onChange={e=>setEditForm({...editForm,ismanager:e.target.checked})}/>관리자 권한</label>
          </div>
          <div className="flex justify-between items-center mt-6 text-sm">
            <button onClick={handleDelete} disabled={saving} className="text-red-600 underline">유저 삭제</button>
            <div className="space-x-2">
              <button onClick={()=>setEditRow(null)} className="border px-4 py-1 rounded">취소</button>
              <button onClick={handleUpdate} disabled={saving} className="bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50">저장</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <EditCheck onClose={()=>setToast(false)} />}
    </div>
  );
}
