import { prisma } from '@/lib/prisma'
import { TOPICS } from '@/lib/topics'

export default async function AdminStatsPage() {
  const [byTopic, topWrong, topStudents] = await Promise.all([
    prisma.submission.groupBy({
      by: ['topicId', 'topicName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.submission.groupBy({
      by: ['exerciseId', 'exerciseTitle'],
      where: { isCorrect: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.submission.groupBy({
      by: ['userId', 'userName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ])

  const correctByTopic = await Promise.all(
    byTopic.map(t =>
      prisma.submission.count({ where: { topicId: t.topicId ?? undefined, isCorrect: true } })
    )
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📉 Thống kê & Hướng cải thiện</h1>

      {byTopic.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p>Chưa có dữ liệu. Học sinh cần nộp bài để có thống kê.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* By topic */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-5">Tỉ lệ đúng theo chủ đề</h2>
            <div className="space-y-4">
              {byTopic.map((t, i) => {
                const total = t._count.id
                const correct = correctByTopic[i]
                const rate = total > 0 ? Math.round((correct / total) * 100) : 0
                const topicName = t.topicName ?? TOPICS.find(tp => tp.id === t.topicId)?.name ?? t.topicId ?? 'Không rõ'
                return (
                  <div key={t.topicId ?? i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{topicName}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{correct}/{total} đúng</span>
                        <span className={`font-bold ${rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{rate}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${rate >= 70 ? 'bg-green-400' : rate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${rate}%` }} />
                    </div>
                    {rate < 50 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Học sinh gặp khó khăn — nên ôn lại lý thuyết chủ đề này
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top wrong exercises */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">❌ Bài tập sai nhiều nhất</h2>
              <div className="space-y-3">
                {topWrong.map((item, i) => (
                  <div key={item.exerciseId} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0
                      ${i === 0 ? 'bg-red-200 text-red-700' : i === 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{item.exerciseTitle ?? item.exerciseId}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500 flex-shrink-0">{item._count.id}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active students */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">🏆 Học sinh hoạt động nhất</h2>
              <div className="space-y-3">
                {topStudents.map((s, i) => (
                  <div key={s.userId ?? i} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0
                      ${i === 0 ? 'bg-yellow-200 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm text-gray-700 truncate">{s.userName ?? 'Học sinh'}</p>
                    <span className="text-sm font-semibold text-indigo-600">{s._count.id} bài</span>
                  </div>
                ))}
                {topStudents.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
