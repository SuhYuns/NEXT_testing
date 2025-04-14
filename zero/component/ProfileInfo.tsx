'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  name: string | null;
  department: string | null;
  position: string | null;
  code: string | null;
  ismanager: boolean | null;
  isinit: boolean | null;
  isused: boolean | null;
  created_at: string | null;
  current_seat: string | null;
  currentSeatLimit: string | null;
}

interface ProfileInfoProps {
  userId: string;            // 조회할 프로필의 id
  onClose: () => void;       // 모달 닫기
}

export default function ProfileInfo({ userId, onClose }: ProfileInfoProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // userId가 없으면 그냥 리턴
    if (!userId) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('프로필 조회 에러:', error.message);
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (!userId) {
    return null; // userId가 없으면 모달 자체를 렌더링하지 않음
  }

  // 모달 닫기 버튼을 누르거나 배경을 클릭 시 닫도록 할 수도 있음

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {loading ? (
          <p>로딩 중...</p>
        ) : profile ? (
          <>
            <h2 className="text-xl font-bold mb-4">사용자 상세 정보</h2>
            <div className="space-y-2">
              <p><strong>이름:</strong> {profile.name}</p>
              <p><strong>사번/코드:</strong> {profile.code}</p>
              <p><strong>부서:</strong> {profile.department}</p>
              <p><strong>직급:</strong> {profile.position}</p>
              <p><strong>현재좌석:</strong> {profile.current_seat ?? '없음'}</p>
              <p><strong>상태:</strong> {profile.isused ? '재직' : '퇴사'}</p>
            </div>
          </>
        ) : (
          <p>프로필 정보를 찾을 수 없습니다.</p>
        )}
      </div>
    </div>
  );
}
