// components/EditCheck.tsx
'use client'

import { useState, useEffect } from 'react'

interface EditCheckProps {
  onClose: () => void
}

export default function EditCheck({ onClose }: EditCheckProps) {
  const [visible, setVisible] = useState(true)

  // 1초 후 사라지게
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onClose()    // 부모에게도 숨기라고 알려주기
    }, 1000)
    return () => clearTimeout(t)
  }, [onClose])

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 flex items-center space-x-2
                    bg-black bg-opacity-70 text-white px-3 py-1 rounded
                    z-[1000]">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-white
                      rounded-full animate-spin" />
      <span className="text-xs">수정 완료!</span>
    </div>
  )
}
