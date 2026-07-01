'use client'
import { useState, useEffect } from 'react'
import { EXERCISES } from '@/lib/exercises'
import { TOPICS } from '@/lib/topics'
import Link from 'next/link'

const DIFF_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó', advanced: 'Nâng cao' }
const DIFF_COLOR: Record<string, string> = {
  easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-orange-100 text-orange-700', advanced: 'bg-red-100 text-red-700',
}

type DbExerciseRow = { id: string; title: string; topicId: string; topicName: string; difficulty: string; status: string; createdAt: string }

export default function AdminExercisesPage() {
  const [filter, setFilter] = useState({ topic: '', diff: '', search: '' })
  const [onlyDuplicates, setOnlyDuplicates] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newEx, setNewEx] = useState({ title: '', content: '', topicId: '', difficulty: 'medium', method: '', solution: '', hints: '' })
  const [saving, setSaving] = useState(false)
  const [dbExercises, setDbExercises] = useState<DbExerciseRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const loadDbExercises = () =>
    fetch('/api/admin/exercises').then(r => r.json()).then(d => setDbExercises(d.exercises ?? []))

  useEffect(() => { loadDbExercises() }, [])

  const filtered = EXERCISES.filter(e =>
    (!filter.topic || e.topicId === filter.topic) &&
    (!filter.diff || e.difficulty === filter.diff) &&
    (!filter.search || e.title.toLowerCase().includes(filter.search.toLowerCase()))
  )

  // Titles that appear more than once in DB exercises — likely duplicates from AI batch generation
  const titleCounts = dbExercises.reduce<Record<string, number>>((acc, e) => {
    const key = e.title.trim().toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const isDuplicateTitle = (title: string) => titleCounts[title.trim().toLowerCase()] > 1

  const filteredDbExercises = dbExercises.filter(e =>
    (!filter.topic || e.topicId === filter.topic) &&
    (!filter.diff || e.difficulty === filter.diff) &&
    (!filter.search || e.title.toLowerCase().includes(filter.search.toLowerCase())) &&
    (!onlyDuplicates || isDuplicateTitle(e.title))
  )

  async function deleteExercise(id: string) {
    if (!confirm('Xóa bài tập này?')) return
    setDeletingId(id)
    await fetch('/api/admin/exercises', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeletingId(null)
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
    loadDbExercises()
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const visible = filteredDbExercises.map(e => e.id)
    const allSelected = visible.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) visible.forEach(id => next.delete(id))
      else visible.forEach(id => next.add(id))
      return next
    })
  }

  async function bulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Xóa ${selected.size} bài tập đã chọn?`)) return
    setBulkDeleting(true)
    await Promise.all([...selected].map(id =>
      fetch('/api/admin/exercises', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    ))
    setSelected(new Set())
    setBulkDeleting(false)
    loadDbExercises()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const topic = TOPICS.find(t => t.id === newEx.topicId)
    const res = await fetch('/api/admin/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEx, topicName: topic?.name ?? '' }),
    })
    if (res.ok) {
      setShowForm(false)
      setNewEx({ title: '', content: '', topicId: '', difficulty: 'medium', method: '', solution: '', hints: '' })
      loadDbExercises()
    }
    setSaving(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">✏️ Quản lý bài tập</h1>
        <button onClick={() => setShowForm(s => !s)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          + Thêm bài tập mới
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-800 mb-2">Tạo bài tập mới</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề *</label>
              <input value={newEx.title} onChange={e => setNewEx(p => ({ ...p, title: e.target.value }))} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Chủ đề *</label>
                <select value={newEx.topicId} onChange={e => setNewEx(p => ({ ...p, topicId: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="">Chọn chủ đề</option>
                  {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Độ khó *</label>
                <select value={newEx.difficulty} onChange={e => setNewEx(p => ({ ...p, difficulty: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung bài tập *</label>
            <textarea value={newEx.content} onChange={e => setNewEx(p => ({ ...p, content: e.target.value }))} required rows={4}
              placeholder="Nhập đề bài (có thể dùng LaTeX: $\sqrt{x}$, $x^2$...)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phương pháp giải</label>
              <input value={newEx.method} onChange={e => setNewEx(p => ({ ...p, method: e.target.value }))}
                placeholder="VD: Đặt nhân tử chung, Nhóm hạng tử..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gợi ý (mỗi gợi ý 1 dòng)</label>
              <input value={newEx.hints} onChange={e => setNewEx(p => ({ ...p, hints: e.target.value }))}
                placeholder="Gợi ý 1 | Gợi ý 2 | Gợi ý 3"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lời giải mẫu</label>
            <textarea value={newEx.solution} onChange={e => setNewEx(p => ({ ...p, solution: e.target.value }))} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
              {saving ? 'Đang lưu...' : '💾 Lưu bài tập'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-gray-200 text-gray-600 text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          placeholder="🔍 Tìm bài tập..."
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <select value={filter.topic} onChange={e => setFilter(f => ({ ...f, topic: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả chủ đề</option>
          {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filter.diff} onChange={e => setFilter(f => ({ ...f, diff: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
          <option value="advanced">Nâng cao</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 px-1 cursor-pointer">
          <input type="checkbox" checked={onlyDuplicates} onChange={e => setOnlyDuplicates(e.target.checked)}
            className="w-4 h-4 rounded accent-red-600" />
          Chỉ hiện bài trùng tiêu đề
        </label>
      </div>

      {/* DB exercises */}
      {dbExercises.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Bài tập do admin tạo ({filteredDbExercises.length}/{dbExercises.length})
            </h2>
            {selected.size > 0 && (
              <button onClick={bulkDelete} disabled={bulkDeleting}
                className="text-xs bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                {bulkDeleting ? '⏳ Đang xóa...' : `🗑️ Xóa ${selected.size} bài đã chọn`}
              </button>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox"
                      checked={filteredDbExercises.length > 0 && filteredDbExercises.every(e => selected.has(e.id))}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-300 cursor-pointer" />
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Tiêu đề</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Chủ đề</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Độ khó</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Trạng thái</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDbExercises.map(ex => (
                  <tr key={ex.id} className={`hover:bg-gray-50 ${selected.has(ex.id) ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(ex.id)} onChange={() => toggleSelect(ex.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-300 cursor-pointer" />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {ex.title}
                      {isDuplicateTitle(ex.title) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">⚠️ Trùng</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{ex.topicName}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLOR[ex.difficulty]}`}>{DIFF_LABEL[ex.difficulty]}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ex.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ex.status === 'published' ? 'Đã đăng' : 'Nháp'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => deleteExercise(ex.id)} disabled={deletingId === ex.id}
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === ex.id ? '...' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDbExercises.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Không có bài tập khớp bộ lọc</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Static exercises */}
      <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
        Bài tập có sẵn ({filtered.length}/{EXERCISES.length})
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Tiêu đề</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Chủ đề</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Độ khó</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(ex => {
              const topic = TOPICS.find(t => t.id === ex.topicId)
              return (
                <tr key={ex.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{ex.title}</td>
                  <td className="px-5 py-3 text-gray-500">{topic?.name ?? ex.topicId}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLOR[ex.difficulty]}`}>{DIFF_LABEL[ex.difficulty]}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/lam-bai/${ex.topicId}/${ex.id}`}
                      className="text-xs text-indigo-500 hover:text-indigo-700">Xem →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
