import Link from 'next/link'
import { TOPICS } from '@/lib/topics'
import { EXERCISES } from '@/lib/exercises'
import { prisma } from '@/lib/prisma'

export default async function LamBaiPage() {
  // Đếm bài trong DB theo từng chủ đề
  const dbCounts = await prisma.dbExercise.groupBy({
    by: ['topicId'],
    where: { status: 'approved' },
    _count: { id: true },
  })
  const dbCountMap: Record<string, number> = Object.fromEntries(
    dbCounts.map(r => [r.topicId, r._count.id])
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Trang chủ</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">Làm bài theo chủ đề</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn chủ đề</h2>
          <p className="text-gray-600">Chọn chủ đề bạn muốn ôn luyện</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic) => {
            const staticCount = EXERCISES.filter(e => e.topicId === topic.id).length
            const dbCount = dbCountMap[topic.id] ?? 0
            const count = staticCount + dbCount
            return (
              <div
                key={topic.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-5 border border-gray-100 hover:border-indigo-200 group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl flex-shrink-0 w-10 text-center">{topic.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Chủ đề {topic.order}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">{topic.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topic.description}</p>
                    <p className="text-xs text-indigo-400 mt-2 font-medium">{count} bài tập</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/lam-bai/${topic.id}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center transition-colors"
                  >
                    Làm bài tập
                  </Link>
                  <Link
                    href={`/ly-thuyet/${topic.id}`}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold py-2 px-3 rounded-lg text-center transition-colors border border-indigo-100"
                  >
                    Lý thuyết
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
