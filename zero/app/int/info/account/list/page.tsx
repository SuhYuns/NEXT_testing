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

  /* ───── 목록 & 검색 상태 ───── */
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<AccountRow | null>(null);

  /* ───── 계정 등록 모달 상태 ───── */
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', description: '', login_id: '', login_pwd: '' });

  /* ───── 프로필 & 권한 상태 ───── */
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [deptMap, setDeptMap] = useState<Record<string, ProfileRow[]>>({});
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());

  /* ───── 공통 Toast ───── */
  const [toast, setToast] = useState(false);

  /* ───── 1. 계정 목록 fetch ───── */
  const fetchAccounts = useCallback(async () => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase.from('account').select('*', { count: 'exact' });
    if (query.trim()) q = q.ilike('name', `%${query.trim()}%`);

    const { data, count, error } = await q.range(from, to);
    if (error) return alert(`계정 조회 실패: ${error.message}`);

    setRows(data as AccountRow[]);
    setTotal(count ?? 0);
  }, [page, query]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  /* ───── 2. 프로필 목록 fetch ───── */
  const loadProfiles = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('id,name,department').order('name');
    if (error) return alert(`프로필 로드 실패: ${error.message}`);
    const profs = (data || []) as ProfileRow[];
    setProfiles(profs);
    const m: Record<string, ProfileRow[]> = {};
    profs.forEach(p => { const d = p.department ?? '기타'; (m[d] ||= []).push(p); });
    setDeptMap(m);
  }, []);

  /* ───── 3. 체크박스 토글 ───── */
  const toggleProfile = (uid: string) => setSelectedProfiles(prev => { const s = new Set(prev); s.has(uid) ? s.delete(uid) : s.add(uid); return s; });
  const toggleDepartment = (dept: string) => setSelectedProfiles(prev => {
    const ids = (deptMap[dept] || []).map(p => p.id);
    const all = ids.every(id => prev.has(id));
    const s = new Set(prev);
    ids.forEach(id => (all ? s.delete(id) : s.add(id)));
    return s;
  });

  /* ───── 4. 계정 생성 ───── */
  const handleCreate = async () => {
    if (!form.name.trim()) return alert('사이트명을 입력하세요');
    const { data: newAcc, error } = await supabase.from('account').insert([{ ...form, state: true, recentChangeDate: new Date().toISOString() }]).select('idx').single();
    if (error || !newAcc?.idx) return alert(`계정 생성 실패: ${error?.message}`);
    if (selectedProfiles.size) {
      const arr = Array.from(selectedProfiles).map(uid => ({ account: newAcc.idx, user: uid }));
      const { error: aaErr } = await supabase.from('accountAccess').insert(arr);
      if (aaErr) return alert(`접근권한 저장 실패: ${aaErr.message}`);
    }
    setToast(true); setShowCreate(false); setForm({ name:'',url:'',description:'',login_id:'',login_pwd:'' }); setSelectedProfiles(new Set()); await fetchAccounts();
  };

  /* ───── 5. 행 수정 저장 ───── */
  const handleSaveEdit = async (updated: AccountRow, sel: Set<string>) => {
    const { error: accErr } = await supabase.from('account').update({ ...updated, recentChangeDate: new Date().toISOString() }).eq('idx', updated.idx);
    if (accErr) return alert(`계정 저장 실패: ${accErr.message}`);
    await supabase.from('accountAccess').delete().eq('account', updated.idx);
    if (sel.size) {
      const arr = Array.from(sel).map(uid => ({ account: updated.idx, user: uid }));
      const { error: aaErr } = await supabase.from('accountAccess').insert(arr);
      if (aaErr) return alert(`접근권한 저장 실패: ${aaErr.message}`);
    }
    setToast(true); setEditing(null); await fetchAccounts();
  };

  /* ───────────────────────── JSX ───────────────────────── */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">전체 계정 관리</h1>

      {/* 상단 검색 + 버튼 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="사이트명을 입력하세요…" className="flex-1 border p-2 rounded" />
        <button onClick={() => { setShowCreate(true); loadProfiles(); }} className="px-4 py-2 bg-[#59bd7b] text-white rounded hover:shadow-sm">계정 등록</button>
        <button onClick={() => router.back()} className="px-3 py-2 border rounded hover:bg-gray-50">← 돌아가기</button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr><th className="border px-2 py-1 w-1/3">사이트명</th><th className="border px-2 py-1">URL</th><th className="border px-2 py-1">ID</th><th className="border px-2 py-1">최근 변경</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.idx} className="cursor-pointer hover:bg-gray-50" onClick={() => setEditing(r)}>
                <td className="border px-2 py-1">{r.name}</td>
                <td className="border px-2 py-1 truncate max-w-xs">{r.url}</td>
                <td className="border px-2 py-1">{r.login_id}</td>
                <td className="border px-2 py-1">{r.recentChangeDate ? new Date(r.recentChangeDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>{total === 0 ? '0' : `${(page-1)*PAGE_SIZE+1}-${Math.min(page*PAGE_SIZE,total)} / ${total}`}</span>
        <div className="space-x-2">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-50">이전</button>
          <button disabled={page*PAGE_SIZE>=total} onClick={() => setPage(p=>p+1)} className="px-2 py-1 border rounded disabled:opacity-50">다음</button>
        </div>
      </div>

      {/* 편집 모달 */}
      {editing && <EditAccountModal initial={editing} onClose={() => setEditing(null)} onSave={handleSaveEdit} />}

      {/* 신규 등록 모달 */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h2 className="text-lg font-semibold mb-4">새 계정 등록</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <label>사이트명<input className="border p-1 w-full mt-1" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></label>
            <label>URL<input className="border p-1 w-full mt-1" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} /></label>
            <label className="col-span-2">설명<textarea rows={2} className="border p-1 w-full mt-1" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></label>
            <label>ID<input className="border p-1 w-full mt-1" value={form.login_id} onChange={e=>setForm(f=>({...f,login_id:e.target.value}))} /></label>
            <label>비밀번호<input type="password" className="border p-1 w-full mt-1" value={form.login_pwd} onChange={e=>setForm(f=>({...f,login_pwd:e.target.value}))} /></label>
          </div>
          <h4 className="mt-5 font-medium text-sm">부서별 선택</h4>
          <div className="flex flex-wrap gap-3 mb-2 text-sm">{Object.entries(deptMap).map(([d,list])=>{const all=list.every(p=>selectedProfiles.has(p.id));return(<label key={d} className="flex items-center"><input type="checkbox" className="mr-1" checked={all} onChange={()=>toggleDepartment(d)} />{d} ({list.length})</label>);})}</div>
          <div className="border p-2 max-h-48 overflow-y-auto text-sm">{profiles.map(p=>(<label key={p.id} className="flex items-center mb-1"><input type="checkbox" className="mr-2" checked={selectedProfiles.has(p.id)} onChange={()=>toggleProfile(p.id)} />{p.name||p.id} <span className="text-gray-400 ml-1">({p.department??'기타'})</span></label>))}</div>
          <div className="flex justify-end gap-2 mt-6"><button onClick={()=>setShowCreate(false)} className="border px-3 py-1 rounded">취소</button><button onClick={handleCreate} className="bg-green-600 text-white px-4 py-1 rounded">등록</button></div>
        </Modal>) }

      {/* 토스트 */}
      {toast && <EditCheck onClose={()=>setToast(false)} />}
    </div>
  );
}

