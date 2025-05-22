// app/platform/manage/edit/[id]/HistoryList.tsx
'use client'

import { useEffect, useState } from 'react'

interface HistoryEntry {
  id: string
  modified_at: string
  changes: Record<string, { before: any; after: any }>
}

// 모든 필드를 한글 레이블로 매핑
const fieldLabels: Record<string,string> = {
  title:      '제목',
  category:   '카테고리',
  topics:     '토픽',
  thumbnail:  '썸네일',
  content:    '본문',
  state:      '상태',
  created_at: '작성일자',
}

export default function HistoryList({ postId }: { postId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) return
    fetch(`/api/posts/history?post_id=${postId}`)
      .then(r => r.json())
      .then((data: HistoryEntry[]) => setHistory(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [postId])

  if (loading) return <p>히스토리 불러오는 중…</p>
  if (!history.length) return <p>수정 이력이 없습니다.</p>

  return (
    <div>
      <h2 className='mt-10 font-bold text-lg'>수정 이력</h2>
      {history.map(h => (
        <div key={h.id} style={{ margin: 16, padding: 12, border: '1px solid #ccc' }}>
          <div style={{ fontSize: 12, color: '#666' }}>
            {new Date(h.modified_at).toLocaleString('ko-KR')}
          </div>
          <ul style={{ marginTop: 8, paddingLeft: 16 }}>
            {Object.entries(h.changes).map(([field, { before, after }]) => (
              <li key={field}>
                <strong>{fieldLabels[field] || field}</strong>:
                {' '}
                {field === 'content'
                  ? `(글자수 변화) ` 
                  : ''} 
                {String(before) || '(없음)'} → {String(after) || '(없음)'}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
