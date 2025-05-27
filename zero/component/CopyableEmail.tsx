// components/CopyableEmail.tsx
'use client'

import { useState, useEffect } from 'react'

interface CopyableEmailProps {
  email: string
}

export default function CopyableEmail({ email }: CopyableEmailProps) {
  const [isCopying, setIsCopying] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleClick = async () => {
    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(email)
      setShowToast(true)
    } catch {
      /* 필요 시 에러 핸들링 */
    }
    setTimeout(() => setIsCopying(false), 1000)
  }

  useEffect(() => {
    if (!isCopying && showToast) setShowToast(false)
  }, [isCopying, showToast])

  return (
    <div className="relative inline-block">
      <p
        onClick={handleClick}
        className="cursor-pointer select-none text-white className=hover:opacity-75"
      >
        {email}
      </p>
      {isCopying && (
        <div className="absolute -top-12 right-0 flex items-center space-x-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-white rounded-full animate-spin" />
          {showToast && <span className="text-xs">복사 완료</span>}
        </div>
      )}
    </div>
  )
}
