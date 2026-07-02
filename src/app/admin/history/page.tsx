import { prisma } from '@/lib/prisma'
import { EXERCISES } from '@/lib/exercises'
import { HistoryFilters } from './HistoryFilters'

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; userId?: string }>
}) {
  const { period = 'week', userId = '' } = await searchParams

  const now = new Date()
  const from = new Date(now)
  if (period === 'today') from.setHours(0, 0, 0, 0)
  else if (period === 'week') from.setDate(now.getDate() - 7)
  else if (period === 'month') from.setMonth(now.getMonth() - 1)
  else from.setFullYear(2000)

  const [submissions, students] = await Promise.all([
    prisma.submission.findMany({
      where: {
        submittedAt: { gte: from },
        ...(userId ? { userId } : {}),
      },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    }),
    prisma.user.findMany({
      where: { role: 'student' },
      select: { id: true, name: true, email: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Build exerciseId → content map from DB exercises + static exercises
  const exerciseIds = [...new Set(submissions.map((s: { exerciseId: string }) => s.exerciseId))]
  const dbExerciseContents = await prisma.dbExercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, content: true },
  })
  const staticContentMap = new Map(EXERCISES.map(e => [e.id, e.content]))
  const dbContentMap = new Map(dbExerciseContents.map((e: { id: string; content: string }) => [e.id, e.content]))
  const contentMap = new Map([...staticContentMap, ...dbContentMap])

  const totalCount = submissions.length
  const selfSolvedCount = submissions.filter((s: { aiHelpCount: number }) => s.aiHelpCount === 0).length
  const aiAssistedCount = submissions.filter((s: { aiHelpCount: number }) => s.aiHelpCount > 0).length
  const selfPercent = totalCount > 0 ? Math.round((selfSolvedCount / totalCount) * 100) : 0

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🗓️ Lịch sử học sinh</h1>

      <HistoryFilters period={period} userId={userId} students={students} count={submissions.length} />

      {/* Thống kê tự làm vs AI */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium mb-1">Tổng lượt nộp</p>
            <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-100 shadow-sm p-5">
            <p className="text-xs text-green-600 font-medium mb-1">✋ Tự làm 100%</p>
            <p className="text-2xl font-bold text-green-700">{selfSolvedCount}</p>
            <p className="text-xs text-green-500 mt-0.5">{selfPercent}% tổng bài nộp</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm p-5">
            <p className="text-xs text-indigo-600 font-medium mb-1">🤖 Có hỏi AI gia sư</p>
            <p className="text-2xl font-bold text-indigo-700">{aiAssistedCount}</p>
            <p className="text-xs text-indigo-500 mt-0.5">{100 - selfPercent}% tổng bài nộp</p>
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Không có dữ liệu trong khoảng thời gian này</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Học sinh</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Bài tập</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Chủ đề</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Kết quả</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Hỗ trợ AI</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map(s => {
                const helped = s.aiHelpCount > 0
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{s.userName ?? 'Học sinh'}</td>
                    <td className="px-5 py-3 max-w-xs">
                      <div className="text-gray-700 font-medium truncate">{s.exerciseTitle ?? s.exerciseId}</div>
                      {contentMap.has(s.exerciseId) && (
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-snug">
                          {(() => { const c = contentMap.get(s.exerciseId)!.replace(/\$\$[\s\S]*?\$\$/g, m => m.slice(2,-2)).replace(/\$[^$]+\$/g, m => m.slice(1,-1)); return c.length > 130 ? c.slice(0,130)+'…' : c })()}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{s.topicName ?? '—'}</td>
                    <td className="px-5 py-3 text-center">
                      {s.isCorrect === null ? (
                        <span className="text-gray-400 text-xs">—</span>
                      ) : s.isCorrect ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">✅ Đúng</span>
                      ) : (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">❌ Sai</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {helped ? (
                        <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full border border-indigo-100 font-medium whitespace-nowrap">
                          🤖 {s.aiHelpCount} lần
                        </span>
                      ) : (
                        <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full border border-green-100 font-medium whitespace-nowrap">
                          ✋ Tự làm
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(s.submittedAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
