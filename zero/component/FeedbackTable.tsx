// components/FeedbackTable.tsx
'use client';

import React from 'react';

interface Writer {
  id: string;
  name: string | null;
}

export interface FeedbackRow {
  id: string;
  title: string;
  content: string;
  result: string | null;
  status: number;
  created_at: string;
  writer: Writer;
}

interface FeedbackTableProps {
  rows: FeedbackRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onRowClick: (row: FeedbackRow) => void;
}

export default function FeedbackTable({
  rows, total, page, pageSize,
  onPageChange, onRowClick,
}: FeedbackTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <table className="w-full table-auto mb-4 border-collapse">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 border">제목</th>
          <th className="px-4 py-2 border">작성자</th>
          <th className="px-4 py-2 border">상태</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr
            key={row.id}
            onClick={() => onRowClick(row)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <td className="px-4 py-2 border">{row.title}</td>
            <td className="px-4 py-2 border text-center">
              {row.writer?.name ?? '알 수 없음'}
            </td>
            <td className="px-4 py-2 border text-center">
              {row.status === 1 ? '신규 🔴'
                : row.status === 2 ? '확인 🟡'
                : '해결 🟢'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
