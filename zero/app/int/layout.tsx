"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import UserInfo from '@/component/UserInfo';
import { supabase } from '@/lib/supabase';

// ✅ 메뉴 데이터 (각 메뉴마다 다른 세부 항목을 설정 가능)
const menuData: { [key: string]: string[] } = {
  "정보": ["공용 계정", "좌석 정보", "가이드라인", "데이터센터"],
  // "정보": ["내 정보", "공용 계정", "좌석 정보", "홈페이지 피드백", "가이드라인"],
  // "커뮤니티": ["공지사항", "정보 공유", "동호회 게시판", "건의사항"],
  // "기능": ["워크 플로우", "출퇴근 관리", "초대장"],
  // "관리": ["자산관리", "계정관리", "멤버관리"],
  "사단법인 넥스트": ["홈페이지", "제로바 블로그"],
};

const menuLinks: { [key: string]: string } = {
    "공용 계정": "/int/info/account",
    "홈페이지 피드백": "/int/info/feedback",
    "좌석 정보": "/int/info/desk",

    "홈페이지": "https://nextgroup.or.kr/",
    "제로바 블로그": "../../platform",
  };

// ✅ 개별 메뉴 아이템 컴포넌트
const MenuItem = ({
  title,
  subItems,
  isMobile,
  openDropdown,
  setOpenDropdown,
  user,
}: {
  title: string;
  subItems: string[];
  isMobile: boolean;
  openDropdown: string | null;
  setOpenDropdown: (menu: string | null) => void;
  user: any;
}) => {
  const toggleDropdown = () => {
    setOpenDropdown(openDropdown === title ? null : title);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full hover:text-[#3ba55d] p-2 font-bold"
      >
        {title} <ChevronDown size={18} />
      </button>

      <AnimatePresence>
        {openDropdown === title && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute bg-white shadow-lg text-gray-800 ${
              isMobile ? "relative right-0 mt-2 w-full" : "right-0 mt-2 w-48"
            }`}
          >
            {subItems.map((sub, index) => {
              const link = menuLinks[sub];
              const clickable = user && link;  // user가 있고 메뉴 링크가 있을 때만 클릭 가능
              return clickable ? (
                <a
                  key={index}
                  href={link}
                  className="block px-4 py-2 hover:bg-gray-100 font-light text-base"
                >
                  {sub}
                </a>
              ) : (
                <span
                  key={index}
                  className="block px-4 py-2 font-light text-base text-gray-400 cursor-not-allowed"
                >
                  {sub}
                </span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setMenuOpen(false);
      setOpenDropdown(null);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 로그인 상태 가져오기
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      {/* 네비게이션 바 */}
      <nav className="bg-[#59bd7b] p-6 pr-10 text-white flex justify-between items-center">
        
        <div>
            <img src="/img/logo.svg" alt=""></img>
            <p className="text-sm">사내용 시스템</p>
        </div>

        {/* ✅ PC 메뉴 */}
        <div className="hidden md:flex space-x-6 relative">
          {Object.keys(menuData).map((title) => (
            <MenuItem
              key={title}
              title={title}
              subItems={menuData[title]}
              isMobile={false}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              user={user}
            />
          ))}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-[#2d8c4a] transition"
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* ✅ 모바일 메뉴 */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 p-6 flex flex-col"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="mb-4 self-end p-2 rounded-lg hover:bg-gray-200"
            >
              <X size={28} />
            </button>

            {/* 모바일 메뉴 리스트 */}
            <nav className="flex flex-col space-y-5 text-lg text-gray-800 font-bold">
              {Object.keys(menuData).map((title) => (
                <MenuItem
                  key={title}
                  title={title}
                  subItems={menuData[title]}
                  isMobile={true}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  user={user}
                />
              ))}
            </nav>
            <div className="text-sm text-gray-400 absolute bottom-20 left-2/5">NEXT group</div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserInfo /> {/* 로그인 정보 */}

      {/* 본문 (동적으로 변경) */}
        <main className="p-6">
            {children}
        </main>

        <div className="h-[250px] mt-30 relative">

          <div className="flex justify-between text-black m-5 text-xs">
            <div>
              <div className="flex items-center gap-4 mr-5 pt-5 pb-2">
                <a href="https://nextgroup.or.kr/" target="_black" className="hover:opacity-75"><img src="/blog/top_link1.png" className="w-6"/></a>
              
                <p className="font-bold">NEXT group</p>
                <p>서울 강남구 봉은사로 213</p>
                <p>센트럴타워 8-9층</p>
              </div> 
              
              <p className="text-[#3d6d69]">Find the NEXT, envision the realization of a sustainable net-zero economic system</p>

            </div>
          </div>
            
        </div>
    </div>
  );
}
