'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface DailyPoint { date: string; total: number; correct: number; rate: number }
interface RecentSub {
  id: string; exerciseTitle: string; topicName: string
  isCorrect: boolean | null; score: number | null; aiHelpCount: number; submittedAt: string; studentName: string
}

interface DashboardData {
  students: { id: string; name: string; studentCode: string }[]
  noStudents?: boolean
  today: { hasDone: boolean; count: number; correct: number; rate: number }
  overall: { total: number; correct: number; rate: number }
  week: { total: number; correct: number; rate: number; prevRate: number }
  month: { total: number; correct: number; rate: number; prevRate: number }
  topWrongTopics: { topic: string; count: number }[]
  aiStats: { total: number; withAI: number; fullAI: number; rateWithAI: number; rateFullAI: number }
  dailyData: DailyPoint[]
  recentSubs: RecentSub[]
}

function TrendBadge({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev
  if (prev === 0) return null
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)}% so với kỳ trước
    </span>
  )
}

function MiniBar({ data }: { data: DailyPoint[] }) {
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.date}: ${d.total} bài, ${d.rate}% đúng`}>
          <div className="w-full rounded-t flex flex-col justify-end" style={{ height: `${Math.round((d.total / max) * 72)}px`, minHeight: d.total > 0 ? '4px' : '0' }}>
            <div className="w-full rounded-t" style={{
              height: `${d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0}%`,
              minHeight: d.correct > 0 ? '3px' : '0',
              background: '#6366f1'
            }} />
            <div className="w-full rounded-t" style={{
              height: `${d.total > 0 ? Math.round(((d.total - d.correct) / d.total) * 100) : 100}%`,
              background: '#e5e7eb'
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PhuHuynhDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/phu-huynh/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Đang tải dữ liệu...</div>
    </div>
  )

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-indigo-600 text-sm transition-colors">🏠</Link>
            <span className="text-gray-300">|</span>
            <h1 className="font-bold text-gray-800">👨‍👩‍👧 Theo dõi học tập</h1>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Students */}
        {data.students.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.students.map(s => (
              <span key={s.id} className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
                🎓 {s.name} <span className="text-xs text-gray-400">{s.studentCode}</span>
              </span>
            ))}
          </div>
        )}

        {data.noStudents ? (
          <div className="bg-white rounded-2xl border border-amber-100 p-8 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-gray-700">Chưa có học sinh được gán</p>
            <p className="text-sm text-gray-400 mt-1">Liên hệ giáo viên/admin để gán học sinh vào tài khoản phụ huynh</p>
          </div>
        ) : (
          <>
            {/* Today card */}
            <div className={`rounded-2xl p-6 border ${data.today.hasDone ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{data.today.hasDone ? '✅' : '⏳'}</span>
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {data.today.hasDone ? `Hôm nay đã làm ${data.today.count} bài` : 'Hôm nay chưa làm bài'}
                  </p>
                  {data.today.hasDone && (
                    <p className="text-sm text-gray-600">
                      Đúng {data.today.correct}/{data.today.count} bài ({data.today.rate}%)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Tổng bài đã làm" value={data.overall.total} unit="bài" color="indigo" />
              <StatCard label="Tỉ lệ đúng tổng" value={data.overall.rate} unit="%" color={data.overall.rate >= 70 ? 'green' : 'amber'} />
              <StatCard label="Tuần này" value={data.week.rate} unit="%" color="blue"
                badge={<TrendBadge current={data.week.rate} prev={data.week.prevRate} />} />
              <StatCard label="Tháng này" value={data.month.rate} unit="%" color="violet"
                badge={<TrendBadge current={data.month.rate} prev={data.month.prevRate} />} />
            </div>

            {/* Chart + Wrong topics */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">📈 Bài làm 14 ngày qua</h3>
                <p className="text-xs text-gray-400 mb-4">Cột xanh = đúng · Cột xám = sai</p>
                <MiniBar data={data.dailyData} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">{data.dailyData[0]?.date}</span>
                  <span className="text-xs text-gray-400">{data.dailyData[data.dailyData.length - 1]?.date}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">⚠️ Chủ đề sai nhiều nhất</h3>
                {data.topWrongTopics.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Tuyệt vời! Không có chủ đề sai nhiều</p>
                ) : (
                  <div className="space-y-2">
                    {data.topWrongTopics.map(({ topic, count }) => (
                      <div key={topic} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-red-400 h-2 rounded-full" style={{ width: `${Math.min(100, count * 10)}%` }} />
                        </div>
                        <span className="text-xs text-gray-600 min-w-[4rem] text-right">{topic}</span>
                        <span className="text-xs font-bold text-red-600 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI usage */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm">🤖 Mức độ sử dụng AI</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <AiBar label="Bài có hỏi AI" value={data.aiStats.rateWithAI} count={data.aiStats.withAI} total={data.aiStats.total} color="#6366f1" />
                <AiBar label="Bài nhờ AI giải hoàn toàn" value={data.aiStats.rateFullAI} count={data.aiStats.fullAI} total={data.aiStats.total} color="#ef4444" />
              </div>
              {data.aiStats.rateFullAI > 50 && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  ⚠️ Con đang nhờ AI giải quá nhiều — hơn 50% bài làm. Hãy khuyến khích tự suy nghĩ trước khi hỏi AI.
                </p>
              )}
            </div>

            {/* Recent history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">🗓️ Lịch sử học tập gần nhất</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {data.recentSubs.length === 0 ? (
                  <div className="px-5 py-6 text-center text-gray-400 text-sm">Chưa có bài nào</div>
                ) : data.recentSubs.map(s => (
                  <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-lg">{s.isCorrect === true ? '✅' : s.isCorrect === false ? '❌' : '⏳'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{s.exerciseTitle}</p>
                      <p className="text-xs text-gray-400">{s.topicName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {s.aiHelpCount > 0 && (
                        <span className="text-xs text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
                          🤖 AI {s.aiHelpCount > 2 ? '(nhiều)' : ''}
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(s.submittedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, unit, color, badge }: {
  label: string; value: number; unit: string; color: string; badge?: React.ReactNode
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    violet: 'bg-violet-50 border-violet-100 text-violet-700',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[color] ?? colors.indigo}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}<span className="text-base font-medium ml-0.5">{unit}</span></p>
      {badge && <div className="mt-2">{badge}</div>}
    </div>
  )
}

function AiBar({ label, value, count, total, color }: { label: string; value: number; count: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}% ({count}/{total})</span>
      </div>
      <div className="bg-gray-100 rounded-full h-3">
        <div className="h-3 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}
