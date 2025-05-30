"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // HTML 허용
import remarkBreaks from "remark-breaks"; // 줄바꿈 지원
import Spinner from "@/component/Spinner";
import { BackToListButton } from '@/component/BackToListButton';
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase';

export default function PostDetail() {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<any>(null);
  const router = useRouter();
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {

    document.querySelectorAll('.site-header').forEach(el => {
      el.classList.add('hidden')
    })

    if (!id) return;
    fetch(`/api/guide/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then(({ post, prev_id, next_id }) => {
        setPost(post); 
    })
      .catch(console.error);

      
  }, [id]);

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

  if (!post) {
    return (
      <main className="relative min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  // 깨진 이미지 문법 복구 (줄바꿈 제거)
  const sanitized = post.content.replace(
    /!\[([^\]]*)\]\s*[\r\n]+\s*(\([^)]+\))/g,
    "![$1]$2"
  );

  return (
    // <div className="p-6 max-w-3xl mx-auto mt-10 p-20 bg-white text-black">
    // <div className="w-full mt-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 bg-white text-black"></div>
    
    <div className=" bg-white">
    
    <div className="relative w-full h-40 overflow-hidden rounded-none mb-6">
        <div className="
              absolute
              inset-x-0    /* 좌우 0 */
              bottom-0     /* 바닥에 붙이기 */
              z-20
              max-w-3xl    /* 본문과 동일한 최대 너비 */
              mx-auto      /* 가운데 정렬 */
              px-6         /* 본문과 동일한 패딩 */
              pb-5         /* 아래 여유(padding-bottom) */
              mt-10
              flex flex-col justify-end"
            >

            <button
                onClick={() => router.push("/int/info/guideline/")}
                aria-label="목록으로"
                className="
                    inline-flex items-center justify-center
                    w-8 h-8 sm:w-9 sm:h-9          /* 크기(모바일·PC) */
                    rounded-full
                    text-gray-400                  /* 초기 색상 */
                    hover:text-[#59bd7b]           /* 호버 시 브랜드 컬러 */
                    hover:bg-gray-100              /* 살짝 배경 */
                    transition
                "
                >
                {/* 인라인 SVG – Heroicons ‘ChevronLeft’와 동일한 패스 */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div>
                <p className="mb-1 text-sm">
                    {post.category}
                </p>
                <h1 className="text-3xl font-bold leading-snug mb-2">
                    {post.title}
                </h1>
                <p className="mb-1 text-sm">
                    작성자 : {post.writer}
                </p>
            </div>
        </div>
    </div>

    <div className="bg-gray-100 py-0.5 mb-5"></div>
    <div className="p-6 max-w-3xl mx-auto bg-white text-black sm:text-sm">
      
      {/* ReactMarkdown + 커스텀 컴포넌트 */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[
          // HTML 허용은 유지하되, 코드블록 내부에서는 실행되지 않도록
          [rehypeRaw, { passThrough: ["element", "text"] }],
        ]}

        
        components={{

          // 헤딩
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold mt-5 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
          ),

          // 단락
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),

          // 불릿 리스트
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
          ),
          // 순서 목록
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
          ),

          // 인라인 / 블록 코드
          code: (props: any) => {
            const { inline, className, children, ...rest } = props;
            return inline ? (
              <code
                className={`bg-gray-100 px-1 py-0.5 rounded text-sm ${className || ""}`}
                {...rest}
              >
                {children}
              </code>
            ) : (
              <pre
                className="bg-gray-800 text-gray-100 p-4 rounded mb-4 overflow-auto"
                {...rest}
              >
                <code>{children}</code>
              </pre>
            );
          },

          // 링크
          a: ({ node, ...props }) => (
            <a className="text-gray-400 underline hover:shadow-400"  target="_blank" {...props} />
          ),

          // 블록인용
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
          ),
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
    <div className="text-center">
        <BackToListButton></BackToListButton>
        {
          isManager && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // 행 클릭 방지
                router.push(`/int/info/guideline/write/update/${post.id}`);
              }}
              className="
                px-2 py-1 text-xs rounded
                text-blue-600 hover:underline
                focus:outline-none
              "
            >
              수정하기
            </button>
        )
        }
    </div>
    </div>
  );
}
