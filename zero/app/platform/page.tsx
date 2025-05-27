"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Spinner from "@/component/Spinner";

// 토글 함수 (체크박스)
function toggleSelection(
  setList: React.Dispatch<React.SetStateAction<string[]>>,
  item: string
) {
  setList((prev) =>
    prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
  );
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

export default function BoardPage() {
  // -------------------
  // 1) 게시글 로드
  // -------------------
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // -------------------
  // 2) 필터 상태
  // -------------------
  const [filtersOpen, setFiltersOpen] = useState(false); // 모바일에서 열고 닫기
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const topics = ["Energy", "Industry", "Law & Policy", "Science", "Others"];
  // const categories = ["ZERO BAR original", "ZERO BAR guest", "Watt the science", "others"];
  const topicDescriptions: Record<string,string> = {
    Energy:        "에너지 생산·소비 관련 포스팅입니다.",
    Industry:      "산업 관련 포스팅입니다.",
    "Law & Policy":"법·정책 이슈 관련 포스팅입니다.",
    Science:       "과학 연구·기술 관련 포스팅입니다.",
    Others:        "기타 주제의 포스팅입니다."
  };

  const [sortBy, setSortBy] = useState<"popular" | "latest" | "oldest">("latest");

  // -------------------
  // 3) 게시글 필터링
  // -------------------
  const filteredPosts = posts.filter((post) => {
    if (!post.state) return false;
    const matchTopic =
      selectedTopics.length === 0 || selectedTopics.includes(post.topics);
    // const matchCategory =
    //   selectedCategories.length === 0 || selectedCategories.includes(post.category);

    const lowerSearch = searchTerm.toLowerCase();
    const matchSearch =
      searchTerm === "" ||
      post.title?.toLowerCase().includes(lowerSearch) ||
      post.content?.toLowerCase().includes(lowerSearch) ||
      post.writer?.toLowerCase().includes(lowerSearch);

    return matchTopic && matchSearch;
    // return matchTopic && matchCategory && matchSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "popular") {
      // 예: views가 많은 순
      return (b.views || 0) - (a.views || 0);
    } else {
      // created_at 기반 정렬
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    }
  });

  // -------------------
  // 4) 페이지네이션
  // -------------------
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // 필터가 바뀔 때마다 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopics, searchTerm]);
  // }, [selectedTopics, selectedCategories, searchTerm]);

  const indexOfLast  = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast  - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirst, indexOfLast);
  const totalPages   = Math.ceil(sortedPosts.length / postsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="p-4">

      {/* 모바일에서만 보이는 필터 토글 버튼 */}
      <button
        className="md:hidden mb-10 x-3 bg-gray-800 p-5 ustify-center hover:bg-gray-700 w-full text-white"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        {filtersOpen ? "Close Filters" : "Open Filters"}
      </button>

      {/* 메인 레이아웃: 왼쪽 필터(aside) + 오른쪽 게시글(main) */}
      <div className="flex flex-col md:flex-row gap-4">

        {/* 
          aside (필터 영역):
          - 데스크톱(md 이상)에서는 항상 보이도록 md:block
          - 모바일에서는 filtersOpen이 true일 때만 보여주기
        */}
        <aside
          className={`
            w-full md:w-1/6 p-4 transition-transform duration-300  
            ${filtersOpen ? "block" : "hidden"}  /* 모바일에서 토글 */
            md:block                              /* 데스크톱에서는 항상 보임 */
            
          `}
        >
          {/* <h2 className="text-lg font-bold mb-4">Filters</h2> */}

          {/* 토픽/카테고리 공용 로직 */}
          {[ 
            { label: "TOPIC", items: topics, state: selectedTopics, setState: setSelectedTopics },
            // { label: "CATEGORY", items: categories, state: selectedCategories, setState: setSelectedCategories },
          ].map(({ label, items, state, setState }) => (
            <div key={label} className="mt-4 w-1/2">
              <h3 className="text-lg mb-1">{label}</h3>
              <ul className="">

              {items.map(item => (
                <li key={item} className="relative group">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={state.includes(item)}
                      onChange={() => toggleSelection(setState, item)}
                      className="form-checkbox"
                    />
                    <span>{item}</span>
                  </label>
                  {/* hover 시 토스트 */}
                  <div className="absolute left-full top-1/2 ml-1 -translate-y-1/2 hidden group-hover:block
                                  bg-black text-white text-xs p-1 rounded whitespace-nowrap">
                    {topicDescriptions[item]}
                  </div>
                </li>
              ))}

              </ul>
            </div>
          ))}

          <div className="mt-4 text-lg mb-1">
            <label className="block mb-1">SORT BY</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="border p-2 py-1 rounded w-full"
            >
              <option value="latest" className="text-black">Latest</option>
              <option value="oldest" className="text-black">Oldest</option>
              <option value="popular" className="text-black">Popular</option>
            </select>
          </div>

          {/* 검색어 입력 */}
          <div className="mt-4 text-lg mb-1">
            <h3>SEARCH</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Search..."
            />
          </div>

          

          
        </aside>

        {/* 게시글 목록 영역 */}
        <main className="w-full md:w-5/6">

        {isLoading ? (
        <div className="w-full flex justify-center mt-20">
          <Spinner />
        </div>
      ) : currentPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentPosts.map((post) => (
            <Link key={post.id} href={`/platform/view/${post.id}`}>
              <div className="shadow-md p-4 hover:bg-gray-900 min-h-[350px] flex flex-col justify-start border border-gray-400 rounded h-full">
                <p className="text-left mt-2 mb-5 font-bold">
                  {post.topics}
                </p>
                <img
                  src={post.thumbnail || `/thumbnail/${post.thumbnail}`}
                  alt="Thumbnail"
                  className="w-full h-40 mb-2 object-cover"
                />
                <h2 className="font-semibold text-xl mb-4 truncate">
                  {post.title}
                </h2>
                <p className="text-gray-400">
                  {formatDate(post.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="w-full flex justify-center mt-20">
          조건에 일치하는 게시글이 없습니다.
        </div>
      )}

          {/* 페이지네이션 버튼 */}
          <div className="flex justify-center mt-15 space-x-2">
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border hover:bg-white rounded ${
                  currentPage === page ? "bg-gray-200" : "bg-gray-800"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          
        </main>
        
      </div>
          
    </div>
  );
}
