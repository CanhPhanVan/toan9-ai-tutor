'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { EXAM_TYPE_LABELS, type ExamContent, type ExamQuestion } from '@/lib/examStructures'
import { useSession } from 'next-auth/react'
import MathContent from '@/components/MathContent'

interface PartResult {
  key: string; label: string; points: number; earned: number
  isCorrect: boolean; studentAnswer: string; correctAnswer: string; feedback: string
}
interface GradeResult { score: number; totalPoints: number; results: PartResult[] }
interface ExamInfo { id: string; title: string; type: string; duration: number; content: string }
type Phase = 'loading' | 'intro' | 'exam' | 'submitting' | 'result'

const MATH_KEYS = ['√', 'x²', 'x³', 'xⁿ', 'phân số', '±', 'Δ', '∠', '⊥', '∥', '≤', '≥', '≠', 'π']

function insertSymbol(val: string, sym: string, textarea: HTMLTextAreaElement | null): string {
  if (!textarea) return val + sym
  const start = textarea.selectionStart ?? val.length
  const end = textarea.selectionEnd ?? val.length
  const map: Record<string, string> = { 'x²': '^2', 'x³': '^3', 'xⁿ': '^n', 'phân số': '(a/b)' }
  const insert = map[sym] ?? sym
  return val.slice(0, start) + insert + val.slice(end)
}

