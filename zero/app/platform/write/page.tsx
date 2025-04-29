"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ICommand } from "@uiw/react-md-editor";
import {
  bold,
  italic,
  divider,
  code,
  unorderedListCommand,
  orderedListCommand,
  quote,
  link,
  table
} from "@uiw/react-md-editor";

const COLORS = [
  "#f44336", // Red
  "#ff9800", // Orange
  "#ffeb3b", // Yellow
  "#4caf50", // Green
  "#2196f3", // Blue
  "#9c27b0", // Purple
  "#000000", // Black
  "#ffffff", // White
];

function ColorPickerButton({
  type, // 'color' or 'highlight'
  applyColor,
}: {
  type: "color" | "highlight";
  applyColor: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const COLORS = [
    "#f44336", "#ff9800", "#ffeb3b", "#4caf50",
    "#2196f3", "#9c27b0", "#000000", "#ffffff",
  ];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="px-1"
        onClick={() => setOpen((v) => !v)}
      >
        {type === "color"
          ? <span style={{ color: "#f44336" }}>A</span>
          : <span style={{ backgroundColor: "#ffeb3b", color: "black" }}>H</span>}
      </button>

      {open && (
        <div className="absolute top-full mt-1 p-2 bg-white border rounded shadow grid grid-cols-4 gap-1 z-50">
          {COLORS.map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              className="w-6 h-6 rounded-full border border-gray-300"
              onClick={() => {
                applyColor(color);
                setOpen(false);
              }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}




const CustomImageUploadCommand: ICommand = {
  name: "upload-image",
  keyCommand: "upload-image",
  buttonProps: { "aria-label": "Upload Image" },
  icon: <span>📷</span>,
  execute: async (state, api) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`/api/uploadImage?folder=content`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        // 👉 사용자 선택 (간단한 방식: prompt)
        const width = prompt("이미지 비율(%):", "100");

        const html = `<img src="${data.url}" style="width:${width}%;" alt="이미지" />`;

        api.replaceSelection(html);
      } catch (err: any) {
        alert("이미지 업로드 실패: " + err.message);
      }
    };

    input.click();
  },
};


const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const customUnderlineCommand: ICommand = {
  name: "underline",
  keyCommand: "underline",
  buttonProps: { "aria-label": "Underline" },
  icon: <span style={{ textDecoration: "underline" }}>U</span>,
  execute: (state, api) => {
    const selectedText = state.selectedText || "밑줄";
    api.replaceSelection(`<u>${selectedText}</u>`);
  },
};

const customTextColorCommand: ICommand = {
  name: "textcolor",
  keyCommand: "textcolor",
  buttonProps: { "aria-label": "Text Color" },
  icon: <span style={{ color: "red" }}>A</span>,
  execute: (state, api) => {
    const selectedText = state.selectedText || "텍스트";
    const color = prompt("텍스트 색상을 입력하세요 (예: red, blue, gray)", "red");
    if (!color) return;
    api.replaceSelection(`<span style="color:${color};">${selectedText}</span>`);
  },
};

const customHighlightCommand: ICommand = {
  name: "highlight",
  keyCommand: "highlight",
  buttonProps: { "aria-label": "Highlight" },
  icon: <span style={{ backgroundColor: "yellow" }}>H</span>,
  execute: (state, api) => {
    const selectedText = state.selectedText || "하이라이트";
    const color = prompt("텍스트 색상을 입력하세요 (예: red, blue, gray)", "red");
    api.replaceSelection(`<span style="background-color:${color};">${selectedText}</span>`);
  },
};

const CustomBreakCommand: ICommand = {
  name: "linebreak",
  keyCommand: "linebreak",
  buttonProps: { "aria-label": "줄바꿈" },
  icon: <span>↵</span>,
  execute: (state, api) => {
    api.replaceSelection("<br />\n");
  },
};


export default function WritePost() {
  const editorRef = useRef<any>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [topics, setTopics] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");

  const [uploadingThumb, setUploadingThumb] = useState(false);
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

      {/* Markdown Editor */}
      <label className="block mb-2 font-bold">Content</label>
      <MDEditor
        ref={editorRef}
        value={content}
        onChange={(v) => setContent(v || "")}
        height={500}
        commands={[
          bold,
          italic,
          divider,
          quote,
          link,
          divider,
          code,
          table,
          unorderedListCommand,
          orderedListCommand,
          customUnderlineCommand,   // 커스텀 밑줄
          customTextColorCommand,   // 커스텀 글자 색상
          customHighlightCommand,   // 커스텀 하이라이트
          CustomImageUploadCommand,
          CustomBreakCommand
        ]}
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
