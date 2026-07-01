import { TOPICS } from '@/lib/topics'
import { EXERCISES } from '@/lib/exercises'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AdminTopicsPage() {
  const dbCounts = await prisma.dbExercise.groupBy({
    by: ['topicId'],
    where: { status: 'published' },
    _count: { id: true },
  })
  const dbCountMap: Record<string, number> = Object.fromEntries(
    dbCounts.map(r => [r.topicId, r._count.id])
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📚 Quản lý chủ đề</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{TOPICS.length} chủ đề</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Chủ đề</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Số bài tập</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Độ phủ</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {TOPICS.map(topic => {
              const staticCount = EXERCISES.filter(e => e.topicId === topic.id).length
              const dbCount = dbCountMap[topic.id] ?? 0
              const exCount = staticCount + dbCount
              const difficulties = { easy: 0, medium: 0, hard: 0, advanced: 0 }
              EXERCISES.filter(e => e.topicId === topic.id).forEach(e => {
                if (e.difficulty in difficulties) difficulties[e.difficulty as keyof typeof difficulties]++
              })
              return (
                <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{topic.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{topic.description ?? ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{topic.id}</code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-indigo-600">{exCount}</span>
                    {dbCount > 0 && <span className="text-xs text-gray-400 ml-1">({staticCount} có sẵn + {dbCount} DB)</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 text-xs">
                      {difficulties.easy > 0 && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Dễ: {difficulties.easy}</span>}
                      {difficulties.medium > 0 && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">TB: {difficulties.medium}</span>}
                      {difficulties.hard > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Khó: {difficulties.hard}</span>}
                      {difficulties.advanced > 0 && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">NC: {difficulties.advanced}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/lam-bai/${topic.id}`}
                      className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline">
                      Xem bài tập →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
        💡 Chủ đề hiện tại được quản lý trong file <code className="font-mono bg-amber-100 px-1 rounded">src/lib/topics.ts</code>.
        Để thêm chủ đề mới, chỉnh sửa file đó và deploy lại.
      </div>
    </div>
  )
}
