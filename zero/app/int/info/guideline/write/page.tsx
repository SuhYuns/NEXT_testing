// app/guideline/write/page.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import 'suneditor/dist/css/suneditor.min.css';

/* SunEditor는 CSR 전용 */
const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

interface CategoryOption {
  value: string;
  label: string;
}

/** 가이드라인 글 작성 페이지 */
export default function GuidelineWritePage() {
  /* ──────────── 상태 ──────────── */
  const [title, setTitle]       = useState('');
  const [writer, setWriter]       = useState('');
  const [category, setCategory] = useState('기타');
  const [isUsed, setIsUsed]     = useState(true);
  const [content, setContent]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* 카테고리 옵션 (필요 시 동적 로드 가능) */
  const categories: CategoryOption[] = [
    { value: '필수',   label: '필수'   },
    { value: '사무', label: '사무' },
    { value: '연구',   label: '연구'   },
    { value: 'IT',   label: 'IT'   },
    { value: '기타',   label: '기타'   }
  ];

  /* ──────────── 제출 ──────────── */
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력하세요.');
      return;
    }
    setSubmitting(true);
  
    try {
      /* ✨ 로그인 정보 + 이름 가져오기 */
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('로그인 정보가 없습니다.');
  
      /* ── ① user_meta → name 이 들어있다면 그걸 사용 ───────────────── */
      // let writerName: string | null =
      //   (user.user_metadata?.name as string | undefined) ??
      //   (user.user_metadata?.full_name as string | undefined) ??
      //   null;
  
      // /* ── ② profiles 테이블에 이름이 있다면 거기로 대체(옵션) ───────── */
      // if (!writerName) {
      //   const { data: profile } = await supabase
      //     .from('profiles')          // ← 실제 프로필 테이블명
      //     .select('name')
      //     .eq('id', user.id)
      //     .single();
      //   writerName = profile?.name ?? user.email ?? '알 수 없음';
      // }
  
      /* INSERT 시 writer 컬럼에 **이름**을 문자열로 저장 */
      const { error } = await supabase.from('guideline').insert({
        title,
        category,
        is_used: isUsed,
        content,
        writer,   // ← 수정!
      });
      if (error) throw error;
  
      alert('가이드라인이 작성되었습니다.');
      window.location.href = '/guideline';
    } catch (err: any) {
      alert('작성 실패: ' + (err?.message ?? '알 수 없는 오류'));
    } finally {
      setSubmitting(false);
    }
  };

  /* ──────────── UI ──────────── */
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">가이드라인 작성</h1>

      

      {/* 제목 */}
      <label className="block mb-2 font-bold">제목</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <label className="block mb-2 font-bold">작성자</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        placeholder="제목을 입력하세요"
        value={writer}
        onChange={e => setWriter(e.target.value)}
      />

      {/* 카테고리 */}
      <label className="block mb-2 font-bold">카테고리</label>
      <select
        className="w-full p-2 border rounded mb-4 text-black"
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        {categories.map(opt => (
          <option key={opt.value} value={opt.value} className="text-black">
            {opt.label}
          </option>
        ))}
      </select>

      {/* 사용 여부 */}
      <label className="block mb-2 font-bold">사용 여부</label>
      <select
        className="w-full p-2 border rounded mb-4 text-black"
        value={isUsed ? 'Y' : 'N'}
        onChange={e => setIsUsed(e.target.value === 'Y')}
      >
        <option value="Y" className="text-black">사용</option>
        <option value="N" className="text-black">미사용</option>
      </select>

      {/* SunEditor */}
      <label className="block mb-2 font-bold">내용</label>
      <SunEditor
        setOptions={{
          height: '600px',
          buttonList: [
            ['undo', 'redo'],
            ['bold', 'italic', 'underline', 'strike'],
            ['font', 'fontSize', 'formatBlock'],
            ['fontColor', 'hiliteColor'],
            ['align', 'horizontalRule', 'list', 'table'],
            ['codeView']
          ],
          font: ['Pretendard', 'Noto Sans KR', 'Arial', 'Georgia'],
          fontSize: [12, 14, 16, 18, 20, 24, 28],
          imageUploadUrl: '/api/uploadImage?folder=guideline',
          imageResizing: true,
          imageWidth: '100%'
        }}
        setContents={content}
        onChange={(val: string) => setContent(val)}
      />

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-6 bg-[#59bd7b] text-white py-3 rounded font-bold hover:bg-[#4aa569] disabled:opacity-50"
      >
        {submitting ? '저장 중...' : '작성 완료'}
      </button>
    </div>
  );
}
