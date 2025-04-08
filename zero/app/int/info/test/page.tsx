'use client';

import { useState, useEffect } from 'react';

// 예시로 사용할 특정 위치 (서울 시청 좌표: 위도 37.5665, 경도 126.9780)
const targetLocation = {
  lat: 37.50804407288159,
  lng: 127.03538105605207
  // lat: 37.5665,
  // lng: 126.9780
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


// !4m6!3m5!1s0x357ca3122fe7cd43:0xbe2365bf6a5183f4!8m2!3d!4d!16s%2Fg%2F11ks482p40?entry=ttu&g_ep=EgoyMDI1MDQwMi4xIKXMDSoASAFQAw%3D%3D

export default function LocationChecker() {
  // 사용자의 현재 위치 상태
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  // 두 위치 사이의 거리 (미터)
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">현재 위치 판별</h1>
      {error && <p className="text-red-600">오류: {error}</p>}
      {userLocation && distance !== null ? (
        <div>
          <p>
            내 위치: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
          </p>
          <p>목표 위치에서의 거리: {distance.toFixed(2)} 미터</p>
          {distance <= 500 ? (
            <p className="text-green-600 font-bold">500m 이내에 있습니다!</p>
          ) : (
            <p className="text-gray-600">500m 범위를 벗어났습니다.</p>
          )}
        </div>
      ) : (
        <p>위치 정보를 불러오는 중...</p>
      )}
    </div>
  );
}
