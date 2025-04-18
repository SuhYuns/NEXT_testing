// app/int/info/feedback/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import FeedbackTable from '@/component/FeedbackTable';
import Modal from '@/component/Modal';

interface Writer {
  id: string;
  name: string | null;
}

interface FeedbackRow {
  id: string;
  title: string;
  content: string;
  result: string | null;
  status: number;
  created_at: string;
  writer: Writer;
}

export default function FeedbackPage() {
  const pageSize = 10;
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [showWrite, setShowWrite] = useState(false);

  // 신규 글쓰기 폼 필드
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // 데이터 로드
  const load = async () => {
    const from = (page - 1) * pageSize;
    const to   = page * pageSize - 1;

    // 전체 개수
    let { count, error: cntErr } = await supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true });
    if (cntErr) {
      console.error(cntErr);
      return;
    }
    setTotal(count!);

    // 페이지 데이터 + writer 조인
    let { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        title,
        status,
        content,
        result,
        created_at,
        writer:writer ( id, name )
      `)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setRows(data as FeedbackRow[]);
  };

  useEffect(() => { load() }, [page]);

  // 글쓰기 핸들러
  const handleWrite = async () => {
    // 1) 로그인된 유저 정보 꺼내기
    const {
      data: { user },
      error: userErr
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      alert('로그인 정보가 없습니다.');
      return;
    }
  
    // 2) Insert 시 writer 컬럼에 user.id 를 넣어주기
    const { error } = await supabase
      .from('feedback')
      .insert({
        title: newTitle,
        content: newContent,
        status: 1,
        writer: user.id      // ← 여기!!
      });
  
    if (error) {
      alert('등록 오류: ' + error.message);
    } else {
      setShowWrite(false);
      setNewTitle('');
      setNewContent('');
      load();
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">홈페이지 피드백</h1>
        <button
          onClick={() => setShowWrite(true)}
          className="px-4 py-2 bg-[#59bd7b] text-white rounded"
        >
          글쓰기
        </button>
      </div>

      <FeedbackTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRowClick={setSelected}
      />

      {/* 상세 모달 */}
      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
          <p className="text-sm text-gray-600 mb-2">
            작성자: {selected.writer.name ?? '알 수 없음'} &nbsp;|&nbsp;
            상태: {selected.status === 1 ? '신규' : selected.status === 2 ? '확인' : '해결'}
          </p>
          <hr />
          <p className="mt-4 whitespace-pre-wrap">{selected.content}</p>
          {selected.result && (
            <p className="mt-4 whitespace-pre-wrap text-green-600">
              답변: {selected.result}
            </p>
          )}
        </Modal>
      )}

      {/* 글쓰기 모달 */}
      {showWrite && (
        <Modal onClose={() => setShowWrite(false)}>
          <h2 className="text-xl font-bold mb-4">새 피드백 작성</h2>
          <input
            type="text"
            placeholder="제목"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <textarea
            placeholder="내용"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="w-full mb-3 p-2 border rounded h-32"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowWrite(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              취소
            </button>
            <button
              onClick={handleWrite}
              className="px-4 py-2 bg-[#59bd7b] text-white rounded"
            >
              등록
            </button>
          </div>
        </Modal>
      )}

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
