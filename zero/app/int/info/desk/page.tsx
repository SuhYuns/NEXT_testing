'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { span } from 'framer-motion/client';

// 현재 위치 판별


// 본사 위치
const targetLocation = {
  lat: 37.50804407288159,
  lng: 127.03538105605207
};

// Haversine 공식 (두 좌표 사이의 거리를 미터 단위로 계산)
function getDistanceFromLatLonInMeters(
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  const R = 6371000; // 지구의 반경 (미터)
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// ..............................................................


interface Profile {
  id?: string;        // 프로필 테이블의 PK (조인 결과에 포함 가능)
  name: string;       // 사용자 이름
  department?: string;
  position?: string;
}

interface Seat {
  id: string;
  seat_number: string;
  floor: string;
  occupant: string | null; // null이면 비어있음
  equipment: string[];
  applicants: string[];
  created_at: string;
  arrange: number;
  // profiles?: Profile[]; // 조인 결과, occupant와 연결된 profiles 데이터 (하나의 객체가 들어있는 배열)
  profiles?: Profile;
}

interface Asset {
    id: string;
    asset_name: string;
    start_date: string;
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


  // 위치 추척 관련 
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (!navigator.geolocation) {
        setError('이 브라우저는 Geolocation을 지원하지 않습니다.');
        return;
      }
      // 현재 위치 가져오기
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // 특정 위치(targetLocation)와의 거리 계산
          const dist = getDistanceFromLatLonInMeters(latitude, longitude, targetLocation.lat, targetLocation.lng);
          setDistance(dist);
        },
        (err) => {
          setError(err.message);
        }
      );
    }, []);
  // ....

  // 활성화된 층에 따라 Supabase에서 좌석 데이터를 불러옴 (profiles 조인 포함)
  useEffect(() => {
    const fetchSeats = async () => {
      const { data, error } = await supabase
        .from('seats')
        .select('*, profiles!seats_occupant_fkey1(name, department, position)')
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
      <h1 className="text-4xl font-bold mb-10">좌석 정보</h1>
      {/* 상단 탭 버튼 영역 */}
      <div className="flex space-x-4 mb-1">
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

      <div className="p-6">
      
      {error && <p className="text-red-600">오류: {error}</p>}
      {userLocation && distance !== null ? (
        <div>
          <p>본사 위치에서의 거리: {distance.toFixed(2)} 미터 (내 위치 : {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)})</p>
          {distance <= 500 ? (
            <p className="text-green-600 font-bold">500m 이내에 있습니다! <span>(예약 가능)</span></p>
          ) : (
            <p className="text-gray-600">500m 범위를 벗어났습니다. <span className='text-red-600 font-bold'>(예약 불가)</span></p>
          )}
        </div>
      ) : (
        <p>위치 정보를 불러오는 중...</p>
      )}
    </div>

      {/* 좌석 정보 그리드 */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {seats.slice() // state를 직접 변형하지 않도록 배열 복사
          .sort((a, b) => b.arrange - a.arrange) // arrange 값이 낮은 순서대로 정렬
          .map((seat) => {
          // 좌석이 사용 중이면 occupant가 null이 아니므로, profiles에 이름이 있어야 함.
          const isOccupied = seat.occupant !== null;
          const isSelected = selectedSeat && selectedSeat.id === seat.id;
          const baseClasses = "border border-gray-300 p-4 text-center font-bold";
          const isEmpty = seat.seat_number.toLowerCase() === 'empty';

          const bgClass = isOccupied
            ? "bg-gray-300" // 사용 중인 좌석은 항상 회색 배경
            : isSelected
            ? "bg-green-100"
            : "hover:bg-gray-100";
          return (
            <button
              key={seat.id}
              onClick={() => {
                if (!isEmpty) handleSeatClick(seat);
              }}
              className={`${baseClasses} ${bgClass}`}
            >
              {!isEmpty && <div className="text-sm md:text-base">{seat.seat_number}</div>}
              {isOccupied && seat.profiles && (
                <div className="text-xs text-gray-700 hidden md:block font-normal">  
                {seat.profiles.name}
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
              {selectedSeat.occupant && selectedSeat.profiles && selectedSeat.profiles.name
                ?  <>{selectedSeat.profiles.name} <span className='font-bold text-red-500'>(사용 중인 좌석입니다)</span></>
                : '없음'}
            </p>
            <p className="mb-2">
              {/* 장비: {assetDetails.length > 0 ? assetDetails.map((a) => <div>{a.asset_name}</div>).join(', ') : '없음'} */}
              장비: {assetDetails.length > 0 ? assetDetails.map((a) => <span key={a.asset_name}><span>{a.asset_name}</span> (구매일 : <span>{a.start_date}</span>)</span>) : '없음'}
            </p>
            <p className="mb-2">
              희망자: {selectedSeat.applicants.length > 0 ? selectedSeat.applicants : '없음'}
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
