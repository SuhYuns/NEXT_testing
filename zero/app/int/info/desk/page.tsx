'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  name: string;
}

interface Seat {
  id: string;
  seat_number: string;
  floor: string;
  occupant: string | null; // null이면 비어있음
  equipment: string[];
  applicants: string[];
  created_at: string;
  profiles?: Profile[]; // 조인 결과, occupant와 연결된 profiles 데이터 (하나의 객체가 들어있는 배열)
}

interface Asset {
    id: string;
    asset_name: string;
    // asset_type: string;
    // created_at: string;
  }

export default function DeskPage() {
  // 현재 활성화된 층: '8' 또는 '9'
  const [activeFloor, setActiveFloor] = useState<'8' | '9'>('8');
  // 해당 층의 좌석 목록
  const [seats, setSeats] = useState<Seat[]>([]);
  // 선택된 좌석 (클릭 시 상세 정보 토글)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const [assetDetails, setAssetDetails] = useState<Asset[]>([]);

  // 활성화된 층에 따라 Supabase에서 좌석 데이터를 불러옴 (profiles 조인 포함)
  useEffect(() => {
    const fetchSeats = async () => {
      const { data, error } = await supabase
        .from('seats')
        .select('*, profiles!occupant(name)')
        .eq('floor', activeFloor);
      if (error) {
        console.error('좌석 데이터 가져오기 에러:', error.message);
      } else if (data) {
        setSeats(data as Seat[]);
      }
    };

    fetchSeats();
    // 탭 전환 시 기존 선택 좌석 초기화
    setSelectedSeat(null);
  }, [activeFloor]);

  // 선택된 좌석의 equipment 배열에 있는 자산 정보를 가져오기
  useEffect(() => {
    const fetchAssets = async () => {
      if (selectedSeat && selectedSeat.equipment && selectedSeat.equipment.length > 0) {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .in('id', selectedSeat.equipment);
        if (error) {
          console.error('자산 데이터 가져오기 에러:', error.message);
          setAssetDetails([]);
        } else {
          setAssetDetails(data as Asset[]);
        }
      } else {
        setAssetDetails([]);
      }
    };

    fetchAssets();
  }, [selectedSeat]);

  // 좌석 클릭 시, 이미 선택된 좌석이면 해제, 아니면 선택하여 상세정보 표시
  const handleSeatClick = (seat: Seat) => {
    if (selectedSeat && selectedSeat.id === seat.id) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seat);
    }
  };

  return (
    <div className="p-6">
      {/* 상단 탭 버튼 영역 */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveFloor('8')}
          className={`px-4 py-2 rounded ${
            activeFloor === '8' ? 'bg-[#59bd7b] text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          8층
        </button>
        <button
          onClick={() => setActiveFloor('9')}
          className={`px-4 py-2 rounded ${
            activeFloor === '9' ? 'bg-[#59bd7b] text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          9층
        </button>
      </div>

      {/* 좌석 정보 그리드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {seats.map((seat) => {
          // 좌석이 사용 중이면 occupant가 null이 아니므로, profiles에 이름이 있어야 함.
          const isOccupied = seat.occupant !== null;
          const isSelected = selectedSeat && selectedSeat.id === seat.id;
          const baseClasses = "border border-gray-300 p-4 text-center";
          const bgClass = isOccupied
            ? "bg-gray-300" // 사용 중인 좌석은 항상 회색 배경
            : isSelected
            ? "bg-green-100"
            : "hover:bg-gray-100";
          return (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              className={`${baseClasses} ${bgClass}`}
            >
              {seat.seat_number}
              {isOccupied && seat.profiles && seat.profiles.length > 0 && (
                <div className="text-xs text-gray-700">
                  {seat.profiles[0].name}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 좌석 상세 정보 토글 영역 */}
      <div className="shadow p-6 rounded">
        {selectedSeat ? (
          <div>
            <h2 className="text-xl font-bold mb-2 ">
              {selectedSeat.seat_number} 좌석 정보
            </h2>
            <p className="mb-2">
              사용자:{" "}
              {selectedSeat.occupant && selectedSeat.profiles && selectedSeat.profiles.length > 0
                ? selectedSeat.profiles[0].name
                : '없음'}
            </p>
            <p className="mb-2">
              장비: {assetDetails.length > 0 ? assetDetails.map(a => a.asset_name).join(', ') : '없음'}
            </p>
            <p className="mb-2">
              희망자: {selectedSeat.applicants.length > 0 ? selectedSeat.applicants.join(', ') : '없음'}
            </p>

            <div className='mt-10 align-right flex justify-end'>
                <button
                    onClick={() => {}}
                    className='px-4 py-2 rounded bg-[#59bd7b] hover:shadow text-white mr-2'
                >
                    예약하기
                </button>

                <button
                    onClick={() => {}}
                    className='px-4 py-2 rounded bg-[#59bd7b] hover:shadow text-white'
                >
                    희망좌석 지정
                </button>
            </div>
          </div>
        ) : (
          <p>좌석을 선택하면 상세 정보가 표시됩니다.</p>
        )}
      </div>
    </div>
  );
}
