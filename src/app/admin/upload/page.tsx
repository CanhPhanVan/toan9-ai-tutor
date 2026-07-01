'use client'
import { useState, useRef } from 'react'
import { TOPICS } from '@/lib/topics'

interface ParsedExercise {
  title: string
  content: string
  topicId?: string
  topicName?: string
}

const MAX_FILE_SIZE = 4 * 1024 * 1024 // Vercel serverless functions hard-cap request bodies ~4.5MB

// Some failures (payload too large, gateway timeouts, etc.) never reach our route
// handler — the platform returns plain text, not JSON. Parse defensively so the
// user gets a clear message instead of a raw "Unexpected token" crash.
async function safeJson(res: Response): Promise<{ error?: string; [key: string]: unknown }> {
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    if (res.status === 413) return { error: 'File quá lớn — máy chủ từ chối nhận (giới hạn khoảng 4MB). Hãy nén ảnh/PDF hoặc chụp độ phân giải thấp hơn.' }
    const text = await res.text()
    return { error: `Máy chủ trả về lỗi không mong đợi (${res.status}): ${text.slice(0, 150)}` }
  }
  try { return await res.json() } catch {
    return { error: 'Không đọc được phản hồi từ máy chủ. Vui lòng thử lại.' }
  }
}

export default function AdminUploadPage() {
  const [text, setText] = useState('')
  const [topicId, setTopicId] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [preview, setPreview] = useState<ParsedExercise[]>([])
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => { setPreview([]); setResult(''); setError(''); setStatus('') }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    resetState()
    if (file.size > MAX_FILE_SIZE) {
      setError(`File "${file.name}" nặng ${(file.size / 1024 / 1024).toFixed(1)}MB, vượt giới hạn 4MB. Hãy nén ảnh/PDF hoặc chụp độ phân giải thấp hơn.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setExtracting(true)
    setStatus(`Đang đọc ${file.name}...`)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/extract-file', { method: 'POST', body: fd })
      const data = await safeJson(res)
      if (data.error) { setError(String(data.error)); return }
      setText(String(data.text ?? ''))
      setStatus(`✅ Đã đọc xong — bấm Phân tích để tách bài`)
    } catch (err) {
      setError(`Lỗi đọc file: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setExtracting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const parseWithAI = async () => {
    if (!text.trim()) return
    setParsing(true)
    setError('')
    setPreview([])
    setStatus('AI đang phân tích và tách bài tập...')
    // autoTopic = true khi chưa chọn chủ đề
    const autoTopic = !topicId
    try {
      const res = await fetch('/api/admin/parse-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, autoTopic }),
      })
      const data = await safeJson(res)
      if (data.error) { setError(String(data.error)); return }
      const exercises: ParsedExercise[] = (data.exercises as ParsedExercise[]) ?? []
      setPreview(exercises)
      if (exercises.length === 0) setError('Không tìm thấy bài tập nào.')
      else setStatus(`✅ Tìm thấy ${exercises.length} bài — kiểm tra rồi bấm Lưu`)
    } catch (err) {
      setError(`Lỗi: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setParsing(false)
    }
  }

  const updatePreview = (i: number, field: keyof ParsedExercise, val: string) =>
    setPreview(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex))

  const removeExercise = (i: number) =>
    setPreview(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (preview.length === 0) return
    setSaving(true)
    setError('')
    const selectedTopic = TOPICS.find(t => t.id === topicId)
    let success = 0, fail = 0
    for (const ex of preview) {
      // Dùng chủ đề được chọn tay, nếu không có thì dùng chủ đề AI gán
      const tid = topicId || ex.topicId || 'de-tong-hop'
      const tname = selectedTopic?.name || ex.topicName || TOPICS.find(t => t.id === tid)?.name || ''
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: ex.title, content: ex.content, topicId: tid, topicName: tname, difficulty }),
      })
      if (res.ok) success++; else fail++
    }
    setResult(`✅ Đã lưu ${success} bài${fail > 0 ? ` (${fail} lỗi)` : ''}`)
    setSaving(false)
    setText('')
    setPreview([])
  }

  const busy = parsing || saving || extracting
  const autoTopicMode = !topicId && preview.length > 0 && preview.some(e => e.topicId)

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">📤 Upload đề hàng loạt</h1>
      <p className="text-sm text-gray-500 mb-6">
        Hỗ trợ Word (.docx), PDF, ảnh chụp đề, hoặc paste text. AI tự động tách bài và gán chủ đề.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Chủ đề</label>
              <select value={topicId} onChange={e => { setTopicId(e.target.value); setError('') }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">🤖 AI tự gán chủ đề</option>
                {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {!topicId && <p className="text-xs text-indigo-500 mt-1">AI sẽ phân loại bài vào đúng chủ đề</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Độ khó</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
          </div>

          {/* File drop area */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Import từ file</label>
            <input ref={fileInputRef} type="file"
              accept=".docx,.pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload} disabled={busy}
              className="hidden" id="file-input" />
            <label htmlFor="file-input"
              className={`flex items-center justify-center gap-3 w-full border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer transition-colors
                ${busy ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400'}`}>
              {extracting ? (
                <><span className="text-xl animate-spin">⏳</span><span className="text-sm text-indigo-600 font-medium">Đang đọc file...</span></>
              ) : (
                <>
                  <span className="text-2xl">📁</span>
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Chọn file để upload</p>
                    <p className="text-xs text-indigo-400">Word (.docx) · PDF · Ảnh (jpg, png, webp)</p>
                  </div>
                </>
              )}
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">HOẶC PASTE TEXT</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <textarea value={text} onChange={e => { setText(e.target.value); resetState() }}
            disabled={busy} rows={9}
            placeholder={`Ví dụ:\n1. Tìm căn bậc hai số học của:\na) 121\nb) (-25)²\n\n2. Giải phương trình x² = 49`}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y disabled:bg-gray-50" />
          <p className="text-xs text-gray-400 -mt-2">Text vỡ dòng từ PDF cũng được — AI sẽ tự sửa</p>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={parseWithAI} disabled={!text.trim() || busy}
              className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
              {parsing ? <><span className="animate-spin">⏳</span>AI đang phân tích...</> : <>🤖 Phân tích</>}
            </button>

            {preview.length > 0 && (
              <button onClick={handleSave} disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                {saving ? <><span className="animate-spin">⏳</span>Đang lưu...</> : <>💾 Lưu {preview.length} bài</>}
              </button>
            )}
          </div>

          {status && !error && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-blue-600">{status}</div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span><span className="break-all">{error}</span>
            </div>
          )}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">{result}</div>
          )}
        </div>

        {/* RIGHT: preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">Xem trước & chỉnh sửa ({preview.length} bài)</p>
            {autoTopicMode && <span className="text-xs bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full">🤖 Chủ đề do AI gán</span>}
          </div>

          {preview.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 h-80 flex items-center justify-center flex-col gap-2 text-gray-400">
              {parsing || extracting
                ? <><p className="text-3xl animate-pulse">🤖</p><p className="text-sm">Đang xử lý...</p></>
                : <><p className="text-3xl">📋</p><p className="text-sm">Upload file hoặc paste text rồi bấm Phân tích</p></>
              }
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {preview.map((ex, i) => {
                const assignedTopic = topicId
                  ? TOPICS.find(t => t.id === topicId)
                  : TOPICS.find(t => t.id === ex.topicId)
                return (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 relative group shadow-sm">
                    <button onClick={() => removeExercise(i)}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-indigo-400 font-semibold">Bài {i + 1}</span>
                      {assignedTopic && (
                        <span className="text-xs bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full">
                          {assignedTopic.icon} {assignedTopic.name}
                        </span>
                      )}
                      {!topicId && ex.topicId && (
                        <select value={ex.topicId}
                          onChange={e => {
                            const t = TOPICS.find(tp => tp.id === e.target.value)
                            updatePreview(i, 'topicId', e.target.value)
                            if (t) updatePreview(i, 'topicName', t.name)
                          }}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-300 ml-1">
                          {TOPICS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                        </select>
                      )}
                    </div>
                    <input value={ex.title} onChange={e => updatePreview(i, 'title', e.target.value)}
                      className="w-full text-sm font-semibold text-gray-800 border-b border-transparent hover:border-gray-200 focus:border-indigo-300 focus:outline-none mb-2 pb-0.5 bg-transparent"
                      placeholder="Tiêu đề..." />
                    <textarea value={ex.content} onChange={e => updatePreview(i, 'content', e.target.value)}
                      rows={3}
                      className="w-full text-xs text-gray-600 border border-transparent hover:border-gray-200 focus:border-indigo-300 focus:outline-none rounded-lg px-1.5 py-1 resize-y bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Nội dung..." />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
