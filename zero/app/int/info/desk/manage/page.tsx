// 관리자용 좌석 현황 관리 페이지
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ManagerCheck from '@/component/ManagerCheck';

interface Profile {
  id: string;
  name: string;
  current_seat: string | null;
  imm_seat: string | null;
  imm_seat_until: string | null;
}

interface Seat {
  id: string;
  seat_number: string;
}

export default function ManageSeatsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [search, setSearch] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: profilesData }: { data: Profile[] | null } = await supabase
      .from('profiles')
      .select('id, name, current_seat, imm_seat, imm_seat_until')

    const { data: seatsData } = await supabase
      .from('seats')
      .select('id, seat_number');

    if (profilesData) setProfiles(profilesData);
    if (seatsData) setSeats(seatsData.filter(seat => seat.seat_number.toLowerCase() !== 'empty'));
  }

  const isSeatAvailable = (seatId: string) => {
    return !profiles.some(
      (p) => p.current_seat === seatId || p.imm_seat === seatId
    );
  };

  const updateSeat = async (profileId: string, type: 'current' | 'imm', seatId: string | null) => {
    if (type === 'imm' && seatId) {
      const now = new Date();
      const until = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
      await supabase.from('profiles').update({ imm_seat: seatId, imm_seat_until: until }).eq('id', profileId);
    } else if (type === 'imm' && !seatId) {
      await supabase.from('profiles').update({ imm_seat: null, imm_seat_until: null }).eq('id', profileId);
    } else {
      await supabase.from('profiles').update({ current_seat: seatId }).eq('id', profileId);
    }
    fetchData();
  };

  const filtered = profiles.filter(p => p.name.includes(search));

  return (
    <div className="p-6">
      <ManagerCheck>
      <h1 className="text-2xl font-bold mb-4">좌석 현황 관리</h1>
      <button onClick={() => router.push('/int/info/desk')} className="px-3 py-2 border rounded hover:bg-gray-50 mr-2">← 돌아가기</button>
      <input
        type="text"
        placeholder="이름 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
  
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">이름</th>
            <th className="border p-2">고정석</th>
            <th className="border p-2">자율석 (남은 시간)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const immRemaining = p.imm_seat_until ? Math.floor((new Date(p.imm_seat_until).getTime() - Date.now()) / 60000) : null;
            return (
              <tr key={p.id}>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">
                  <select
                    className="p-1 border rounded"
                    value={p.current_seat ?? ''}
                    onChange={(e) => updateSeat(p.id, 'current', e.target.value || null)}
                  >
                    <option value=''>- 미지정 -</option>
                    {seats.map(seat => (
                      <option key={seat.id} value={seat.id} disabled={!isSeatAvailable(seat.id) && seat.id !== p.current_seat}>
                        {seat.seat_number}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <div className="flex gap-2 items-center">
                    <select
                      className="p-1 border rounded"
                      value={p.imm_seat ?? ''}
                      onChange={(e) => updateSeat(p.id, 'imm', e.target.value || null)}
                    >
                      <option value=''>- 미지정 -</option>
                      {seats.map(seat => (
                        <option
                          key={seat.id}
                          value={seat.id}
                          disabled={!isSeatAvailable(seat.id) && seat.id !== p.imm_seat}
                        >
                          {seat.seat_number}
                        </option>
                      ))}
                    </select>
                    {p.imm_seat_until && (
                      (() => {

                        const until = new Date(p.imm_seat_until).getTime();
                        const nowUTC = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
                        const minutesLeft = Math.floor((until - nowUTC) / 60000);

                        return (
                          <span className="text-xs text-gray-600">
                            { minutesLeft > 0 ? `(${minutesLeft}분 남음)` : '(만료됨)' }
                          </span>
                        );
                      })()
                    )}
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
      </ManagerCheck>
    </div>
  );
}