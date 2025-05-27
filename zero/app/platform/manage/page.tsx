"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatDateForInput(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

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

    console.log(field, value);

    if (!response.ok) {
      alert("업데이트 실패");
    } else {
      const updatedPosts = posts.map((post) =>
        post.id === id ? { ...post, [field]: value } : post
      );
      setPosts(updatedPosts);
    }
  };

  const categories = ["ZERO BAR original", "ZERO BAR guest", "Watt the science", "others"];
  const topics = ["energy", "industry", "law & policy", "others"];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">게시글 관리</h1>

      <table className="w-full table-auto border text-sm">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th className="p-2 border">제목</th>
            <th className="p-2 border">토픽</th>
            <th className="p-2 border">카테고리</th>
            <th className="p-2 border">게시일</th>
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
                    <option key={topic} value={topic} className="text-black">{topic}</option>
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
                    <option key={cat} value={cat} className="text-black">{cat}</option>
                  ))}
                </select>
              </td>
              <td className="p-2 border">
                <input
                  type="datetime-local"
                  value={formatDateForInput(post.created_at)}
                  onChange={(e) => handleUpdate(post.id, "created_at", e.target.value)}
                  className=" bg-gray-200 text-black"
                />
              </td>
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