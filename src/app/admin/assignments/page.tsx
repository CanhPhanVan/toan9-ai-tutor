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

type DbExercise = { id: string; title: string; topicId: string; topicName: string }
type Student = { id: string; name: string; email: string }
type ExerciseItem = { id: string; title: string; topicId: string; topicName: string; isDb?: boolean }

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [assignMode, setAssignMode] = useState<'all' | 'specific'>('all')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
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
      id: e.id, title: e.title, topicId: e.topicId,
      topicName: TOPICS.find(t => t.id === e.topicId)?.name ?? '',
    })),
    ...dbExercises.map(e => ({
      id: e.id, title: e.title, topicId: e.topicId, topicName: e.topicName, isDb: true,
    })),
  ]

  const exercisesForTopic = selectedTopicId
    ? allExercises.filter(e => e.topicId === selectedTopicId)
    : allExercises

  function toggleStudent(id: string) {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function resetForm() {
    setSelectedTopicId(''); setSelectedExerciseId('')
    setAssignMode('all'); setSelectedStudentIds([])
    setDueDate(''); setNote('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!selectedExerciseId) { setMsg({ type: 'error', text: 'Chua chon bai tap' }); return }
    if (assignMode === 'specific' && selectedStudentIds.length === 0) {
      setMsg({ type: 'error', text: 'Chua chon hoc sinh nao' }); return
    }
    setSaving(true)
    const ex = allExercises.find(e => e.id === selectedExerciseId)
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedExerciseId,
          exerciseTitle: ex?.title ?? '',
          topicId: ex?.topicId ?? '',
          topicName: ex?.topicName ?? '',
          assignedTo: assignMode === 'all' ? 'all' : selectedStudentIds,
          dueDate: dueDate || null,
          note: note || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const whoText = assignMode === 'all'
        ? 'tat ca hoc sinh'
        : `${selectedStudentIds.length} hoc sinh duoc chon`
      setMsg({ type: 'success', text: `Da giao bai "${ex?.title}" cho ${whoText}!` })
      resetForm(); setShowForm(false); fetchData()
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Loi' })
    } finally { setSaving(false) }
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Giao bai tap</h1>
          <p className="text-sm text-gray-500 mt-1">Giao bai bat buoc cho hoc sinh ({studentCount} hs)</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setMsg(null) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Giao bai moi
        </button>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-6 space-y-5">
          <h2 className="font-bold text-gray-800">Tao bai giao moi</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">① Chon chu de</label>
            <div className="flex flex-wrap gap-2">
              <button type="button"
                onClick={() => { setSelectedTopicId(''); setSelectedExerciseId('') }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedTopicId === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                Tat ca
              </button>
              {TOPICS.map(t => (
                <button key={t.id} type="button"
                  onClick={() => { setSelectedTopicId(t.id); setSelectedExerciseId('') }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedTopicId === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              ② Chon bai tap
              <span className="font-normal text-gray-400 ml-1">({exercisesForTopic.length} bai)</span>
            </label>
            {exercisesForTopic.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">Khong co bai tap cho chu de nay</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {exercisesForTopic.map(ex => (
                  <button key={ex.id} type="button"
                    onClick={() => setSelectedExerciseId(ex.id)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                      selectedExerciseId === ex.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-medium'
                        : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-gray-50'
                    }`}>
                    <span className="line-clamp-2">{ex.title}</span>
                    {ex.isDb && <span className="text-xs text-purple-500 mt-0.5 block">Bai DB</span>}
                    {!selectedTopicId && (
                      <span className="text-xs text-gray-400 mt-0.5 block">{ex.topicName}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {selectedExerciseId && (
              <p className="text-xs text-indigo-600 mt-2">
                Da chon: {allExercises.find(e => e.id === selectedExerciseId)?.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">③ Giao cho</label>
            <div className="flex gap-3 mb-3">
              <button type="button"
                onClick={() => setAssignMode('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${assignMode === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                Giao tat ca ({studentCount} hs)
              </button>
              <button type="button"
                onClick={() => setAssignMode('specific')}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${assignMode === 'specific' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                Chon hoc sinh cu the
              </button>
            </div>

            {assignMode === 'specific' && (
              <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">Chua co hoc sinh nao</p>
                ) : (
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs text-gray-500 pb-1 border-b border-gray-100 cursor-pointer">
                      <input type="checkbox"
                        checked={selectedStudentIds.length === students.length && students.length > 0}
                        onChange={e => setSelectedStudentIds(e.target.checked ? students.map(s => s.id) : [])}
                        className="rounded" />
                      Chon tat ca
                    </label>
                    {students.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                        <input type="checkbox"
                          checked={selectedStudentIds.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="rounded" />
                        <span className="font-medium text-gray-700">{s.name}</span>
                        <span className="text-xs text-gray-400">{s.email}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Han nop (tuy chon)</label>
              <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chu cho hoc sinh</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="vd: Nop truoc thu 6"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowForm(false); resetForm() }}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Huy
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {saving ? 'Dang giao...' : '📤 Giao bai'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Dang tai...</div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Chua co bai giao nao</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bai tap</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chu de</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giao cho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Han nop</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Hoan thanh</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngay giao</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Xoa</th>
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
                  <td className="px-4 py-3 text-gray-500">
                    {a.dueDate ? new Date(a.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <span className="text-green-600">{a._count.completions}</span>
                      <span className="text-gray-400">/{completionDenominator(a)}</span>
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

