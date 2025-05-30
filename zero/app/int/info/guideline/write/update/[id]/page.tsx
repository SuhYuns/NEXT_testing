// app/guideline/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import { supabase } from "@/lib/supabase";

/* CSR 전용 SunEditor */
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

/* ─────────────────────────────────────────────── */
export default function GuidelineEditPage() {
  /* ───── 기본 훅 ───── */
  const { id } = useParams() as { id: string };
  const router = useRouter();

  /* ───── 상태 ───── */
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle]     = useState("");
  const [writer, setWriter]   = useState("");
  const [category, setCategory] = useState("기타");
  const [isUsed, setIsUsed]   = useState(true);
  const [content, setContent] = useState("");

  /* 카테고리 목록 */
  const categories = ["필수", "사무", "연구", "IT", "기타"];

  /* ───── 초기 데이터 로드 ───── */
  useEffect(() => {
    if (!id) return;

    (async () => {
      const { data, error } = await supabase
        .from("guideline")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("글을 불러오지 못했습니다.");
        router.push("/guideline");
        return;
      }

      setTitle(data.title);
      setWriter(data.writer ?? "");          // null 보호
      setCategory(data.category ?? "기타");
      setIsUsed(Boolean(data.is_used));
      setContent(data.content ?? "");
      setLoading(false);
    })();
  }, [id, router]);

  /* ───── 업데이트 ───── */
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("guideline")
        .update({
          title,
          writer,
          category,
          is_used: isUsed,
          content,
        })
        .eq("id", id);

      if (error) throw error;

      alert("수정이 완료되었습니다.");
      router.push("/int/info/guideline");
    } catch (err: any) {
      alert("수정 실패: " + (err?.message || "알 수 없는 오류"));
    } finally {
      setSubmitting(false);
    }
  };

  /* ───── 로딩 중 ───── */
  if (loading) return <p className="p-6">로딩 중…</p>;

  /* ───── UI ───── */
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">가이드라인 수정</h1>

      {/* 제목 */}
      <label className="block mb-2 font-bold">제목</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 작성자 */}
      <label className="block mb-2 font-bold">작성자</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        value={writer}
        onChange={(e) => setWriter(e.target.value)}
      />

      {/* 카테고리 */}
      <label className="block mb-2 font-bold">카테고리</label>
      <select
        className="w-full p-2 border rounded mb-4 text-black"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((c) => (
          <option key={c} value={c} className="text-black">
            {c}
          </option>
        ))}
      </select>

      {/* 사용 여부 */}
      <label className="block mb-2 font-bold">사용 여부</label>
      <select
        className="w-full p-2 border rounded mb-4 text-black"
        value={isUsed ? "Y" : "N"}
        onChange={(e) => setIsUsed(e.target.value === "Y")}
      >
        <option value="Y" className="text-black">
          사용
        </option>
        <option value="N" className="text-black">
          미사용
        </option>
      </select>

      {/* 본문 */}
      <label className="block mb-2 font-bold">내용</label>
      <SunEditor
        setOptions={{
          height: "600px",
          buttonList: [
            ["undo", "redo"],
            ["font", "fontSize", "formatBlock"],
            ["bold", "italic", "underline", "strike"],
            ["fontColor", "hiliteColor"],
            ["align", "horizontalRule", "list", "table"],
            ["link", "image", "video"],
            ["codeView"],
          ],
          font: ["Pretendard", "Noto Sans KR", "Arial", "Georgia"],
          fontSize: [12, 14, 16, 18, 20, 24, 28],
          imageUploadUrl: "/api/uploadImage?folder=guideline",
          imageResizing: true,
          imageWidth: "100%",
        }}
        setContents={content}
        onChange={(val: string) => setContent(val)}
      />

      {/* 저장 버튼 */}
      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="w-full mt-6 bg-[#59bd7b] text-white py-3 rounded font-bold hover:bg-[#4aa569] disabled:opacity-50"
      >
        {submitting ? "저장 중…" : "수정하기"}
      </button>
    </div>
  );
}
