'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string | null
  name: string | null
  department: string | null
  position: string | null
  code: string | null
  ismanager: boolean | null
  isinit: boolean | null
  isused: boolean | null
  created_at: string | null
}

export default function UserInfo() {
  const [user, setUser]   = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const router    = useRouter()
  const pathname  = usePathname()         // 현재 경로 확인용

  /* ───────────────────────────────
     프로필을 가져와서 isinit 검사
  ─────────────────────────────── */
  const fetchProfile = async (user: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('프로필 가져오기 에러:', error.message)
      return
    }

    setProfile(data)
  }

  /* ───────────────────────────────
     최초 실행 + onAuthStateChange
  ─────────────────────────────── */
  useEffect(() => {
    // 1) 첫 로드 시 현재 세션 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        fetchProfile(user)
      } else {
        // router.push('/int/login')
      }
    })

    // 2) 세션 변화 리스너
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
        //   router.push('/int/login')
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [router, pathname])


  /* ───────────────────────────────
     로그아웃
  ─────────────────────────────── */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    // router.push('/int/login')
  }

  /* ───────────────────────────────
     렌더링
  ─────────────────────────────── */
  if (!user || !profile) {
    return (
      <>
      </>
    )
  }

  return (
    <div className="flex items-center justify-end p-3 pr-10 bg-black shadow">
      <span className="mr-4 text-white">
        👋 안녕하세요, <strong>{profile.name}</strong>님
      </span>
      <button
        onClick={handleLogout}
        className="p-1 px-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        logout
      </button>
    </div>
  )
}
