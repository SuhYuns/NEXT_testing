"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [thumbnail, setThumbnail] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setThumbnail(data.thumbnail);
        setTitle(data.title);
        setTimeout(() => {
          editorRef.current?.getInstance().setMarkdown(data.content || "");
          setLoading(false);
        }, 0);
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
    const content = editorRef.current?.getInstance().getMarkdown();
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
        onClick={handleUpdate}
        className="w-full mt-6 bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-400"
      >
        UPDATE
      </button>
    </div>
  );
}