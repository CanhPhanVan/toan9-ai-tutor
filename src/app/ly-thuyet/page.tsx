import Link from 'next/link'
import { TOPICS } from '@/lib/topics'

export default function LyThuyetPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Trang chủ</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Lý thuyết</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lý thuyết theo chủ đề</h2>
          <p className="text-gray-600">Ôn tập lý thuyết, công thức và ví dụ minh họa cho từng chủ đề Toán 9</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic) => (
            <Link key={topic.id} href={`/ly-thuyet/${topic.id}`}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 p-5 cursor-pointer border border-gray-100 hover:border-indigo-200 group h-full">
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0 w-10 text-center">{topic.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Chủ đề {topic.order}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm leading-tight">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topic.description}</p>
                    <span className="inline-block mt-2 text-xs text-indigo-400 font-medium group-hover:text-indigo-600">
                      Xem lý thuyết →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <h3 className="font-bold text-indigo-800 mb-2">💡 Hướng dẫn học</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>1. Đọc tóm tắt lý thuyết để nắm công thức cốt lõi</li>
            <li>2. Xem ví dụ minh họa từng bước</li>
            <li>3. Chú ý phần lỗi thường gặp để tránh</li>
            <li>4. Sau đó làm bài tập để củng cố</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
