"use client";

import { useRef, useState } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

export default function WritePost() {
  const editorRef = useRef<any>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [topics, setTopics] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async () => {
    const content = editorRef.current?.getInstance().getMarkdown();

    if (!title || !category || !topics || !content) {
      alert("모든 필드를 입력하세요.");
      return;
    }

    const response = await fetch("/api/posts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, topics, thumbnail, content }),
    });

    if (response.ok) {
      alert("게시글이 작성되었습니다!");
      window.location.href = "/platform";
    } else {
      alert("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">WRITE</h1>

      <h3 className="font-bold">Title</h3>
      {!title && <p className="text-red-400 text-sm">제목을 입력하세요</p>}
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <h3 className="font-bold">Category</h3>
      {!category && <p className="text-red-400 text-sm">카테고리를 선택하세요</p>}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">select category</option>
        <option value="zerobar original">zerobar original</option>
        <option value="zerobar guest">zerobar guest</option>
        <option value="Watt the science">Watt the science</option>
        <option value="others">others</option>
      </select>

      <h3 className="font-bold">Topic</h3>
      {!topics && <p className="text-red-400 text-sm">토픽을 선택하세요</p>}
      <select
        value={topics}
        onChange={(e) => setTopics(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">select topic</option>
        <option value="energy">energy</option>
        <option value="industry">industry</option>
        <option value="law & policy">law & policy</option>
        <option value="others">others</option>
      </select>

      <h3 className="font-bold">Thumbnail</h3>
      {!thumbnail && <p className="text-red-400 text-sm">썸네일을 첨부하세요</p>}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="w-full p-2 border rounded mb-4"
      />
      {uploading && <p className="text-gray-500">업로드 중...</p>}
      {thumbnail && (
        <img
          src={`/thumbnail/${thumbnail}`}
          alt="Thumbnail Preview"
          className="w-full h-40 object-cover rounded-md mb-4"
        />
      )}

      <h3 className="font-bold mb-2">Content</h3>
      <Editor
        ref={editorRef}
        previewStyle="vertical"
        height="500px"
        initialEditType="markdown"
        useCommandShortcut={true}
        hooks={{
          addImageBlobHook: async (blob, callback) => {
            const formData = new FormData();
            formData.append("thumbnail", blob);

            const response = await fetch("/api/posts/upload", {
              method: "POST",
              body: formData,
            });

            const data = await response.json();

            if (response.ok) {
              const imageUrl = `/thumbnail/${data.filePath.split("/")[2]}`;
              callback(imageUrl, "업로드된 이미지");
            } else {
              alert("이미지 업로드 실패: " + data.error);
            }
          },
        }}
      />

      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-400"
      >
        UPLOAD
      </button>
    </div>
  );
}
