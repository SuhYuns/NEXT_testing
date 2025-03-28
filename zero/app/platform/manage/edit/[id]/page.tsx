"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditPostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setThumbnail(data.thumbnail);
        setTitle(data.title);
        setContent(data.content || "");
        setLoading(false);
      });
  }, [id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("thumbnail", file);

    setUploading(true);
    const response = await fetch("/api/posts/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setUploading(false);

    if (response.ok) {
      setThumbnail(data.filePath.split("/")[2]);
    } else {
      alert("파일 업로드 실패: " + data.error);
    }
  };

  const handleUpdate = async () => {
    const response = await fetch("/api/posts/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, thumbnail, content }),
    });

    if (response.ok) {
      alert("게시글이 수정되었습니다!");
      router.push("/platform/manage");
    } else {
      alert("수정에 실패했습니다.");
    }
  };

  if (loading) return <p className="p-6">로딩 중...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">UPDATE</h1>

      <p className="text-4xl font-bold mt-10">{title}</p> <hr />

      <h3 className="font-bold mb-2 text-xl">Thumbnail</h3>
      {uploading && <p className="text-gray-500">업로드 중...</p>}

      <p className="font-bold">Current Thumbnail</p>
      {thumbnail && (
        <img
          src={`/thumbnail/${thumbnail}`}
          alt="Thumbnail Preview"
          className="w-full object-cover rounded-md mb-4"
        />
      )}

      <p className="font-bold">Change Thumbnail </p>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="w-full p-2 border rounded mb-4"
      />

      <h3 className="font-bold mb-2 text-xl">Content</h3>
      <MDEditor
        value={content}
        onChange={(val) => setContent(val || "")}
        height={500}
      />

      <button
        onClick={handleUpdate}
        className="w-full mt-6 bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-400"
      >
        UPDATE
      </button>
    </div>
  );
}