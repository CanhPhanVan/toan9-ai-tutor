'use client'
import { useState, useEffect, useCallback } from 'react'
import { EXAM_TYPE_LABELS } from '@/lib/examStructures'

interface ExamItem {
  id: string
  title: string
  type: string
  duration: number
  createdAt: string
  _count: { attempts: number }
}

const TYPES = Object.entries(EXAM_TYPE_LABELS)

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState('tuyen-sinh')
  const [count, setCount] = useState(10)
  const [log, setLog] = useState<string[]>([])
  const [filterType, setFilterType] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const fetchExams = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/exams' + (filterType ? `?type=${filterType}` : ''))
    const data = await res.json()
    setExams(data)
    setLoading(false)
  }, [filterType])

  useEffect(() => { fetchExams() }, [fetchExams])

  const generate = async () => {
    setGenerating(true)
    const typeLabel = EXAM_TYPE_LABELS[selectedType]
    setLog([`🚀 Đang tạo ${count} đề ${typeLabel}...`])

    const totalExisting = exams.filter(e => e.type === selectedType).length
    let created = 0

    for (let i = 0; i < count; i++) {
      setLog(prev => [...prev, `  ⏳ Đề ${i + 1}/${count}...`])
      try {
        const res = await fetch('/api/admin/generate-exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: selectedType, examIndex: i, totalExisting }),
        })
        const data = await res.json()

        if (res.status === 429 || data.isRateLimit) {
          const wait = data.retryAfter ?? 'vài phút'
          setLog(prev => [...prev, `  ⚠️ Hết quota Groq, thử lại sau ${wait}. Dừng tạm.`])
          break
        }
        if (data.error) {
          const isDup = data.error.includes('trung noi dung')
          setLog(prev => [...prev, `  ${isDup ? '🔁' : '❌'} Đề ${i + 1}: ${data.error.slice(0, 100)}`])
        } else {
          created++
          const modelTag = data.model ? ` [${data.model.split('-').slice(0,3).join('-')}]` : ''
          setLog(prev => [...prev, `  ✅ ${data.title}${modelTag}`])
          fetchExams()
        }
      } catch (e) {
        setLog(prev => [...prev, `  ❌ Lỗi kết nối: ${e}`])
      }

      if (i < count - 1) await new Promise(r => setTimeout(r, 3000))
    }

    setLog(prev => [...prev, ``, `🎉 Hoàn thành! Tạo được ${created}/${count} đề.`])
    setGenerating(false)
  }

  const deleteExam = async (id: string) => {
    if (!confirm('Xóa đề thi này?')) return
    await fetch(`/api/exams/${id}`, { method: 'DELETE' })
    fetchExams()
  }

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleSelectAll = () => {
    const visible = filteredExams.map(e => e.id)
    const allSelected = visible.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) visible.forEach(id => next.delete(id))
      else visible.forEach(id => next.add(id))
      return next
    })
  }

  const bulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Xóa ${selected.size} đề thi đã chọn?`)) return
    setBulkDeleting(true)
    await Promise.all([...selected].map(id => fetch(`/api/exams/${id}`, { method: 'DELETE' })))
    setSelected(new Set())
    setBulkDeleting(false)
    fetchExams()
  }

  const filteredExams = filterType ? exams.filter(e => e.type === filterType) : exams

  const typeCounts = TYPES.map(([key, label]) => ({
    key, label,
    count: exams.filter(e => e.type === key).length,
  }))

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">📋 Quản lý đề thi</h1>
      <p className="text-sm text-gray-500 mb-6">Tạo và quản lý đề thi theo cấu trúc Sở GD&ĐT TP.HCM 2026</p>

      {/* Thống kê */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {typeCounts.map(t => (
          <div key={t.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-indigo-200 transition-colors"
            onClick={() => setFilterType(t.key === filterType ? '' : t.key)}>
            <p className="text-xs text-gray-500 mb-1">{t.label}</p>
            <p className="text-2xl font-bold text-gray-800">{t.count} <span className="text-sm font-normal text-gray-400">đề</span></p>
            {filterType === t.key && <p className="text-xs text-indigo-500 mt-1">▸ Đang lọc</p>}
          </div>
        ))}
      </div>

      {/* Generate */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">⚡ Tạo đề mới</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Loại đề</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} disabled={generating}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {TYPES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Số đề</label>
            <select value={count} onChange={e => setCount(Number(e.target.value))} disabled={generating}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {[1, 3, 5, 10].map(n => <option key={n} value={n}>{n} đề</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-6 py-2 rounded-xl transition-colors flex items-center gap-2">
            {generating ? <><span className="animate-spin">⏳</span> Đang tạo...</> : <>⚡ Tạo {count} đề</>}
          </button>
        </div>

        {log.length > 0 && (
          <div className="mt-4 bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 max-h-48 overflow-y-auto">
            {log.map((l, i) => (
              <div key={i} className={l.startsWith('🎉') ? 'text-yellow-300 font-bold mt-1' : l.startsWith('⚠️') ? 'text-amber-400' : l.startsWith('❌') ? 'text-red-400' : ''}>
                {l || <span className="opacity-0">.</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danh sách đề */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            {filterType ? `${EXAM_TYPE_LABELS[filterType]} ` : 'Tất cả '}{loading ? '...' : `(${filteredExams.length} đề)`}
          </p>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <button onClick={bulkDelete} disabled={bulkDeleting}
                className="text-xs bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                {bulkDeleting ? '⏳ Đang xóa...' : `🗑️ Xóa ${selected.size} đề đã chọn`}
              </button>
            )}
            {filterType && <button onClick={() => setFilterType('')} className="text-xs text-indigo-500 hover:underline">Xem tất cả</button>}
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải...</div>
        ) : filteredExams.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p>Chưa có đề thi nào. Bấm "Tạo đề" để bắt đầu.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox"
                    checked={filteredExams.length > 0 && filteredExams.every(e => selected.has(e.id))}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300 cursor-pointer"
                  />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Tên đề</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Loại</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Thời gian</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Lượt thi</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Ngày tạo</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExams.map(exam => (
                <tr key={exam.id} className={`hover:bg-gray-50 ${selected.has(exam.id) ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox"
                      checked={selected.has(exam.id)}
                      onChange={() => toggleSelect(exam.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-xs truncate">{exam.title}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {EXAM_TYPE_LABELS[exam.type] ?? exam.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-500 text-xs">{exam.duration} phút</td>
                  <td className="px-5 py-3 text-center text-gray-600">{exam._count.attempts}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteExam(exam.id)}
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
