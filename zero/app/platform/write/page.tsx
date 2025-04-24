"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function WritePost() {
  const editorRef = useRef<any>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [topics, setTopics] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 서버에 파일 업로드 → public URL 반환
  const uploadToApi = async (file: File, folder: string): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/uploadImage?folder=${folder}`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  // 썸네일 업로드
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const url = await uploadToApi(file, "thumbnails");
      setThumbnailUrl(url);
    } catch (err: any) {
      alert("썸네일 업로드 실패: " + err.message);
    } finally {
      setUploadingThumb(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadToApi(file, "content");
      setContent((prev) => prev + `\n![이미지](${url})\n`);
    } catch (err: any) {
      alert("본문 이미지 업로드 실패: " + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };


  // 게시글 제출
  const handleSubmit = async () => {
    if (!title || !category || !topics || !content) {
      alert("모든 필드를 입력하세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          topics,
          thumbnail : thumbnailUrl,
          content,
        }),
      });
      // 확인용
      console.log("프론트단 전송 : ", res.body);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      alert("게시글이 작성되었습니다!");
      window.location.href = "/platform";
    } catch (err: any) {
      alert("게시글 작성에 실패했습니다: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">포스팅 작성하기</h1>

      {/* Title */}
      <label className="block mb-2 font-bold">Title</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        placeholder="제목을 입력하세요"
        value={title ?? ""}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Category */}
      <label className="block mb-2 font-bold">Category</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={category ?? ""}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="" className="text-black">select category</option>
        <option value="zerobar original" className="text-black">zerobar original</option>
        <option value="zerobar guest" className="text-black">zerobar guest</option>
        <option value="Watt the science" className="text-black">Watt the science</option>
        <option value="others" className="text-black">others</option>
      </select>

      {/* Topic */}
      <label className="block mb-2 font-bold">Topic</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={topics ?? ""}
        onChange={(e) => setTopics(e.target.value)}
      >
        <option value="" className="text-black">select topic</option>
        <option value="energy" className="text-black">energy</option>
        <option value="industry" className="text-black">industry</option>
        <option value="law & policy" className="text-black">law & policy</option>
        <option value="others" className="text-black">others</option>
      </select>

      {/* Thumbnail */}
      <label className="block mb-2 font-bold">Thumbnail</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleThumbnailUpload}
        disabled={uploadingThumb}
        className="w-full p-2 border rounded mb-2"
      />
      {uploadingThumb && <p className="text-gray-500 mb-4">썸네일 업로드 중...</p>}
      {thumbnailUrl && (
        <img
          src={thumbnailUrl || `/thumbnail/${thumbnailUrl}`}
          alt="Thumbnail Preview"
          className="w-full h-40 object-cover rounded mb-6"
        />
      )}

      <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleContentImageUpload}
          className="invisible"
      />

      <div className="flex justify-start mb-3">
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="px-4 py-2 bg-gray-500 text-white rounded  hover:bg-gray-400 text-sm disabled:opacity-50"
          >
            {uploadingImage ? "업로드 중…" : "📷 본문 사진 업로드"}
        </button>
      </div>

      {/* Markdown Editor */}
      <label className="block mb-2 font-bold">Content</label>
      <MDEditor
        ref={editorRef}
        value={content}
        onChange={(v) => setContent(v || "")}
        height={500}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-6 bg-gray-500 text-white py-3 rounded font-bold hover:bg-gray-400 disabled:opacity-50"
      >
        {submitting ? "저장 중..." : "글쓰기"}
      </button>
    </div>
  );
}
