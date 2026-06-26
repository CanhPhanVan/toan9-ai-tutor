'use client'
import { useRouter } from 'next/navigation'

interface Student { id: string; name: string; email: string }

const PERIODS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: '30 ngày' },
  { value: 'all', label: 'Tất cả' },
]

export function HistoryFilters({
  period,
  userId,
  students,
  count,
}: {
  period: string
  userId: string
  students: Student[]
  count: number
}) {
  const router = useRouter()

  const nav = (p: string, u: string) => {
    router.push(`?period=${p}${u ? `&userId=${u}` : ''}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => nav(p.value, userId)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <select
        value={userId}
        onChange={e => nav(period, e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="">Tất cả học sinh</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
        ))}
      </select>

      <span className="text-sm text-gray-500 ml-auto">{count} lượt nộp</span>
    </div>
  )
}
