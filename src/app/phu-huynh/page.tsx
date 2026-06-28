'use client'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface WeekdayPoint { label: string; total: number; correct: number; rate: number }
interface TopicStat { topic: string; total: number; wrong: number; wrongRate: number; lastWrongTitle: string }
interface RecentSelf { id: string; exerciseTitle: string; topicName: string; score: number | null; submittedAt: string }
interface HistoryRow {
  id: string; submittedAt: string; exerciseTitle: string; topicName: string
  score: number | null; isCorrect: boolean | null; aiHelpCount: number; howDone: string; studentName: string
}
interface Donut { total: number; correct: number; wrong: number; withAI: number; viewedSolution: number; overallRate: number }

interface DashboardData {
  students: { id: string; name: string; studentCode: string }[]
  noStudents?: boolean
  parentName: string
  weekdayData: WeekdayPoint[]
  donut: Donut
  topWrongTopics: TopicStat[]
  recentSelf: RecentSelf[]
  history: HistoryRow[]
}

// SVG Donut
function DonutChart({ data }: { data: Donut }) {
  const R = 54, cx = 70, cy = 70, stroke = 18
  const circumference = 2 * Math.PI * R
  const segments = [
    { value: data.correct,        color: '#22c55e', label: `Đúng: ${data.correct} bài` },
    { value: data.wrong,          color: '#f87171', label: `Sai/cần sửa: ${data.wrong} bài` },
    { value: data.withAI - data.viewedSolution, color: '#a78bfa', label: `Có hỏi AI: ${data.withAI} bài` },
    { value: data.viewedSolution, color: '#c084fc', label: `Xem lời giải AI: ${data.viewedSolution} bài` },
  ].filter(s => s.value > 0)

  let offset = 0
  const arcs = segments.map(seg => {
    const dash = (seg.value / data.total) * circumference
    const arc = { ...seg, dash, offset }
    offset += dash
    return arc
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={arc.color} strokeWidth={stroke}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1f2937">{data.overallRate}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#6b7280">chính xác</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-gray-600">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Weekday bar chart
function WeekdayBars({ data }: { data: WeekdayPoint[] }) {
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-14 text-right shrink-0">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
            {d.total > 0 && (
              <div className="h-5 rounded-full transition-all"
                style={{
                  width: `${d.rate}%`,
                  background: d.rate >= 80 ? '#22c55e' : d.rate >= 50 ? '#f59e0b' : '#3b82f6',
                  minWidth: '8px',
                }}
              />
            )}
            {d.total > 0 && d.rate > 10 && (
              <span className="absolute left-2 top-0 h-5 flex items-center text-[11px] font-semibold text-white">
                {d.rate}%
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 w-12 shrink-0 text-right">
            {d.total > 0 ? `${d.total} bài` : '–'}
          </span>
        </div>
      ))}
    </div>
  )
}

function ScoreBadge({ score, isCorrect }: { score: number | null; isCorrect: boolean | null }) {
  const pct = score != null ? Math.round(score) : null
  if (pct == null) return <span className="text-gray-300 text-xs">–</span>
  const color = pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{pct}%</span>
}

function HowDoneBadge({ howDone, aiHelpCount }: { howDone: string; aiHelpCount: number }) {
  if (howDone === 'self') return <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full">Tự làm</span>
  if (howDone === 'solution') return <span className="text-xs text-red-500 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">Xem lời giải</span>
  return <span className="text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full">Có hỏi AI {aiHelpCount} lượt</span>
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  const hhmm = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const date = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  return `${hhmm} ${date}`
}

export default function PhuHuynhDashboard() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/phu-huynh/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-gray-400 animate-pulse">
      Đang tải dữ liệu...
    </div>
  )

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Dashboard phụ huynh</h1>
          <p className="text-xs text-gray-400 mt-0.5">Theo dõi tiến bộ, thói quen tự học và mức độ dùng AI của con</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Phụ huynh {session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Đăng xuất
          </button>
        </div>
      </header>

      {data.noStudents ? (
        <div className="max-w-lg mx-auto mt-20 text-center bg-white rounded-2xl border border-amber-100 p-10">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-700">Chưa có học sinh được gán</p>
          <p className="text-sm text-gray-400 mt-1">Liên hệ giáo viên/admin để được gán học sinh vào tài khoản của bạn</p>
        </div>
      ) : (
        <div className="px-6 py-6 space-y-5 max-w-[1400px] mx-auto">

          {/* Row 1: Weekday chart + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">📅 Tiến độ 7 ngày qua</h2>
              <WeekdayBars data={data.weekdayData} />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">📊 Tổng quan ({data.donut.total} bài)</h2>
              {data.donut.total === 0
                ? <p className="text-sm text-gray-400 italic">Chưa có bài làm nào</p>
                : <DonutChart data={data.donut} />
              }
            </div>
          </div>

          {/* Row 2: Wrong topics + Recent self */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Con sai nhiều ở phần nào?</h2>
              {data.topWrongTopics.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Tuyệt vời! Không có phần nào sai nhiều</p>
              ) : (
                <div className="space-y-4">
                  {data.topWrongTopics.map(t => (
                    <div key={t.topic}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{t.topic}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.wrongRate >= 70 ? 'bg-red-100 text-red-600' : t.wrongRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          Sai {t.wrongRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                        <div className="h-2 rounded-full"
                          style={{ width: `${t.wrongRate}%`, background: t.wrongRate >= 70 ? '#f87171' : t.wrongRate >= 40 ? '#fbbf24' : '#a3e635' }} />
                      </div>
                      {t.lastWrongTitle && (
                        <p className="text-xs text-gray-400 italic truncate">Chưa chắc đáp án cuối: {t.lastWrongTitle}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Bài tự làm gần đây</h2>
              {data.recentSelf.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Chưa có dữ liệu</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">Bài</th>
                      <th className="text-center pb-2 font-medium w-14">Điểm</th>
                      <th className="text-right pb-2 font-medium w-20">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentSelf.map(s => (
                      <tr key={s.id}>
                        <td className="py-2 pr-2">
                          <p className="text-gray-700 truncate max-w-[240px]">{s.exerciseTitle}</p>
                          <p className="text-xs text-gray-400 truncate">{s.topicName}</p>
                        </td>
                        <td className="py-2 text-center">
                          <ScoreBadge score={s.score} isCorrect={null} />
                        </td>
                        <td className="py-2 text-right text-xs text-gray-400 whitespace-nowrap">
                          {new Date(s.submittedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Row 3: Full history */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Lịch sử học tập gần nhất</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-400 font-medium">
                    <th className="text-left px-5 py-3">Thời gian</th>
                    <th className="text-left px-3 py-3">Bài</th>
                    <th className="text-left px-3 py-3">Chủ đề</th>
                    <th className="text-center px-3 py-3">Kết quả</th>
                    <th className="text-left px-3 py-3">Cách làm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.history.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Chưa có lịch sử học tập</td></tr>
                  ) : data.history.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtTime(row.submittedAt)}</td>
                      <td className="px-3 py-3 max-w-[260px]">
                        <p className="text-gray-700 truncate">{row.exerciseTitle}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{row.topicName}</td>
                      <td className="px-3 py-3 text-center">
                        <ScoreBadge score={row.score} isCorrect={row.isCorrect} />
                      </td>
                      <td className="px-3 py-3">
                        <HowDoneBadge howDone={row.howDone} aiHelpCount={row.aiHelpCount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
