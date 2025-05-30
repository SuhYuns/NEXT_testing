// app/guideline/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';  
import Link from "next/link";


interface GuidelineRow {
  id: string;
  title: string;
  content?: string; // content 는 목록에서 사용하지 않음 (상세 필요 시 추가 fetch)
  category: string | null;
  created_at: string;
  writer: string | null;
  is_used: boolean;
}

/**
 * 한 페이지 10건, 카테고리 & 검색 & 정렬 지원
 * 글 작성은 "작성하기" 버튼만 제공 (라우팅/모달은 별도)
 */
export default function GuidelinePage() {
  const router = useRouter(); 
  /* --- UI 상태 --- */
  const pageSize = 10;
  const [rows, setRows]       = useState<GuidelineRow[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  const [category, setCategory] = useState<string>('all');
  const [keyword, setKeyword]   = useState<string>('');

  const [sortBy, setSortBy] = useState<'created_at' | 'title'>('created_at');
  const [ascending, setAscending] = useState<boolean>(false);

  const [isManager, setIsManager] = useState(false);

  /* --- 파라미터 의존 쿼리 --- */
  const load = async () => {
    const from = (page - 1) * pageSize;
    const to   = page * pageSize - 1;

    // 공통 쿼리 빌드
    let base = supabase
      .from('guideline')
      .select(
        `id, title, category, created_at, is_used, writer`,
        { count: 'exact' }
      )
      .eq("is_used", true); 

    if (category !== 'all') base = base.eq('category', category);
    if (keyword.trim())      base = base.ilike('title', `%${keyword.trim()}%`);

    const countQuery = base.range(0, 0); // count만 필요
    const { count, error: cntErr } = await countQuery;
    if (cntErr) {
      console.error(cntErr);
      return;
    }
    setTotal(count ?? 0);

    // 데이터 쿼리 (정렬 포함)
    let dataQuery = base
      .order(sortBy, { ascending })
      .range(from, to);

    const { data, error } = await dataQuery;
    if (error) {
      console.error(error);
    } else {
      setRows(data as GuidelineRow[]);
    }
  };

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
    }

    init();
  }, []);

  // 로드 트리거: page, category, keyword, sortBy, ascending
  useEffect(() => {
    
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, keyword, sortBy, ascending]);

  /* --- 헬퍼 --- */
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const categories = useMemo<string[]>(() => ['all', '필수', '사무', '연구', 'IT', '기타'], []); // 필요 시 동적 fetch

  const toggleSort = (col: 'created_at' | 'title') => {
    if (sortBy === col) setAscending(prev => !prev);
    else {
      setSortBy(col);
      setAscending(col === 'title'); // title 기본 오름차, 날짜 기본 내림차
    }
  };

  /* --- 렌더 --- */
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">가이드라인</h1>
        

        {isManager && (
        <button
        onClick={() => router.push('./guideline/write')} 
        className="px-4 py-2 bg-[#59bd7b] text-white rounded whitespace-nowrap"
      >
        작성하기
      </button>
      )}
      </div>

      {/* 필터 & 검색 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* 카테고리 드롭다운 */}
        <select
          value={category}
          onChange={e => {setCategory(e.target.value); setPage(1);}}
          className="border rounded p-2 bg-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? '전체' : cat}</option>
          ))}
        </select>

        {/* 검색 */}
        <input
          type="text"
          placeholder="검색어"
          value={keyword}
          onChange={e => {setKeyword(e.target.value); setPage(1);}}
          className="flex-1 min-w-[200px] border rounded p-2"
        />
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm">
          <thead>
          
            <tr className="bg-gray-100 text-left">
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('title')}>
                제목 {sortBy === 'title' && (ascending ? '▲' : '▼')}
              </th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('created_at')}>
                작성일 {sortBy === 'created_at' && (ascending ? '▲' : '▼')}
              </th>
              <th className="p-3">작성자</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">데이터가 없습니다.</td>
              </tr>
            )}
            {rows.map(row => (
              
              <tr key={row.id} className="border-t last:border-b hover:bg-gray-50" onClick={() => router.push(`/int/info/guideline/view/${row.id}`)}>
                
                <td className="p-3 whitespace-nowrap">
                  {"[" + row.category + "] "} 
                  {row.title}
                </td>
                <td className="p-3 whitespace-nowrap">{new Date(row.created_at).toLocaleDateString('ko-KR')}</td>
                <td className="p-3 whitespace-nowrap">{row.writer ?? '알 수 없음'}</td>
                
              </tr>
              
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          이전
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
