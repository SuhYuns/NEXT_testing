'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Alert from '@/component/Alert';
import AssetInfo from '@/component/AssetInfo';
import ProfileInfo from '@/component/ProfileInfo';

interface Profile {
  id?: string | null;        // 프로필 테이블의 PK (조인 결과에 포함 가능)
  name: string | null;       // 사용자 이름
  department?: string;
  position?: string;
  current_seat?: string;
  
}

interface Seat {
  id: string;
  seat_number: string;
  floor: string;
  equipment: string[];
  created_at: string;
  arrange: number;
  profiles?: Profile[];
}

interface Asset {
    id: string;
    asset_name: string;
    start_date: string;
    state: string;
    // created_at: string;
}

// interface Me {
//   current_seat: string | null;
// }



// 현재 위치 판별
// 본사 위치
const targetLocation = {
  lat: 37.50804407288159,
  lng: 127.03538105605207
};

// 두 좌표 사이의 거리를 미터 단위로 계산(Haversine 공식)
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



export default function DeskPage() {

  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState([""]);

  const openAlert = () => {
    setShowAlert(true);
  };
  const closeAlert = () => {
    setShowAlert(false);
  };

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const handleOpenAsset = (id: string) => {
    setSelectedAssetId(id);
    setShowAssetModal(true);
  };

  const handleCloseAsset = () => {
    setShowAssetModal(false);
    setSelectedAssetId(null);
  };


  const [showProfile, setShowProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleOpenProfile = (uid: string) => {
    setSelectedUserId(uid);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedUserId(null);
    setShowProfile(false);
  };

  // 위치 추척 관련 
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);


  const fetchProfile = async (user: any) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError) {
      console.error('프로필 가져오기 에러:', profileError.message);
    } else {
      setProfile(profileData as Profile);
    }
  };

  useEffect(() => {

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        fetchProfile(user);
      }
    });
    
    // if (!navigator.geolocation) {
    //   setError('이 브라우저는 Geolocation을 지원하지 않습니다.');
    //   return;
    // }
    // // 현재 위치 가져오기
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     const { latitude, longitude, accuracy } = position.coords;
    //     setUserLocation({ lat: latitude, lng: longitude });
    //     const dist = getDistanceFromLatLonInMeters(latitude, longitude, targetLocation.lat, targetLocation.lng);
    //     setDistance(dist);
    //   },
    //   (err) => {
    //     setError(err.message);
    //   }
    // );



  }, []);


  // 현재 활성화된 층과 해당 층의 좌석 목록
  const [activeFloor, setActiveFloor] = useState<'8' | '9'>('8');
  const [seats, setSeats] = useState<Seat[]>([]);

  // 선택된 좌석 (클릭 시 상세 정보 토글)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [assetDetails, setAssetDetails] = useState<Asset[]>([]);

  
  // 활성화된 층에 따라 Supabase에서 좌석 데이터를 불러옴 (profiles 조인 포함)
  useEffect(() => {
    const fetchSeats = async () => {
      const { data, error } = await supabase
        .from('seats')
        .select('*, profiles!profiles_current_seat_fkey(id, name, department, position)')
        .eq('floor', activeFloor);
  
      if (error) {
        console.error('좌석 데이터 가져오기 에러:', error.message);
      } else if (data) {
        console.log('Fetched seats:', JSON.stringify(data, null, 2)); // JSON 문자열화하여 가독성 높임
        setSeats(data as Seat[]);
      }
    };
    fetchSeats();
    setSelectedSeat(null);
  }, [activeFloor]);
  

  // 장비 정보 가져오기
  useEffect(() => {
    const fetchAssets = async () => {
      if (selectedSeat && selectedSeat.id) {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('seat_user', selectedSeat.id);
        if (error) {
          console.error('자산 데이터 가져오기 에러:', error.message);
          setAssetDetails([]);
        } else {
          setAssetDetails(data as unknown as Asset[]);
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

  // 좌석 예약 로직
  async function handleReserve() {
    if (!selectedSeat) return
  
    /* 1) 거리 제한 체크 */
    // if (!userLocation || distance! > 500) {
    //   setMessage([
    //     '본사 반경 내에서만 예약 가능합니다',
    //     '본사에 근접한 상태에서 예약해 주세요',
    //     '확인',
    //   ])
    //   openAlert()
    //   return
    // }
  
    try {
      /* 2) API 호출 – 반드시 '/api/...' */
      const res = await fetch('/api/seats/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ 필수!!!
        body: JSON.stringify({ seatId: selectedSeat.id }),
      });
  
      const result = await res.json()
  
      if (!res.ok) {
        setMessage(['예약 실패', result.error, '확인'])
        openAlert()
        return
      }
  
      /* 3) 성공 – 한국시간으로 만료 시각 표시 */
      const untilKST = new Date(result.until).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      })
      setMessage(['좌석 예약 완료!', `만료 시각: ${untilKST}`, '확인'])
      openAlert()
  
      /* 4) 프론트 캐시에 바로 반영해 “나의 좌석” 표시 */
      setProfile((p) => p && { ...p, current_seat: selectedSeat.id })
  
    } catch (err) {
      console.error('예약 오류:', err)
      setMessage(['예약 오류', '알 수 없는 오류가 발생했습니다', '확인'])
      openAlert()
    }
  }
  

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

    {/* <div className="p-6">
      
      {error && <p className="text-red-600">오류: {error}</p>}
      {userLocation && distance !== null ? (
        <div>
          <p>본사 위치에서의 거리: {distance.toFixed(2)} 미터 (내 위치 : {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)})</p>
          {distance <= 500 ? (
            <p className="text-green-600 font-bold">500m 이내에 있습니다! 
            </p>
          ) : (
            <p className="text-gray-600">500m 범위를 벗어났습니다. 
            </p>
          )}
        </div>
      ) : (
        <p>위치 정보를 불러오는 중...</p>
      )}
    </div> */}

      {/* 좌석 정보 그리드 */}
      <div className="grid grid-cols-6 gap-4 mb-6 ">
        {seats.slice() // state를 직접 변형하지 않도록 배열 복사
          .sort((a, b) => b.arrange - a.arrange) // arrange 값이 낮은 순서대로 정렬
          .map((seat) => {
          // 좌석이 사용 중이면 occupant가 null이 아니므로, profiles에 이름이 있어야 함.
          const isOccupied = seat.profiles && seat.profiles.length > 0;
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
              className={`${baseClasses} ${bgClass} h-20 justify-items-center ${isEmpty && 'border-white h-0'}`}
            >
              {!isEmpty && <div className="text-sm hidden md:block md:text-base">{seat.seat_number}</div>}
              {!isEmpty && <div className="text-sm sm:block md:hidden md:text-base">{seat.seat_number.slice(2)}</div>}
              {isOccupied && seat.profiles && (
                <div className="text-xs text-gray-700 hidden md:block font-normal">  
                {seat.profiles[0].name}
                {profile?.current_seat == seat.id && <div className='font-bold'>나의 좌석</div>}
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
            <div>
              <h2 className="text-xl font-bold mb-2 ">
                {selectedSeat.seat_number} 좌석 정보
              </h2>
              {/* {selectedSeat.id} */}
              <p className="mb-2">
                <span className="font-bold">사용자:</span>
                {showProfile && selectedUserId && (
                  <ProfileInfo userId={selectedUserId} onClose={handleCloseProfile} />
                )}
                {selectedSeat.profiles && selectedSeat.profiles.length > 0 ? (
                  <>
                    
                    <a
                      onClick={() => {
                        const profileId = selectedSeat.profiles?.[0].id;
                        console.log(profileId);
                        if (profileId) {
                          handleOpenProfile(profileId);
                        } else {
                          alert("사용자 정보가 올바르지 않습니다.");
                        }
                      }}
                      className="cursor-pointer hover:text-gray-500"
                    >
                      {selectedSeat.profiles[0].name}
                    </a>
                    <span className="font-bold text-red-500"> (사용 중인 좌석입니다)</span>
                  </>
                ) : (
                  '없음'
                )}
              </p>
              <div className="mb-2">
                <span className='font-bold'>장비:</span> <br />
                {showAssetModal && selectedAssetId && (
                  <AssetInfo assetId={selectedAssetId} onClose={handleCloseAsset} />
                )}
                <ul>
                {assetDetails.length > 0 ? assetDetails.map((a, i) =>
                  <span key={a.asset_name}>
                      <li key={i} className='cursor-pointer hover:text-gray-500'><a onClick={() => { handleOpenAsset(a.id) }}><span>{a.asset_name}</span></a> (<span>{a.start_date} 구매 </span> {a.state ? "🟢" : "🔴"})</li>
                  </span>
                ) : '없음'}
                </ul>
              </div>
            </div>

            <Alert
              isOpen={showAlert}
              onClose={closeAlert}
              icon={<span className="text-3xl">🔔</span>} // 원하는 아이콘을 JSX로 전달
              message={[message[0], message[1], message[2]]}
            />

            

            <div className='mt-10 align-right flex justify-end'>
              { profile?.current_seat != selectedSeat.id &&
              <button
              onClick={() => {
                if (selectedSeat.profiles && selectedSeat.profiles.length > 0) {
                  setMessage(["사용 중인 좌석입니다", "다른 좌석을 선택해 주세요", "확인"])
                  openAlert();
                  return
                } 
                if (profile?.current_seat) {
                  setMessage(["이미 사용 중인 좌석이 있습니다.", "자신의 좌석을 사용해 주세요", "확인"])
                  // alert(profile.current_seat)
                  openAlert();
                  return
                }
                if (
                  (!selectedSeat.profiles || selectedSeat.profiles.length === 0) &&
                  !profile?.current_seat
                ) {
                  handleReserve()
                  window.location.reload();
                }
              }}
              className='px-4 py-2 rounded bg-[#59bd7b] hover:shadow text-white mr-2'
          >
              예약하기
          </button>

              }
                
                {profile?.current_seat == selectedSeat.id && 
                  <button 
                    className='px-4 py-2 rounded text-white mr-2 bg-red-500 hover:bg-red-600'
                    onClick={async () => {
                      if (!confirm('정말 예약을 취소하시겠습니까?')) return;
                  
                      const res = await fetch('/api/seats/cancel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include', // 쿠키 필수
                      });
                  
                      const result = await res.json();
                  
                      if (!res.ok) {
                        alert(`예약 취소 실패: ${result.error}`);
                        return;
                      }
                  
                      alert('예약이 취소되었습니다.');
                      window.location.reload(); // 상태 반영 위해 리로드
                    }}
                  >
                    예약취소
                  </button>
                }
            </div>
          </div>
        ) : (
          <p>좌석을 선택하면 상세 정보가 표시됩니다.</p>
        )}
      </div>
    </div>
  );
}
