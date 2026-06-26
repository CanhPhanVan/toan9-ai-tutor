import { prisma } from '@/lib/prisma'
import { EXERCISES } from '@/lib/exercises'
import { TOPICS } from '@/lib/topics'

export default async function AdminDashboard() {
  const [totalStudents, totalSubmissions, recentSubmissions, topWrong] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.submission.count(),
    prisma.submission.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 8,
      select: { userName: true, exerciseTitle: true, isCorrect: true, submittedAt: true, topicName: true },
    }),
    prisma.submission.groupBy({
      by: ['exerciseId', 'exerciseTitle'],
      where: { isCorrect: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ])

  const correctCount = await prisma.submission.count({ where: { isCorrect: true } })
  const rate = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0

  const stats = [
    { label: 'Học sinh', value: totalStudents, icon: '👩‍🎓', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Lượt nộp bài', value: totalSubmissions, icon: '📝', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { label: 'Tỉ lệ đúng', value: `${rate}%`, icon: '✅', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Bài tập', value: EXERCISES.length, icon: '📚', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Chủ đề', value: TOPICS.length, icon: '🗂️', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Tổng quan</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent submissions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">🕐 Nộp bài gần đây</h2>
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có lượt nộp bài nào</p>
          ) : (
            <div className="space-y-2">
              {recentSubmissions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg">{s.isCorrect ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{s.exerciseTitle ?? 'Bài tập'}</p>
                    <p className="text-xs text-gray-400">{s.userName ?? 'Học sinh'} • {s.topicName ?? ''}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(s.submittedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top wrong exercises */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">⚠️ Bài sai nhiều nhất</h2>
          {topWrong.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {topWrong.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{item.exerciseTitle ?? item.exerciseId}</p>
                  </div>
                  <span className="text-sm font-bold text-red-500">{item._count.id} lần</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
