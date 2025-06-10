// app/int/info/assets/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Modal from '@/component/Modal';
import EditCheck from '@/component/EditCheck';
import AssetInfo from '@/component/AssetInfo';
import ManagerCheck from '@/component/ManagerCheck';

// ───────────────── 타입 & 상수 ─────────────────
interface AssetRow {
  id: string;
  asset_name: string;
  asset_img: string | null;
  asset_memo: string | null;
  asset_detail: string | null;
  start_date: string | null;
  check_date: string | null;
  code: string | null;
  state: boolean | null;
}

interface FormState {
  asset_name: string;
  asset_img: File | null;
  asset_memo: string;
  asset_detail: string;
  start_date: string;
  check_date: string;
  code: string;
}

const PAGE_SIZE = 10;

// ───────────────── 페이지 ─────────────────
export default function AssetsPage() {
  const router = useRouter();

  /* 목록 & 검색 */
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  /* 등록 모달 */
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>({ asset_name:'',asset_img:null,asset_memo:'',asset_detail:'',start_date:'',check_date:'',code:'' });
  const [loading, setLoading] = useState(false);

  /* 상세보기 모달 */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* Toast */
  const [toast, setToast] = useState(false);

  /* ───── 1. 자산 목록 fetch ───── */
  const fetchAssets = useCallback(async () => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase.from('assets').select('*', { count: 'exact' }).order('asset_name');
    if (query.trim()) {
      const p = `%${query.trim()}%`;
      q = q.or(`asset_name.ilike.${p},code.ilike.${p}`);
    }
    const { data, count, error } = await q.range(from, to);
    if (error) return alert(`자산 조회 실패: ${error.message}`);
    setRows(data as AssetRow[]);
    setTotal(count ?? 0);
  }, [page, query]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  /* ───── 2. 자산 등록 처리 ───── */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,asset_img:e.target.files?.[0]||null}));
  const resetForm = () => setForm({ asset_name:'',asset_img:null,asset_memo:'',asset_detail:'',start_date:'',check_date:'',code:'' });

  const handleCreate = async () => {
    if (!form.asset_name.trim()) return alert('자산명을 입력하세요');
    setLoading(true);

    let imgPath: string | null = null;
    if (form.asset_img) {
      const { data: imgD, error: imgE } = await supabase.storage.from('asset-img').upload(`${Date.now()}_${form.asset_img.name}`, form.asset_img);
      if (imgE) { alert(`이미지 업로드 실패: ${imgE.message}`); setLoading(false); return; }
      imgPath = imgD?.path ?? null;
    }

    const { error } = await supabase.from('assets').insert([{ asset_name:form.asset_name, asset_img:imgPath, asset_memo:form.asset_memo, asset_detail:form.asset_detail, start_date:form.start_date, check_date:form.check_date||form.start_date, code:form.code, state:true }]);
    setLoading(false);
    if (error) return alert(`등록 실패: ${error.message}`);

    setToast(true); setShowCreate(false); resetForm(); await fetchAssets();
  };

  /* ───── JSX ───── */
  return (
    <div className="p-6 max-w-7xl mx-auto">
    <ManagerCheck>
      <h1 className="text-2xl font-bold mb-6">자산 목록</h1>

      {/* 검색 & 버튼 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="자산명 또는 코드 검색…" className="flex-1 border p-2 rounded" />
        <button onClick={()=>setShowCreate(true)} className="px-4 py-2 bg-[#59bd7b] text-white rounded hover:shadow-sm">자산 등록</button>
        <button onClick={()=>router.back()} className="px-3 py-2 border rounded hover:bg-gray-50">← 돌아가기</button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead><tr><th className="border px-2 py-1 w-1/3">자산명</th><th className="border px-2 py-1">코드</th><th className="border px-2 py-1">메모</th><th className="border px-2 py-1">상태</th></tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setSelectedId(r.id)}>
                <td className="border px-2 py-1">{r.asset_name}</td>
                <td className="border px-2 py-1">{r.code}</td>
                <td className="border px-2 py-1 truncate max-w-xs">{r.asset_memo}</td>
                <td className="border px-2 py-1">{r.state?'사용중':'미사용'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>{total===0?'0':`${(page-1)*PAGE_SIZE+1}-${Math.min(page*PAGE_SIZE,total)} / ${total}`}</span>
        <div className="space-x-2"><button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-50">이전</button><button disabled={page*PAGE_SIZE>=total} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded disabled:opacity-50">다음</button></div>
      </div>

      {/* ───── 등록 모달 ───── */}
      {showCreate && (
        <Modal onClose={()=>setShowCreate(false)}>
          <h2 className="text-lg font-semibold mb-4">새 자산 등록</h2>
          <div className="grid gap-4 text-sm">
            <label className="flex flex-col">자산명<input className="border p-1 mt-1" value={form.asset_name} onChange={e=>setForm({...form,asset_name:e.target.value})}/></label>
            <label className="flex flex-col">이미지<input type="file" accept="image/*" className="mt-1" onChange={handleFile}/></label>
            <label className="flex flex-col">코드<input className="border p-1 mt-1" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></label>
            <label className="flex flex-col">구매일<input type="date" className="border p-1 mt-1" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})}/></label>
            <label className="flex flex-col">점검일<input type="date" className="border p-1 mt-1" value={form.check_date} onChange={e=>setForm({...form,check_date:e.target.value})}/></label>
            <label className="flex flex-col">메모<textarea rows={2} className="border p-1 mt-1" value={form.asset_memo} onChange={e=>setForm({...form,asset_memo:e.target.value})}/></label>
                        
            <label className="flex flex-col">
              상세
              <textarea
                rows={3}
                className="border p-1 mt-1"
                value={form.asset_detail}
                onChange={(e) =>
                  setForm({ ...form, asset_detail: e.target.value })
                }
              />
            </label>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowCreate(false)}
              className="border px-4 py-2 rounded"
            >
              취소
            </button>
            <button
              disabled={loading}
              onClick={handleCreate}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? '처리 중…' : '등록'}
            </button>
          </div>
        </Modal>
      )}

      {/* 상세 조회 모달 */}
      {selectedId && (
        <AssetInfo assetId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {/* Toast */}
      {toast && <EditCheck onClose={() => setToast(false)} />}
      </ManagerCheck>
    </div>
  );
}

