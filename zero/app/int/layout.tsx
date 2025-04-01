"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

// ✅ 메뉴 데이터 (각 메뉴마다 다른 세부 항목을 설정 가능)
const menuData: { [key: string]: string[] } = {
  "정보": ["내 정보", "공용 계정", "좌석 배정", "가이드라인"],
  "커뮤니티": ["공지사항", "정보 공유", "동호회 게시판", "건의사항"],
  "기능": ["워크 플로우", "출퇴근 관리", "초대장"],
  "관리": ["자산관리", "계정관리", "멤버관리"],
  "사단법인 넥스트": ["홈페이지", "플랫폼"],
};

const menuLinks: { [key: string]: string } = {
    "공용 계정": "/test/info/account",
    "가이드라인": "/guidelines",
    "UI/UX 디자인": "/ui-ux-design",
    "회원가입": "/signup",
    "결제 방법": "/payment",
    "서비스 이용 팁": "/tips",
    "고객센터": "/support",
    "이메일 문의": "/contact",
    "FAQ": "/faq",
    "홈페이지": "https://nextgroup.or.kr/",
    "플랫폼": "../../platform",
  };

// ✅ 개별 메뉴 아이템 컴포넌트
const MenuItem = ({
  title,
  subItems,
  isMobile,
  openDropdown,
  setOpenDropdown,
}: {
  title: string;
  subItems: string[];
  isMobile: boolean;
  openDropdown: string | null;
  setOpenDropdown: (menu: string | null) => void;
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
            {subItems.map((sub, index) => (
              <a
                key={index}
                href={menuLinks[sub] || "#"}
                className="block px-4 py-2 hover:bg-gray-100 font-light text-base"
              >
                {sub}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
                />
              ))}
            </nav>
            <div className="text-sm text-gray-400 absolute bottom-20 left-2/5">NEXT group</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 본문 (동적으로 변경) */}
        <main className="p-6">
            {children}
        </main>
    </div>
  );
}