/* ───────────────── 편집 모달 컴포넌트 ───────────────── */
function EditAccountModal({ initial, onClose, onSave }: { initial: AccountRow; onClose: () => void; onSave: (row: AccountRow, sel: Set<string>) => void; }) {
  const [form, setForm] = useState<AccountRow>(initial);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [deptMap, setDeptMap] = useState<Record<string, ProfileRow[]>>({});
  const [sel, setSel] = useState<Set<string>>(new Set());

  useEffect(()=>{(async()=>{
    const {data}=await supabase.from('profiles').select('id,name,department').order('name');
    setProfiles(data||[]);
    const m:Record<string,ProfileRow[]>={}; (data||[]).forEach((p:any)=>{const d=p.department??'기타';(m[d]||=[]).push(p);}); setDeptMap(m);
    const {data:acc}=await supabase.from('accountAccess').select('user').eq('account',initial.idx); setSel(new Set(acc?.map(r=>r.user)));
  })()},[initial.idx]);

  const toggleP=(uid:string)=>setSel(prev=>{const s=new Set(prev); s.has(uid)?s.delete(uid):s.add(uid); return s;});
  const toggleD=(dept:string)=>setSel(prev=>{const ids=(deptMap[dept]||[]).map(p=>p.id); const all=ids.every(id=>prev.has(id)); const s=new Set(prev); ids.forEach(id=>(all?s.delete(id):s.add(id))); return s;});

  return(
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">계정 수정</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <label>사이트명<input className="border p-1 w-full mt-1" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>URL<input className="border p-1 w-full mt-1" value={form.url??''} onChange={e=>setForm({...form,url:e.target.value})}/></label>
        <label className="col-span-2">설명<textarea rows={2} className="border p-1 w-full mt-1" value={form.description??''} onChange={e=>setForm({...form,description:e.target.value})}/></label>
        <label>ID<input className="border p-1 w-full mt-1" value={form.login_id??''} onChange={e=>setForm({...form,login_id:e.target.value})}/></label>
        <label>비밀번호<input type="password" className="border p-1 w-full mt-1" value={form.login_pwd??''} onChange={e=>setForm({...form,login_pwd:e.target.value})}/></label>
      </div>
      <h4 className="mt-5 font-medium text-sm">부서별 선택</h4>
      <div className="flex flex-wrap gap-3 mb-2 text-sm">{Object.entries(deptMap).map(([d,list])=>{const all=list.every(p=>sel.has(p.id)); return(<label key={d} className="flex items-center"><input type="checkbox" className="mr-1" checked={all} onChange={()=>toggleD(d)} />{d} ({list.length})</label>);})}</div>
      <div className="border p-2 max-h-48 overflow-y-auto text-sm">{profiles.map(p=>(<label key={p.id} className="flex items-center mb-1"><input type="checkbox" className="mr-2" checked={sel.has(p.id)} onChange={()=>toggleP(p.id)} />{p.name||p.id} <span className="text-gray-400 ml-1">({p.department??'기타'})</span></label>))}</div>
      <div className="flex justify-end gap-2 mt-6"><button onClick={onClose} className="border px-3 py-1 rounded">취소</button><button onClick={()=>onSave(form,sel)} className="bg-green-600 text-white px-4 py-1 rounded">저장</button></div>
    </Modal>
  );
}
