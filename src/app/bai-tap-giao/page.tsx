'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Assignment = {
  id: string
  exerciseId: string
  exerciseTitle: string
  topicId: string
  topicName: string
  dueDate: string | null
  note: string | null
  createdAt: string
  completed: boolean
  completedAt: string | null
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export default function BaiTapGiaoPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [completingId, setCompletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/assignments')
      .then(r => r.json())
      .then(d => { setAssignments(d.assignments ?? []); setLoading(false) })
  }, [])

  async function markComplete(id: string) {
    setCompletingId(id)
    await fetch('/api/assignments/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId: id }),
    })
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, completed: true, completedAt: new Date().toISOString() } : a))
    setCompletingId(null)
  }

  const pending = assignments.filter(a => !a.completed)
  const done = assignments.filter(a => a.completed)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Trang chủ</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">📋 Bài tập được giao</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3 animate-pulse">📋</p>
            <p>Đang tải...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-medium text-gray-600">Chưa có bài tập nào được giao</p>
            <Link href="/lam-bai" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">Đến trang luyện tập tự do →</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending */}
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-gray-800">⏳ Chưa hoàn thành</h2>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
                </div>
                <div className="space-y-3">
                  {pending.map(a => (
                    <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${isOverdue(a.dueDate) ? 'border-red-200' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {isOverdue(a.dueDate) && (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">⚠️ Quá hạn</span>
                            )}
                            <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">{a.topicName}</span>
                          </div>
                          <h3 className="font-semibold text-gray-800 text-base">{a.exerciseTitle}</h3>
                          {a.note && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mt-2 border border-amber-100">📌 {a.note}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>Giao ngày: {new Date(a.createdAt).toLocaleDateString('vi-VN')}</span>
                            {a.dueDate && (
                              <span className={isOverdue(a.dueDate) ? 'text-red-500 font-semibold' : ''}>
                                Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Link
                            href={`/lam-bai/${a.topicId}/${a.exerciseId}?assignmentId=${a.id}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors text-center"
                          >
                            ✏️ Làm bài
                          </Link>
                          <button
                            onClick={() => markComplete(a.id)}
                            disabled={completingId === a.id}
                            className="text-xs text-green-600 border border-green-200 hover:bg-green-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                          >
                            {completingId === a.id ? '...' : '✓ Đánh dấu xong'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Done */}
            {done.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4">✅ Đã hoàn thành ({done.length})</h2>
                <div className="space-y-2">
                  {done.map(a => (
                    <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4 opacity-75">
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{a.exerciseTitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {a.topicName} · Hoàn thành: {a.completedAt ? new Date(a.completedAt).toLocaleDateString('vi-VN') : '—'}
                        </p>
                      </div>
                      <Link
                        href={`/lam-bai/${a.topicId}/${a.exerciseId}`}
                        className="text-xs text-indigo-500 hover:underline flex-shrink-0"
                      >
                        Làm lại →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
