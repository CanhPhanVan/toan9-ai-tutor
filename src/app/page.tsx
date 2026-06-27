import Link from 'next/link'
import { NavAuth } from '@/components/NavAuth'
import { auth } from '@/auth'
import { HomeActions } from '@/components/HomeActions'
import { AssignmentBanner } from '@/components/AssignmentBanner'

export default async function HomePage() {
  const session = await auth()
  const isLoggedIn = !!session

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">T9</div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">Toán 9 AI Tutor</h1>
              <p className="text-xs text-gray-500">Gia sư thông minh cho học sinh lớp 9</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            {isLoggedIn && (
              <>
                <Link href="/bai-tap-giao" className="hover:text-amber-600 transition-colors font-medium text-amber-600">📋 Bài giao</Link>
                <Link href="/lam-bai" className="hover:text-indigo-600 transition-colors font-medium">Làm bài</Link>
                <Link href="/kiem-tra" className="hover:text-indigo-600 transition-colors font-medium">Kiểm tra</Link>
              </>
            )}
            <Link href="/huong-dan" className="hover:text-indigo-600 transition-colors font-medium">Hướng dẫn</Link>
            <NavAuth />
          </nav>
          {/* Mobile nav */}
          <div className="md:hidden">
            <NavAuth />
          </div>
        </div>
      </header>

      {isLoggedIn && <AssignmentBanner />}

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-2 rounded-full mb-4 border border-indigo-100">
            ✨ Được hỗ trợ bởi AI thông minh
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Học Toán 9 <span className="text-indigo-600">thông minh hơn</span>
            <br />với AI Tutor
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Chấm bài từng bước, giải thích lý do sai, hướng dẫn chi tiết —
            như có gia sư riêng ngay trên điện thoại
          </p>

          {/* CTA buttons — server-rendered based on login state */}
          {isLoggedIn ? (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/lam-bai"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-colors shadow-md shadow-indigo-200">
                📚 Bắt đầu làm bài
              </Link>
              <Link href="/kiem-tra"
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-2xl text-base transition-colors border border-gray-200">
                📋 Thi thử & Kiểm tra
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-colors shadow-md shadow-indigo-200">
                🎓 Đăng ký học miễn phí
              </Link>
              <Link href="/login"
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-2xl text-base transition-colors border border-gray-200">
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          )}
        </div>

        {/* Main feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <HomeActions isLoggedIn={isLoggedIn} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { value: '12', label: 'Chủ đề', icon: '📖' },
            { value: '36+', label: 'Bài tập', icon: '✏️' },
            { value: 'AI', label: 'Chấm bài', icon: '🧠' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Topics preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Các chủ đề Toán 9</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '√', name: 'Căn bậc hai' },
              { icon: 'Δ', name: 'Phương trình bậc 2' },
              { icon: '△', name: 'Hình học phẳng' },
              { icon: '○', name: 'Đường tròn' },
              { icon: '=', name: 'Hệ phương trình' },
              { icon: '📈', name: 'Hàm số & đồ thị' },
              { icon: '📊', name: 'Thống kê' },
              { icon: '📝', name: 'Đề tổng hợp' },
            ].map((topic) => (
              <div key={topic.name}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <span>{topic.icon}</span>
                <span className="font-medium">{topic.name}</span>
              </div>
            ))}
          </div>
          {!isLoggedIn && (
            <p className="text-center text-sm text-gray-400 mt-4">
              👆 <Link href="/register" className="text-indigo-500 hover:underline font-medium">Đăng ký miễn phí</Link> để truy cập tất cả bài tập
            </p>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          Toán 9 AI Tutor • Hỗ trợ bởi AI
        </div>
      </footer>
    </div>
  )
}
