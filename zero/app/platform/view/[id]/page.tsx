"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PostDetail() {
  // const { id } = useParams(); // 여기서 id를 바로 얻는다.
  const { id } = useParams() as { id: string }; // ✅ 타입 단언
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-gray-500">
        {post.category} | {post.topics}
      </p>
      <img
        src={`/thumbnail/${post.thumbnail}`}
        alt="Thumbnail"
        className="w-full h-64 object-cover my-4"
      />
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
>
        {post.content}
    </ReactMarkdown>
    </div>
  );
}
