"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ✅ JSON 데이터 인터페이스
interface Site {
  name: string;
  url: string;
  purpose: string;
  id: string;
  password: string;
}

export default function Content() {
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    // ✅ JSON 데이터 불러오기
    fetch("/data/data.json")
      .then((response) => response.json())
      .then((data) => setSites(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  // ✅ 클립보드 복사 기능
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert(`복사됨: ${text}`))
      .catch((err) => console.error("복사 실패:", err));
  };

  return (
    <div className="min-h-screen">
      

      {/* ✅ 컨텐츠 영역 */}
      <div className="container mx-auto p-6">
        <p className="text-sm text-gray-600">
          사내 시스템 구축 이전까지 임시로 사용되는 페이지입니다.
        </p>
        <p className="text-sm text-gray-600">
          로그인이 되지 않는 사이트는 윤수혁 선임에게 문의해 주세요 😥
        </p>

        {/* ✅ 테이블 */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">사이트명</th>
                <th className="border p-3 text-left">사이트 설명</th>
                <th className="border p-3 text-left">아이디</th>
                <th className="border p-3 text-left">비밀번호</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, index) => {
                // const faviconUrl = `https://www.google.com/s2/favicons?sz=16&domain=${new URL(site.url).hostname}`;
                return (
                  <tr key={index} className="border">
                    <td className="border p-3 flex items-center space-x-2">
                      {/* <Image src={faviconUrl} alt="favicon" width={16} height={16} /> */}
                      <a href={site.url} target="_blank" className="text-blue-500 hover:underline">
                        {site.name}
                      </a>
                    </td>
                    <td className="border p-3">{site.purpose}</td>
                    <td className="border p-3">
                      {site.id}{" "}
                      <button
                        onClick={() => copyToClipboard(site.id)}
                        className="ml-2 px-3 py-1 text-xs bg-[#59bd7b] text-white rounded hover:bg-green-700"
                      >
                        복사
                      </button>
                    </td>
                    <td className="border p-3">
                      <span className="blur-sm hover:blur-none transition">{site.password}</span>{" "}
                      <button
                        onClick={() => copyToClipboard(site.password)}
                        className="ml-2 px-3 py-1 text-xs bg-[#59bd7b] text-white rounded hover:bg-green-700"
                      >
                        복사
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
