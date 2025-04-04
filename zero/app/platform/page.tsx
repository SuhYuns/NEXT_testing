"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// 토글 함수 (체크박스)
function toggleSelection(
  setList: React.Dispatch<React.SetStateAction<string[]>>,
  item: string
) {
  setList((prev) =>
    prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
  );
}

export default function BoardPage() {
  // -------------------
  // 1) 게시글 로드
  // -------------------
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, []);

  // -------------------
  // 2) 필터 상태
  // -------------------
  const [filtersOpen, setFiltersOpen] = useState(false); // 모바일에서 열고 닫기
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const topics = ["energy", "industry", "law & policy", "others"];
  const categories = ["zerobar original", "zerobar guest", "Watt the science", "others"];

  // -------------------
  // 3) 게시글 필터링
  // -------------------
  const filteredPosts = posts.filter((post) => {
    if (!post.state) return false;
    const matchTopic =
      selectedTopics.length === 0 || selectedTopics.includes(post.topics);
    const matchCategory =
      selectedCategories.length === 0 || selectedCategories.includes(post.category);

    const lowerSearch = searchTerm.toLowerCase();
    const matchSearch =
      searchTerm === "" ||
      post.title?.toLowerCase().includes(lowerSearch) ||
      post.content?.toLowerCase().includes(lowerSearch) ||
      post.writer?.toLowerCase().includes(lowerSearch);

    return matchTopic && matchCategory && matchSearch;
  });

  // -------------------
  // 4) 페이지네이션
  // -------------------
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // 필터가 바뀔 때마다 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopics, selectedCategories, searchTerm]);

  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="p-4">

      {/* 모바일에서만 보이는 필터 토글 버튼 */}
      <button
        className="md:hidden mb-10 x-3 bg-black p-5 ustify-center hover:bg-gray-800 w-full text-white"
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
            w-full md:w-1/4 p-4 transition-transform duration-300 
            bg-gray-100 
            ${filtersOpen ? "block" : "hidden"}  /* 모바일에서 토글 */
            md:block                              /* 데스크톱에서는 항상 보임 */
          `}
        >
          <h2 className="text-lg font-bold mb-4">Filters</h2>

          {/* 토픽/카테고리 공용 로직 */}
          {[ 
            { label: "TOPIC", items: topics, state: selectedTopics, setState: setSelectedTopics },
            { label: "CATEGORY", items: categories, state: selectedCategories, setState: setSelectedCategories },
          ].map(({ label, items, state, setState }) => (
            <div key={label} className="mt-4">
              <h3 className="font-semibold">{label}</h3>
              <ul className="space-y-2 mt-2 flex flex-wrap gap-4">
                {items.map((item) => (
                  <li key={item}>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={state.includes(item)}
                        onChange={() => toggleSelection(setState, item)}
                        className="form-checkbox"
                      />
                      <span>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 검색어 입력 */}
          <div className="mt-4">
            <h3 className="font-semibold">SEARCH</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Search..."
            />
          </div>

          {/* Search / Write 버튼들 */}
          <div className="mt-10 bg-black p-5 flex items-center justify-center hover:bg-gray-800">
            <span className="text-center text-white text-lg">SEARCH</span>
          </div>
          <div className="mt-2 bg-black p-5 flex items-center justify-center hover:bg-gray-800">
            <Link href="/platform/write">
              <span className="text-center text-white text-lg">WRITE</span>
            </Link>
          </div>
          <div className="mt-2 bg-black p-5 flex items-center justify-center hover:bg-gray-800">
            <Link href="/platform/manage">
              <span className="text-center text-white text-lg">MANAGE</span>
            </Link>
          </div>
        </aside>

        {/* 게시글 목록 영역 */}
        <main className="w-full md:w-3/4">
          <h1 className="text-3xl font-bold mb-4">Board</h1>

          {/* 반응형 그리드: 모바일 1열, sm 2열, md 3열 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentPosts.map((post) => (
              <Link key={post.id} href={`/platform/view/${post.id}`}>
                <div
                  className="
                    bg-white shadow-md p-4 hover:bg-gray-100 
                    min-h-[350px] flex flex-col justify-start
                  "
                >
                  <p className="text-left mb-2">
                    {post.category} ｜ {post.topics}
                  </p>
                  <img
                    src={`/thumbnail/${post.thumbnail}`}
                    alt="Thumbnail"
                    className="w-full h-40 object-cover mb-2"
                  />
                  <h2 className="font-semibold text-xl">{post.title}</h2>
                  <p className="text-gray-600">
                    {post.writer} | 조회수 : {post.views}
                  </p>
                  <p className="mt-auto text-gray-600 line-clamp-2">
                    {(post.content || "")
                      .replace(/<\/?[^>]+(>|$)/g, "")
                      .replace(/[*_~`]/g, "")
                      .replace(/\n/g, " ")
                      .slice(0, 50) + "..."}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 버튼 */}
          <div className="flex justify-center mt-15 space-x-2">
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page ? "bg-gray-300" : "bg-white"
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
