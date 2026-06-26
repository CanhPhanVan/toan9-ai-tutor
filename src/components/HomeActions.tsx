import Link from 'next/link'

export function HomeActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  const lamBaiHref = isLoggedIn ? '/lam-bai' : '/login?callbackUrl=/lam-bai'
  const kiemTraHref = isLoggedIn ? '/kiem-tra' : '/login?callbackUrl=/kiem-tra'

  return (
    <>
      <Link href={lamBaiHref}>
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 p-7 border border-gray-100 hover:border-indigo-200 group cursor-pointer h-full">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:bg-indigo-200 transition-colors">📚</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">Làm bài tập</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Chọn chủ đề → độ khó → làm từng bước → AI chấm và chỉ ra lỗi sai cụ thể
          </p>
          <div className="mt-4 text-sm font-medium">
            {isLoggedIn ? (
              <span className="text-indigo-500">12 chủ đề • 4 cấp độ →</span>
            ) : (
              <span className="text-amber-500">🔒 Đăng nhập để làm bài →</span>
            )}
          </div>
        </div>
      </Link>

      <Link href={kiemTraHref}>
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 p-7 border border-gray-100 hover:border-red-200 group cursor-pointer h-full">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:bg-red-200 transition-colors">📋</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">Kiểm tra & Thi thử</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Đề thi theo cấu trúc Sở GD&ĐT TP.HCM 2026 — HK1, HK2, Tuyển sinh lớp 10
          </p>
          <div className="mt-4 text-sm font-medium">
            {isLoggedIn ? (
              <span className="text-red-500">AI chấm • 10 điểm • Giải thích chi tiết →</span>
            ) : (
              <span className="text-amber-500">🔒 Đăng nhập để thi thử →</span>
            )}
          </div>
        </div>
      </Link>

      <Link href="/huong-dan">
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 p-7 border border-gray-100 hover:border-blue-200 group cursor-pointer h-full">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:bg-blue-200 transition-colors">🤖</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Hỏi AI giải bài</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Upload ảnh/PDF đề bài hoặc gõ bài toán → AI giải chi tiết từng bước với phương pháp tối ưu
          </p>
          <div className="mt-4 text-sm text-blue-500 font-medium">
            <span>Ảnh • PDF • Gõ tay →</span>
          </div>
        </div>
      </Link>
    </>
  )
}
