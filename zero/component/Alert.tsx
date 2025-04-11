'use client';

import React from 'react';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;  // 아이콘으로 사용할 JSX 요소
  message?: Array<string>;          // 배열 순서 제목, 내용, 닫기창
}

export default function Alert({
  isOpen,
  onClose,
  icon,
  message,
}: AlertProps) {
  if (!isOpen) {
    // 열려있지 않으면 아무것도 렌더링하지 않음
    return null;
  }

  return (
    // 전체 화면을 덮는 반투명 배경 (모달 스타일)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 실제 Alert 박스 */}
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm">
        {/* 아이콘, 제목, 내용 순서대로 표시 */}
        {icon && (
          <div className="flex justify-center mb-3">
            {icon}
          </div>
        )}
        {message && (
          <h2 className="text-xl font-bold text-center mb-2">{message[0]}</h2>
        )}
        {message && (
          <p className="text-center mb-4">
            {message[1]}
          </p>
        )}

        {/* 닫기 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#59bd7b] text-white rounded hover:shadow"
          >
            {message && <span>{message[2]}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
