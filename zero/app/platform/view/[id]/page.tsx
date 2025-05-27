"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // HTML 허용
import remarkBreaks from "remark-breaks"; // 줄바꿈 지원
import Spinner from "@/component/Spinner";


export default function PostDetail() {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<any>(null);
  const [prev, setPrev]   = useState<any>(null);
  const [next, setNext]   = useState<any>(null);

  useEffect(() => {

    document.querySelectorAll('.site-header').forEach(el => {
      el.classList.add('hidden')
    })

    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then(({ post, prev_id, next_id }) => {
        setPost(post);        // ← 실제 글만
        setPrev(prev_id);
        setNext(next_id);
        document.title = 'ZERO ENERGY BAR | ' + post.title.toString();
      })
      .catch(console.error);

      
  }, [id]);

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
      {/* 썸네일 */}
      {(post.thumbnail_url || post.thumbnail) && (
        <div className="relative w-full h-80 overflow-hidden rounded-none mb-6">
          {/* 1) 배경 이미지 (z-0) */}
          <img
            src={post.thumbnail_url || post.thumbnail}
            alt="Thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* 2) 어두운 오버레이 (선택) */}
          <div className="absolute inset-0 bg-black/40 z-10" />

          {/* 3) 텍스트 컨테이너 (z-20) */}
          <div className="
              absolute
              inset-x-0    /* 좌우 0 */
              bottom-0     /* 바닥에 붙이기 */
              z-20
              max-w-3xl    /* 본문과 동일한 최대 너비 */
              mx-auto      /* 가운데 정렬 */
              px-6         /* 본문과 동일한 패딩 */
              pb-6         /* 아래 여유(padding-bottom) */
              mb-5
              text-white
              flex flex-col justify-end"
            >
            <p className="mb-1 text-sm">
              {/* {post.category} ｜  */}
              {post.topics}
            </p>
            <h1 className="text-3xl font-bold leading-snug mb-2">
              {post.title}
            </h1>
            <p className="text-xs">
              {new Date(post.created_at).toLocaleDateString("ko-KR")} {post.views} views
            </p>
          </div>
        </div>
      )}

    <div className="bg-gray-100 py-0.5 mb-5"></div>
    <div className="p-6 max-w-3xl mx-auto bg-white text-black sm:text-sm">
      
      {/* ReactMarkdown + 커스텀 컴포넌트 */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]} // ← 추가!!!
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
      <div>
        <div className="bg-gray-100 py-0.5 mb-5 mt-10"></div>
        { next ? <a href={`/platform/view/${next.id}`} className="hover:bg-white hover:text-gray"><span>🔺[다음글]</span> {next.title}</a> : <span className="text-gray-500">🔺[다음글] 다음글이 없습니다.</span> } <br /> 
        { prev ? <a href={`/platform/view/${prev.id}`} className="hover:bg-white hover:text-gray"><span>🔻[이전글]</span> {prev.title}</a> : <span className="text-gray-500">🔺[이전글] 이전글이 없습니다.</span> }
      </div>
    </div>
    </div>
  );
}
