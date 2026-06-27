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
  assignedTo: string
  dueDate: string | null
  note: string | null
  createdAt: string
  _count: { completions: number }
}

type DbExercise = { id: string; title: string; content: string; topicId: string; topicName: string; difficulty?: string }
type Student = { id: string; name: string; email: string }
type ExerciseItem = { id: string; title: string; content: string; topicId: string; topicName: string; difficulty: string; isDb?: boolean }

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const [assignmentTitle, setAssignmentTitle] = useState('Bai tap bat buoc Toan 9')
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([])
  const [assignMode, setAssignMode] = useState<'all' | 'specific'>('all')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [mandatory, setMandatory] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/assignments').then(r => r.json()),
      fetch('/api/admin/exercises').then(r => r.json()),
      fetch('/api/admin/students').then(r => r.json()),
    ]).then(([aData, eData, sData]) => {
      setAssignments(aData.assignments ?? [])
      setStudentCount(aData.studentCount ?? 0)
      setDbExercises(eData.exercises ?? [])
      setStudents(Array.isArray(sData) ? sData : (sData.students ?? []))
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const allExercises: ExerciseItem[] = [
    ...EXERCISES.map(e => ({
      id: e.id,
      title: e.title,
      content: e.content ?? '',
      topicId: e.topicId,
      topicName: TOPICS.find(t => t.id === e.topicId)?.name ?? '',
      difficulty: e.difficulty,
    })),
    ...dbExercises.map(e => ({
      id: e.id, title: e.title, content: e.content ?? '',
      topicId: e.topicId, topicName: e.topicName,
      difficulty: e.difficulty ?? 'medium', isDb: true,
    })),
  ]

  const exercisesForTopic = selectedTopicId
    ? allExercises.filter(e => e.topicId === selectedTopicId)
    : allExercises

  function toggleExercise(id: string) {
    setSelectedExerciseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleAllVisible() {
    const visibleIds = exercisesForTopic.map(e => e.id)
    const allSelected = visibleIds.every(id => selectedExerciseIds.includes(id))
    if (allSelected) {
      setSelectedExerciseIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      setSelectedExerciseIds(prev => [...new Set([...prev, ...visibleIds])])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (selectedExerciseIds.length === 0) {
      setMsg({ type: 'error', text: 'Chua chon bai tap nao' }); return
    }
    if (assignMode === 'specific' && !selectedStudentId) {
      setMsg({ type: 'error', text: 'Chua chon hoc sinh' }); return
    }
    setSaving(true)

    const assignedTo = assignMode === 'all' ? 'all' : [selectedStudentId]
    let successCount = 0
    for (const exId of selectedExerciseIds) {
      const ex = allExercises.find(e => e.id === exId)
      if (!ex) continue
      try {
        const res = await fetch('/api/admin/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: exId,
            exerciseTitle: ex.title,
            topicId: ex.topicId,
            topicName: ex.topicName,
            assignedTo,
            dueDate: dueDate || null,
            note: note || null,
          }),
        })
        if (res.ok) successCount++
      } catch { /* continue */ }
    }

    setSaving(false)
    if (successCount > 0) {
      setMsg({ type: 'success', text: `Da giao ${successCount} bai tap thanh cong!` })
      setSelectedExerciseIds([])
      fetchData()
    } else {
      setMsg({ type: 'error', text: 'Giao bai that bai' })
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Xoa bai giao "${title}"?`)) return
    setDeletingId(id)
    await fetch('/api/admin/assignments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeletingId(null); fetchData()
  }

  function assignedToLabel(a: Assignment) {
    if (a.assignedTo === 'all') return `Tat ca (${studentCount} hs)`
    try { const ids: string[] = JSON.parse(a.assignedTo); return `${ids.length} hoc sinh` }
    catch { return '-' }
  }

  function completionDenominator(a: Assignment) {
    if (a.assignedTo === 'all') return studentCount
    try { return JSON.parse(a.assignedTo).length } catch { return studentCount }
  }

  const visibleAllSelected = exercisesForTopic.length > 0 &&
    exercisesForTopic.every(e => selectedExerciseIds.includes(e.id))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Giao bai tap</h1>
        <p className="text-sm text-gray-500 mt-0.5">Admin/giao vien chon bai trong ngan hang va giao cho lop/hoc sinh</p>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 self-start">
          <h2 className="text-lg font-bold text-gray-800">Tao bai giao moi</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tieu de bai giao</label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={e => setAssignmentTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Giao cho lop</label>
              <select
                value={assignMode}
                onChange={e => { setAssignMode(e.target.value as 'all' | 'specific'); setSelectedStudentId('') }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="all">Tat ca hoc sinh</option>
                <option value="specific">Chon rieng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Han hoan thanh</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {assignMode === 'specific' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hoac giao rieng hoc sinh</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">-- Chon hoc sinh --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.email}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chu</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="VD: Hoan thanh truoc tiet hoc ngay mai."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mandatory}
              onChange={e => setMandatory(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Bai bat buoc phai hoan thanh</span>
          </label>

          {selectedExerciseIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-blue-700 font-medium">
              Da chon {selectedExerciseIds.length} bai tap
            </div>
          )}

          <button
            type="submit"
            disabled={saving || selectedExerciseIds.length === 0}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Dang giao...' : selectedExerciseIds.length > 0 ? `Giao bai tap (${selectedExerciseIds.length})` : 'Giao bai tap'}
          </button>
        </form>

        {/* RIGHT: Exercise list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Chon bai tap</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {exercisesForTopic.length} bai
            </span>
          </div>

          {/* Topic filter */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedTopicId('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${selectedTopicId === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tat ca
            </button>
            {TOPICS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopicId(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${selectedTopicId === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Select all row */}
          <div className="px-5 py-2.5 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
            <input
              type="checkbox"
              checked={visibleAllSelected}
              onChange={toggleAllVisible}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-medium">Chon tat ca bai hien thi</span>
            {selectedExerciseIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedExerciseIds([])}
                className="ml-auto text-xs text-red-500 hover:text-red-700"
              >
                Huy chon
              </button>
            )}
          </div>

          {/* Exercise list */}
          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            {exercisesForTopic.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">Khong co bai tap</div>
            ) : (
              exercisesForTopic.map(ex => {
                const checked = selectedExerciseIds.includes(ex.id)
                const preview = ex.content.replace(/\$[^$]*\$/g, '...').replace(/\n/g, ' ').slice(0, 120)
                return (
                  <label
                    key={ex.id}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExercise(ex.id)}
                      className="mt-0.5 w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold leading-snug ${checked ? 'text-blue-800' : 'text-gray-800'}`}>
                        {ex.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ex.topicName}{ex.difficulty ? ` · ${ex.difficulty}` : ''}{ex.isDb ? ' · DB' : ''}
                      </p>
                      {preview && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {preview}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Assignment list */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Danh sach bai da giao</h2>
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Dang tai...</div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>Chua co bai giao nao</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bai tap</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Chu de</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Giao cho</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Han nop</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Hoan thanh</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngay giao</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Xoa</th>
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
                    <td className="px-4 py-3 text-gray-600 text-xs">{assignedToLabel(a)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <span className="text-green-600">{a._count.completions}</span>
                        <span className="text-gray-400">/{completionDenominator(a)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(a.id, a.exerciseTitle)}
                        disabled={deletingId === a.id}
                        className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === a.id ? '...' : 'Xoa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
