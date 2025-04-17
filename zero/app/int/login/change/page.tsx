'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Alert from '@/component/Alert'

interface Profile {
  id: string | null
  isinit: boolean | null
}

export default function ChangePasswordPage() {
  /* ────────── 상태 ────────── */
  const [user,    setUser]    = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const [pwd,   setPwd]   = useState('')
  const [error, setError] = useState('')
  const [alertOpen, setAlertOpen] = useState(false)


  const router   = useRouter()
  const pathname = usePathname()

  /* ────────── 프로필 조회 + 분기 ────────── */
  const fetchProfile = async (u: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, isinit')
      .eq('id', u.id)
      .single()

    if (error) {
      console.error(error.message)
      setError('프로필을 가져올 수 없습니다.')
      return
    }

    setProfile(data)

    // 이미 초기 설정을 마친 사용자라면 메인으로
    if (data?.isinit === false && pathname !== '/int') {
      router.replace('/int')
    }
  }

  /* ────────── 최초 로드 & 세션 변화 ────────── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        fetchProfile(user)
      } else {
        router.replace('/int/login')
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
          router.replace('/int/login')
        }
      }
    )
    return () => listener.subscription.unsubscribe()
  }, [router, pathname])

  /* ────────── 비밀번호 변경 ────────── */
  const handleChange = async () => {
    setError('')
    if (pwd.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    // 세션 강제 로드
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('세션이 만료되었습니다. 다시 로그인해 주세요.')
      router.replace('/int/login')
      return
    }

    const { error: authErr } = await supabase.auth.updateUser({ password: pwd })
    if (authErr) {
      setError(authErr.message)
      return
    }

    // isinit ➜ false
    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ isinit: false })
      .eq('id', session.user.id)

    if (dbErr) {
      setError(dbErr.message)
      return
    }

    // 로그아웃 후 알림
    await supabase.auth.signOut()
    setAlertOpen(true)
  }

  /* ────────── 렌더링 ────────── */
  if (!user || !profile) {
    return null // 로딩 시 빈 화면 (필요하면 스피너)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <Alert
        isOpen={alertOpen}
        onClose={() => router.replace('/int/login')}
        icon={<span className="text-3xl">✅</span>}
        message={['비밀번호가 변경되었습니다', '새 비밀번호로 다시 로그인해 주세요', '확인']}
      />

      <h1 className="text-2xl mb-4 text-center">비밀번호 초기 설정</h1>

      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="새 비밀번호(6자 이상)"
        className="w-full p-2 border mb-3"
      />

      {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

      <button
        onClick={handleChange}
        className="w-full bg-green-600 text-white p-2 rounded"
      >
        비밀번호 변경
      </button>

      <p className="text-center mt-5 text-gray-500">
        처음 로그인 했을 때는 비밀번호를 재설정해야 합니다.
      </p>
      <p className="text-center mt-1 text-gray-500">
        변경 후 재로그인 해주세요!
      </p>
    </div>
  )
}
