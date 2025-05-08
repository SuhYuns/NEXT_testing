// app/platform/manage/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

export default function EditPostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [topics, setTopics] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ───────── 초기 데이터 로드 ───────── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/posts/${id}`);
      const { post } = await res.json();
      setTitle(post.title);
      setCategory(post.category);
      setTopics(post.topics);
      setThumbnailUrl(post.thumbnail);
      setContent(post.content || "");
      setLoading(false);
    })();
  }, [id]);

  /* ───────── 공통 업로드 함수 ───────── */
  const uploadToApi = async (file: File, folder: string): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/uploadImage?folder=${folder}`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errorMessage || "Upload failed");
    return data.url ?? data.result?.[0]?.url;
  };

  /* ───────── 썸네일 업로드 ───────── */
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

  /* ───────── 게시글 업데이트 ───────── */
  const handleUpdate = async () => {
    if (!title || !category || !topics || !content) {
      alert("모든 필드를 입력하세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title,
          category,
          topics,
          thumbnail: thumbnailUrl,
          content,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      alert("게시글이 수정되었습니다!");
      router.push("/platform/manage");
    } catch (err: any) {
      alert("수정 실패: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">로딩 중…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">포스팅 수정하기</h1>

      {/* 제목 */}
      <label className="block mb-2 font-bold">Title</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 카테고리 */}
      <label className="block mb-2 font-bold">Category</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">select category</option>
        <option value="zerobar original">zerobar original</option>
        <option value="zerobar guest">zerobar guest</option>
        <option value="Watt the science">Watt the science</option>
        <option value="others">others</option>
      </select>

      {/* 토픽 */}
      <label className="block mb-2 font-bold">Topic</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={topics}
        onChange={(e) => setTopics(e.target.value)}
      >
        <option value="">select topic</option>
        <option value="energy">energy</option>
        <option value="industry">industry</option>
        <option value="law & policy">law & policy</option>
        <option value="others">others</option>
      </select>

      {/* 썸네일 */}
      <label className="block mb-2 font-bold">Thumbnail</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleThumbnailUpload}
        disabled={uploadingThumb}
        className="w-full mb-2"
      />
      {uploadingThumb && <p className="text-gray-500">썸네일 업로드 중…</p>}
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt="Thumbnail Preview"
          className="w-full h-40 object-cover rounded mb-6"
        />
      )}

      {/* 본문 */}
      <label className="block mb-2 font-bold">Content</label>
      <SunEditor
        setOptions={{
          height: "1000px",
      
          /* ────── 툴바 구성 ────── */
          buttonList: [
            ["undo", "redo"],
            ["font", "fontSize", "formatBlock"],     // 글꼴·크기
            ["bold", "italic", "underline", "strike"],
            ["fontColor", "hiliteColor"],
            ["align", "horizontalRule", "list", "table"], // ← hr 대신 horizontalRule
            ["link", "image", "video"],
            ["codeView"],
          ],
      
          /* ────── 글꼴·크기 목록 (원하는 값만 남기면 됨) ────── */
          font: [
            "Pretendard",
            "Nanum Gothic",
            "Noto Sans KR",
            "Arial",
            "Courier New",
            "Georgia",
          ],
          fontSize: [8, 10, 12, 14, 16, 18, 20, 24, 28, 36, 48, 60],
      
          /* ────── 이미지 업로드 기타 옵션 ────── */
          imageUploadUrl: "/api/uploadImage?folder=content",
          imageResizing: true,
          imageWidth: "100%",
        }}
        setContents={content}
        onChange={(v: string) => setContent(v)}
      />

      {/* 업데이트 버튼 */}
      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="w-full mt-6 bg-gray-500 text-white py-3 rounded font-bold hover:bg-gray-400 disabled:opacity-50"
      >
        {submitting ? "저장 중…" : "수정하기"}
      </button>
    </div>
  );
}
