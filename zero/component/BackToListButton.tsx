import { useRouter } from "next/navigation";

export function BackToListButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/int/info/guideline/")}  // ← 목록 경로에 맞게 수정
      className="
        group inline-flex items-center gap-1
        w-fit
        px-4 py-2 rounded-full
        border border-gray-300 bg-white text-gray-700
        hover:bg-[#59bd7b] hover:text-white hover:border-transparent
        transition
      "
    >
      {/* 화살표 ― 패키지 설치 없이 유니코드만 사용 */}
      <span className="text-sm font-medium">목록으로</span>
    </button>
  );
}
