'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Asset {
  id: string;
  asset_name: string;
  asset_img: string;
  asset_memo: string;
  asset_detail: string;
  start_date: string;
  check_date: string;
  code: string;
  profile_user: string | null;
  state: boolean;
}

export default function AssetInfo({ assetId, onClose }: { assetId: string; onClose: () => void }) {
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single();
      if (!error && data) {
        setAsset(data as unknown as Asset);
      }
    };
    if (assetId) {
      fetchAsset();
    }
  }, [assetId]);

  if (!assetId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
    
    {/* 타이틀과 닫기 버튼을 같은 줄에 정렬 */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">자산 상세 정보</h2>
      <button
        className="px-2 py-1 rounded text-sm"
        onClick={onClose}
      >
        x
      </button>
    </div>

    {asset ? (
      <>
        <p className="text-lg font-bold mb-5">{asset.asset_name}</p>
        
        <img src="/img/noImage.png" alt="자산 이미지" className='mb-5' />
        <p>상태: {asset.state ? "사용중(🟢)" : "고장(🔴)"}</p>
        <p>최초 구매일: {asset.start_date}</p>
        <p>최근 점검일: {asset.check_date ? asset.check_date : asset.start_date}</p>
        <p>메모: {asset.asset_memo}</p>
        <p>상세: {asset.asset_detail}</p>
      </>
    ) : (
      <p>로딩 중...</p>
    )}
  </div>
</div>
  );
}
