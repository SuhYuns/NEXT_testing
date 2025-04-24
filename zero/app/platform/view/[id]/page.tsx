"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PostDetail() {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch(console.error);
  }, [id]);

  if (!post) return <p>Loading…</p>;

  // 깨진 이미지 문법 복구 (줄바꿈 제거)
  const sanitized = post.content.replace(
    /!\[([^\]]*)\]\s*[\r\n]+\s*(\([^)]+\))/g,
    "![$1]$2"
  );

  return (
    <div className="p-6 max-w-3xl mx-auto mt-10">
      {/* 제목과 메타 */}
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-white mb-5">
        {post.category} | {post.topics}
      </p>
      <div className="bg-gray-100 py-0.5 mb-5"></div>

      {/* 썸네일 */}
      {/* {(post.thumbnail_url || post.thumbnail) && (
        <img
          src={post.thumbnail_url || post.thumbnail}
          alt="Thumbnail"
          className="w-full h-64 object-cover rounded mb-6"
        />
      )} */}

      {/* ReactMarkdown + 커스텀 컴포넌트 */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
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
            <p className="mb-4 leading-relaxed text-white" {...props} />
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
            <a className="text-gray-400 underline hover:text-white"  target="_blank" {...props} />
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
  );
}