export default function ExamPage() {
  const params = useParams<{ examId: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const [exam, setExam] = useState<ExamInfo | null>(null)
  const [content, setContent] = useState<ExamContent | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [expandedResult, setExpandedResult] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  useEffect(() => {
    fetch(`/api/exams/${params.examId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setPhase('intro'); return }
        setExam(data)
        setContent(JSON.parse(data.content))
        setPhase('intro')
      })
  }, [params.examId])

  const handleSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('submitting')
    try {
      const res = await fetch(`/api/exams/${params.examId}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      setGradeResult(data)
      setPhase('result')
    } catch {
      alert('Lỗi nộp bài. Vui lòng thử lại.')
      setPhase('exam')
    }
  }, [params.examId, answers])

  const startExam = useCallback(() => {
    if (!exam) return
    setTimeLeft(exam.duration * 60)
    setPhase('exam')
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
  }, [exam, handleSubmit])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const setAnswer = (key: string, val: string) => setAnswers(prev => ({ ...prev, [key]: val }))

  if (phase === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-400 animate-pulse"><p className="text-4xl mb-2">📋</p><p>Đang tải đề thi...</p></div>
    </div>
  )
  if (!exam || !content) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><p className="text-4xl mb-2">😕</p><p className="text-gray-500">Không tìm thấy đề thi</p>
        <Link href="/kiem-tra" className="mt-4 inline-block text-indigo-600 hover:underline">← Quay lại</Link></div>
    </div>
  )

  /* INTRO */
  if (phase === 'intro') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md max-w-lg w-full p-8">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">{exam.type === 'tuyen-sinh' ? '🎓' : exam.type === 'hk1' ? '📘' : '📗'}</p>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{exam.title}</h1>
          <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full">{EXAM_TYPE_LABELS[exam.type]}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[['Thời gian', `⏱ ${exam.duration} phút`], ['Thang điểm', `📊 ${content.totalPoints} điểm`],
            ['Số câu', `📝 ${content.questions.length} câu`], ['Chấm bài', '🤖 AI tự động']].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{l}</p>
              <p className="font-bold text-gray-800 text-sm">{v}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-700 space-y-1">
          <p className="font-semibold text-sm">⚠️ Lưu ý trước khi thi:</p>
          <p>• Sau khi bắt đầu, đồng hồ đếm ngược sẽ chạy</p>
          <p>• Hết giờ sẽ tự động nộp bài</p>
          <p>• Trình bày lời giải rõ ràng từng bước để được điểm tối đa</p>
        </div>
        <button onClick={startExam} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2">
          🚀 Bắt đầu thi
        </button>
        <Link href="/kiem-tra" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3">← Chọn đề khác</Link>
      </div>
    </div>
  )

  /* SUBMITTING */
  if (phase === 'submitting') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-5xl mb-3 animate-spin">⏳</p>
        <p className="text-lg font-semibold text-gray-800">AI đang chấm bài...</p>
        <p className="text-sm text-gray-500 mt-1">Vui lòng chờ, quá trình này mất khoảng 1-2 phút</p>
      </div>
    </div>
  )

  /* RESULT */
  if (phase === 'result' && gradeResult) {
    const pct = (gradeResult.score / gradeResult.totalPoints) * 100
    const grade = pct >= 80 ? 'Giỏi' : pct >= 65 ? 'Khá' : pct >= 50 ? 'Trung bình' : 'Yếu'
    const gradeEmoji = pct >= 80 ? '🏆' : pct >= 65 ? '⭐' : pct >= 50 ? '💪' : '📚'
    const scoreColor = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-indigo-600 text-sm transition-colors" title="Trang chủ">🏠</Link>
            <span className="text-gray-200">|</span>
            <Link href="/kiem-tra" className="text-gray-500 hover:text-gray-700 text-sm">← Chọn đề khác</Link>
            <h1 className="font-bold text-gray-800 text-sm truncate ml-auto">{exam.title}</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className={`rounded-2xl p-8 text-center border ${pct >= 80 ? 'bg-green-50 border-green-200' : pct >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-5xl mb-2">{gradeEmoji}</p>
            <p className={`text-5xl font-bold mb-1 ${scoreColor}`}>{gradeResult.score}/{gradeResult.totalPoints}</p>
            <p className="text-lg font-semibold text-gray-700 mb-1">Xếp loại: {grade}</p>
            <p className="text-sm text-gray-500">{pct.toFixed(0)}% tổng điểm</p>
          </div>
          <div className="space-y-3">
            <h2 className="font-bold text-gray-800">📝 Chi tiết từng câu</h2>
            {content.questions.map((q: ExamQuestion) => {
              const qResults = gradeResult.results.filter(r => r.key.startsWith(String(q.number)))
              const qEarned = qResults.reduce((s, r) => s + r.earned, 0)
              const isExp = expandedResult === String(q.number)
              const col = qEarned >= q.points * 0.8 ? 'bg-green-100 text-green-700' : qEarned > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
              const scoreCol = qEarned >= q.points * 0.8 ? 'text-green-600' : qEarned > 0 ? 'text-yellow-600' : 'text-red-500'
              return (
                <div key={q.number} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedResult(isExp ? null : String(q.number))}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${col}`}>{q.number}</span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 text-sm">Câu {q.number}: {q.topic}</p>
                        <p className="text-xs text-gray-400">{qResults.length} phần</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm ${scoreCol}`}>{qEarned}/{q.points}đ</span>
                      <span className="text-gray-400 text-xs">{isExp ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  {isExp && (
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
                      {qResults.map(r => (
                        <div key={r.key} className={`rounded-xl p-4 border ${r.isCorrect ? 'bg-green-50 border-green-200' : r.earned > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-gray-800">{r.label}</span>
                            <span className={`text-sm font-bold ${r.isCorrect ? 'text-green-600' : r.earned > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {r.isCorrect ? '✅' : r.earned > 0 ? '⚠️' : '❌'} {r.earned}/{r.points}đ
                            </span>
                          </div>
                          {r.studentAnswer && <div className="mb-2"><p className="text-xs font-semibold text-gray-500 mb-1">Bài làm của em:</p>
                            <p className="text-xs text-gray-700 bg-white rounded-lg p-2 border border-gray-100 whitespace-pre-wrap">{r.studentAnswer}</p></div>}
                          <div className="mb-2"><p className="text-xs font-semibold text-gray-500 mb-1">Đáp án đúng:</p>
                            <p className="text-xs text-gray-700 bg-white rounded-lg p-2 border border-gray-100"><MathContent text={r.correctAnswer || '—'} /></p></div>
                          <div><p className="text-xs font-semibold text-gray-500 mb-1">🤖 Nhận xét của AI:</p>
                            <p className="text-xs text-gray-700 leading-relaxed"><MathContent text={r.feedback} /></p></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Link href="/kiem-tra" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-center">
            Chọn đề thi khác
          </Link>
        </main>
      </div>
    )
  }

  /* EXAM */
  const answeredCount = Object.values(answers).filter(v => v.trim()).length
  const totalParts = content.questions.reduce((s, q) => s + (q.parts?.length ?? 1), 0)
  const isUrgent = timeLeft < 300

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-indigo-600 text-sm transition-colors" title="Trang chủ">🏠</Link>
            <span className="text-gray-200">|</span>
            <div>
              <p className="font-bold text-gray-900 text-base">Làm đề</p>
              <p className="text-xs text-gray-400">{exam.title} · {exam.duration} phút</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`font-mono font-bold text-base px-4 py-1.5 rounded-xl border ${isUrgent ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
              ⏱ {fmt(timeLeft)}
            </div>
            <button onClick={() => { if (confirm('Nộp bài ngay?')) handleSubmit() }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors">
              Nộp bài
            </button>
            {session?.user?.name && <span className="text-sm text-gray-600 hidden md:block">{session.user.name}</span>}
          </div>
        </div>
        <div className="h-0.5 bg-gray-100">
          <div className="h-0.5 bg-indigo-500 transition-all" style={{ width: `${totalParts > 0 ? (answeredCount / totalParts) * 100 : 0}%` }} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Exam info bar */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-xs text-indigo-700 flex items-center gap-2">
          📐 {exam.title} · {EXAM_TYPE_LABELS[exam.type]} · Tổng điểm: {content.totalPoints} · Thời gian: {exam.duration} phút
        </div>

        {/* Questions */}
        {content.questions.map((q: ExamQuestion) => {
          const parts = q.parts ?? []
          // Nếu câu chỉ có 1 phần không có label → gom thành 1 ô
          const singlePart = parts.length === 1 && !parts[0].label
          const key0 = singlePart ? `${q.number}` : null

          return (
            <div key={q.number} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Question header */}
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                  Câu {q.number} · {q.points} điểm
                </span>
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                  {q.topic}
                </span>
              </div>

              <div className="px-5 pb-5 space-y-5">
                {singlePart ? (
                  /* Single part — show question content then one answer box */
                  <>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 leading-relaxed">
                      <MathContent text={parts[0].content} />
                    </div>
                    <AnswerBox
                      label="Bài làm"
                      qKey={key0!}
                      value={answers[key0!] ?? ''}
                      onChange={val => setAnswer(key0!, val)}
                      textareaRef={el => { textareaRefs.current[key0!] = el }}
                      textareaRefs={textareaRefs}
                      qNum={q.number}
                    />
                  </>
                ) : (
                  /* Multiple parts */
                  parts.map(part => {
                    const pKey = `${q.number}${part.label}`
                    return (
                      <div key={pKey} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-100">
                          <span className="text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-2 py-0.5 rounded">
                            {part.label}) {part.points}đ
                          </span>
                          <span className="text-sm text-gray-800"><MathContent text={part.content} /></span>
                        </div>
                        <div className="p-4">
                          <AnswerBox
                            label={`Bài làm câu ${q.number}${part.label}`}
                            qKey={pKey}
                            value={answers[pKey] ?? ''}
                            onChange={val => setAnswer(pKey, val)}
                            textareaRef={el => { textareaRefs.current[pKey] = el }}
                            textareaRefs={textareaRefs}
                            qNum={q.number}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}

        <button onClick={() => { if (confirm('Nộp bài? Bạn không thể chỉnh sửa sau khi nộp.')) handleSubmit() }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors text-base shadow-md flex items-center justify-center gap-2">
          🤖 Nộp bài để AI chấm điểm
        </button>
      </main>
    </div>
  )
}

function AnswerBox({ label, qKey, value, onChange, textareaRef, textareaRefs, qNum }: {
  label: string; qKey: string; value: string
  onChange: (v: string) => void
  textareaRef: (el: HTMLTextAreaElement | null) => void
  textareaRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>
  qNum: number
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">Bài làm</p>
      {/* Math keyboard */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {MATH_KEYS.map(sym => (
          <button key={sym} type="button"
            onClick={() => {
              const ta = textareaRefs.current[qKey]
              onChange(insertSymbol(value, sym, ta ?? null))
              setTimeout(() => ta?.focus(), 0)
            }}
            className="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors bg-white text-gray-700">
            {sym}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onPaste={e => { e.preventDefault(); alert('Không được phép dán văn bản vào ô bài làm. Hãy tự gõ lời giải!') }}
        onDrop={e => e.preventDefault()}
        onContextMenu={e => e.preventDefault()}
        placeholder={`Nhập lời giải cho Câu ${qNum}...`}
        rows={5}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y bg-white transition-colors"
      />
      {/* Action buttons */}
      <div className="flex gap-2 mt-2">
        <button type="button"
          onClick={() => {
            const converted = value
              .replace(/sqrt\(([^)]+)\)/g, '√($1)')
              .replace(/\^2/g, '²').replace(/\^3/g, '³')
              .replace(/\*/g, '×').replace(/!=/g, '≠')
              .replace(/<=/, '≤').replace(/>=/, '≥')
            onChange(converted)
          }}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          Tự chuyển ký hiệu
        </button>
        <button type="button"
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          Vẽ hình/đồ thị
        </button>
      </div>
    </div>
  )
}
