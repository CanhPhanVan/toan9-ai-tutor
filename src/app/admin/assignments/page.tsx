'use client'
import { useState, useEffect } from 'react'
import { TOPICS } from '@/lib/topics'
import { EXERCISES } from '@/lib/exercises'

type Assignment = {
  id: string
  exerciseId: string
  exerciseTitle: string
  topicId: string
  topicName: string
  dueDate: string | null
  note: string | null
  createdAt: string
  _count: { completions: number }
}

type DbExercise = { id: string; title: string; topicId: string; topicName: string }

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exerciseId: '', topicId: '', dueDate: '', note: '', source: 'static' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/assignments').then(r => r.json()),
      fetch('/api/admin/exercises').then(r => r.json()),
    ]).then(([aData, eData]) => {
      setAssignments(aData.assignments ?? [])
      setStudentCount(aData.studentCount ?? 0)
      setDbExercises(eData.exercises ?? [])
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  // Merge static + DB exercises for selection
  const allExercises = [
    ...EXERCISES.map(e => ({ id: e.id, title: e.title, topicId: e.topicId, topicName: TOPICS.find(t => t.id === e.topicId)?.name ?? '' })),
    ...dbExercises.map(e => ({ id: e.id, title: `[DB] ${e.title}`, topicId: e.topicId, topicName: e.topicName })),
  ]

  const filteredExercises = form.topicId
    ? allExercises.filter(e => e.topicId === form.topicId)
    : allExercises

  function onTopicChange(topicId: string) {
    setForm(f => ({ ...f, topicId, exerciseId: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!form.exerciseId) { setMsg({ type: 'error', text: 'Chưa chọn bài tập' }); return }
    setSaving(true)
    const ex = allExercises.find(e => e.id === form.exerciseId)
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: form.exerciseId,
          exerciseTitle: ex?.title ?? '',
          topicId: ex?.topicId ?? '',
          topicName: ex?.topicName ?? '',
          dueDate: form.dueDate || null,
          note: form.note || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setMsg({ type: 'success', text: `Đã giao bài "${ex?.title}" cho tất cả học sinh!` })
      setForm({ exerciseId: '', topicId: '', dueDate: '', note: '', source: 'static' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Lỗi' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Xóa bài giao "${title}"?`)) return
    setDeletingId(id)
    await fetch('/api/admin/assignments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeletingId(null)
    fetchData()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Giao bài tập</h1>
          <p className="text-sm text-gray-500 mt-1">Giao bài bắt buộc cho toàn bộ học sinh ({studentCount} hs)</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setMsg(null) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Giao bài mới
        </button>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-800">Tạo bài giao mới</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Chủ đề (tùy chọn)</label>
              <select value={form.topicId} onChange={e => onTopicChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">— Tất cả chủ đề —</option>
                {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bài tập *</label>
              <select value={form.exerciseId} onChange={e => setForm(f => ({ ...f, exerciseId: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">— Chọn bài tập —</option>
                {filteredExercises.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hạn nộp (tùy chọn)</label>
              <input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú cho học sinh</label>
              <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="vd: Nộp trước thứ 6"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {saving ? 'Đang giao...' : '📤 Giao bài cho tất cả học sinh'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Đang tải...</div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Chưa có bài giao nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bài tập</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chủ đề</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hạn nộp</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Đã hoàn thành</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giao ngày</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {a.exerciseTitle}
                    {a.note && <p className="text-xs text-gray-400 mt-0.5">{a.note}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.topicName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {a.dueDate ? new Date(a.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <span className="text-green-600">{a._count.completions}</span>
                      <span className="text-gray-400">/{studentCount}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(a.id, a.exerciseTitle)}
                      disabled={deletingId === a.id}
                      className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deletingId === a.id ? '...' : '🗑️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
