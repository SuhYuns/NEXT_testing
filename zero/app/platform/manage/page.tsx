"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    const response = await fetch("/api/posts/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });

    if (!response.ok) {
      alert("업데이트 실패");
    } else {
      const updatedPosts = posts.map((post) =>
        post.id === id ? { ...post, [field]: value } : post
      );
      setPosts(updatedPosts);
    }
  };

  const categories = ["zerobar original", "zerobar guest", "Watt the science", "others"];
  const topics = ["energy", "industry", "law & policy", "others"];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">게시글 관리</h1>

      <table className="w-full table-auto border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">제목</th>
            <th className="p-2 border">토픽</th>
            <th className="p-2 border">카테고리</th>
            <th className="p-2 border">작성자</th>
            <th className="p-2 border">게시 상태</th>
            <th className="p-2 border">내용</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="text-center">
              <td className="p-2 border">
                <input
                  className="w-full border p-1"
                  defaultValue={post.title}
                  onBlur={(e) => handleUpdate(post.id, "title", e.target.value)}
                />
              </td>
              <td className="p-2 border">
                <select
                  className="w-full border p-1"
                  value={post.topics}
                  onChange={(e) => handleUpdate(post.id, "topics", e.target.value)}
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </td>
              <td className="p-2 border">
                <select
                  className="w-full border p-1"
                  value={post.category}
                  onChange={(e) => handleUpdate(post.id, "category", e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </td>
              <td className="p-2 border">{post.writer}</td>
              <td className="p-2 border">
                <input
                  type="checkbox"
                  checked={post.state}
                  onChange={(e) => handleUpdate(post.id, "state", e.target.checked)}
                />
              </td>
              <td className="p-2 border">
                <Link href={`/platform/manage/edit/${post.id}`} className="text-blue-600 hover:underline">
                  수정
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}