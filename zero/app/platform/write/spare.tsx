"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function WritePost() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [topics, setTopics] = useState("");
  const [thumbnail, setThumbnail] = useState(""); // 썸네일 경로 저장
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false); // 업로드 상태

  // 📌 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("thumbnail", file);

    setUploading(true); // 업로드 시작
    const response = await fetch("/api/posts/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setUploading(false); // 업로드 완료

    if (response.ok) {
      // console.log(data.filePath.split('/')[1]);
      
      setThumbnail(data.filePath.split('/')[2]); // 업로드된 파일 경로를 상태에 저장
    } else {
      alert("파일 업로드 실패: " + data.error);
    }
  };

  // 📌 게시글 저장 API 호출
  const handleSubmit = async () => {
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

      {/* 제목 입력 */}
      
      <h3 className="font-bold">Title</h3>
      { (title) ? <></> : <p className="text-red-400 text-sm">제목을 입력하세요</p>}
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />


      {/* 카테고리 선택 */}
      <h3 className="font-bold">Category</h3>
      { (category) ? <></> : <p className="text-red-400 text-sm">카테고리를 선택하세요</p>}

      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">select category</option>
          <option value="zerobar original">zerobar original</option>
          <option value="zerobar guest">zerobar guest</option>
          <option value="Watt the science">Watt the science</option>
          <option value="others">others</option>
      </select>

      {/* 토픽 입력 */}
      <h3 className="font-bold">Topic</h3>
      { (topics) ? <></> : <p className="text-red-400 text-sm">토픽을 선택하세요</p>}
      <select
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">select topic</option>
          <option value="Technology" className="font-bold">energy</option>
          <option value="Health" className="font-bold">industry</option>
          <option value="Science" className="font-bold">law & policy</option>
          <option value="Science" className="font-bold">others</option>
        </select>

      {/* 썸네일 파일 업로드 */} 
      <h3 className="font-bold">Thumbnail</h3>
      { (thumbnail) ? <></> : <p className="text-red-400 text-sm">썸네일을 첨부하세요</p>}

      <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full p-2 border rounded mb-4" />
      {uploading && <p className="text-gray-500">업로드 중...</p>}
      {thumbnail && <img src={"/thumbnail/" + thumbnail} alt="Thumbnail Preview" className="w-full h-40 object-cover rounded-md mb-4" />}


      {/* Markdown Editor */}
      <h3 className="font-bold">Content</h3>
      { (content) ? <></> : <p className="text-red-400 text-sm">내용을 입력하세요</p>}
      <MDEditor height={600} value={content} onChange={(value) => setContent(value || "")} className="mb-4" />

      {/* 저장 버튼 */}
      <button onClick={handleSubmit} className="w-full bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-400">
        UPLOAD
      </button>
    </div>
  );
}
