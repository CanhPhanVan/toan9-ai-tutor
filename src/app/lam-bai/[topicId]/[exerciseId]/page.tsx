'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { TOPICS } from '@/lib/topics'
import { EXERCISES, type Exercise } from '@/lib/exercises'
import { renderMathContent } from '@/components/MathDisplay'
import { GradingResult } from '@/components/GradingResult'
import { MathKeyboard } from '@/components/MathKeyboard'
import { TutorChat } from '@/components/TutorChat'
import MathCanvas from '@/components/MathCanvas'

interface StepFeedback {
  stepNumber: number
  isCorrect: boolean
  feedback: string
  wrongReason?: string | null
}

interface GradingResultData {
  steps: StepFeedback[]
  overallCorrect: boolean
  correctSolution: { method: string; steps: string[]; answer: string }
  encouragement: string
}

function dbToExercise(db: { id: string; title: string; content: string; topicId: string; difficulty: string; method: string | null; solution: string | null; hints: string }): Exercise {
  let hintsArr: string[] = []
  try { hintsArr = JSON.parse(db.hints) } catch { if (db.hints) hintsArr = [db.hints] }
  return {
    id: db.id,
    title: db.title,
    content: db.content,
    topicId: db.topicId,
    difficulty: db.difficulty as Exercise['difficulty'],
    hints: hintsArr,
    solution: {
      method: db.method ?? 'Giải chi tiết',
      steps: db.solution ? db.solution.split('\n').filter(Boolean) : [],
      answer: '',
    },
  }
}

export default function ExercisePage() {
  const params = useParams<{ topicId: string; exerciseId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')
  const topic = TOPICS.find(t => t.id === params.topicId)

  const [exercise, setExercise] = useState<Exercise | null>(
    EXERCISES.find(e => e.id === params.exerciseId && e.topicId === params.topicId) ?? null
  )
  const [loadingExercise, setLoadingExercise] = useState(!exercise)

  useEffect(() => {
    if (exercise) return
    // Bài không có trong static → load từ DB
    fetch(`/api/exercises/${params.exerciseId}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setExercise(dbToExercise(data))
      })
      .finally(() => setLoadingExercise(false))
  }, [params.exerciseId, exercise])

  // Navigation helpers (static only for now)
  const topicExercises = EXERCISES.filter(e => e.topicId === params.topicId)
  const currentIndex = topicExercises.findIndex(e => e.id === params.exerciseId)
  const nextExercise = currentIndex >= 0 && currentIndex < topicExercises.length - 1
    ? topicExercises[currentIndex + 1] : null
  const prevExercise = currentIndex > 0 ? topicExercises[currentIndex - 1] : null

  const [assignmentDone, setAssignmentDone] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [canvasImages, setCanvasImages] = useState<string[]>([])
  const [answer, setAnswer] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [gradingResult, setGradingResult] = useState<GradingResultData | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const aiHelpCountRef = useRef(0)

  const [showPreview, setShowPreview] = useState(false)

  const handleKeyboardInsert = (text: string, cursorOffset?: number) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart ?? answer.length
    const end = el.selectionEnd ?? answer.length
    const newVal = answer.slice(0, start) + text + answer.slice(end)
    setAnswer(newVal)
    const cursorPos = cursorOffset !== undefined ? start + cursorOffset : start + text.length
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  if (loadingExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-4xl mb-3 animate-pulse">📖</p>
          <p>Đang tải bài tập...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-gray-600">Không tìm thấy bài tập</p>
          <Link href="/lam-bai" className="mt-4 inline-block text-indigo-600 hover:underline">← Quay lại</Link>
        </div>
      </div>
    )
  }

  const onSubmit = async () => {
    if (!answer.trim()) return
    setIsGrading(true)
    setGradingResult(null)
    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise: { title: exercise.title, content: exercise.content },
          studentSteps: [answer],
          solution: exercise.solution,
          aiHelpCount: aiHelpCountRef.current,
        }),
      })
      const result = await response.json()
      setGradingResult(result)
      aiHelpCountRef.current = 0
      // Auto-complete assignment if coming from assignment page
      if (assignmentId && !assignmentDone) {
        fetch('/api/assignments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignmentId }),
        }).then(() => setAssignmentDone(true)).catch(() => {})
      }
    } catch (error) {
      console.error('Grading error:', error)
    } finally {
      setIsGrading(false)
    }
  }

  const diffLabels: Record<string, string> = {
    easy: 'Dễ', medium: 'Trung bình', hard: 'Khó', advanced: 'Vận dụng cao',
  }
  const diffColors: Record<string, string> = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-orange-50 text-orange-700 border-orange-200',
    advanced: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MathCanvas Modal */}
      {showCanvas && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCanvas(false)}>
          <div onClick={e => e.stopPropagation()}>
            <MathCanvas
              onClose={() => { setShowCanvas(false); setEditingIndex(null) }}
              initialImage={editingIndex !== null ? canvasImages[editingIndex] : undefined}
              onSave={(dataUrl) => {
                if (editingIndex !== null) {
                  setCanvasImages(prev => prev.map((img, i) => i === editingIndex ? dataUrl : img))
                  setEditingIndex(null)
                } else {
                  setCanvasImages(prev => [...prev, dataUrl])
                }
              }}
            />
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-indigo-600 text-sm font-medium transition-colors" title="Trang chủ">
            🏠
          </Link>
          <span className="text-gray-200">|</span>
          <Link href={`/lam-bai/${params.topicId}`} className="text-gray-500 hover:text-gray-700 text-sm">
            ← {topic?.name ?? 'Chủ đề'}
          </Link>
          <button
            onClick={() => setShowCanvas(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium border border-indigo-200 transition-colors"
          >
            🖊️ Bảng vẽ
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-12 gap-5">

          {/* Cột trái: Đề bài + hướng dẫn ký hiệu */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${diffColors[exercise.difficulty] ?? diffColors.easy}`}>
                {diffLabels[exercise.difficulty] ?? 'Dễ'}
              </span>
              <h2 className="font-bold text-gray-900 mt-3 mb-3 text-base">{exercise.title}</h2>
              <div className="text-gray-700 text-sm leading-relaxed bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                {renderMathContent(exercise.content)}
              </div>

              {/* Gợi ý */}
              <div className="mt-4">
                <button type="button" onClick={() => setShowHints(!showHints)}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  💡 {showHints ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                </button>
                {showHints && exercise.hints.length > 0 && (
                  <div className="mt-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-sm text-amber-700">
                      {hintIndex + 1}/{exercise.hints.length}: {exercise.hints[hintIndex]}
                    </p>
                    {hintIndex < exercise.hints.length - 1 && (
                      <button type="button" onClick={() => setHintIndex(h => h + 1)}
                        className="text-xs text-amber-600 mt-2 hover:underline">
                        Gợi ý tiếp →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bảng ký hiệu */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">📝 Cách gõ ký hiệu</p>
                <div className="space-y-1.5">
                  {[
                    { symbol: 'x²', input: 'x^2' },
                    { symbol: 'x³', input: 'x^3' },
                    { symbol: '√x', input: 'sqrt(x)' },
                    { symbol: '∛x', input: 'cbrt(x)' },
                    { symbol: 'a/b', input: '$\\frac{a}{b}$' },
                    { symbol: '±',  input: '+/-' },
                    { symbol: '≥',  input: '>=' },
                    { symbol: '≤',  input: '<=' },
                    { symbol: 'Δ',  input: 'delta' },
                    { symbol: '⇒',  input: '=>' },
                  ].map(row => (
                    <div key={row.input} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{row.symbol}</span>
                      <code className="bg-gray-100 text-indigo-600 px-2 py-0.5 rounded font-mono">{row.input}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cột giữa: Ô bài làm */}
          <div className="md:col-span-6 flex flex-col gap-4">
            {/* Assignment badge */}
            {assignmentId && (
              <div className={`rounded-xl px-4 py-2.5 border text-sm flex items-center gap-2 ${assignmentDone ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                {assignmentDone ? '✅ Đã hoàn thành bài giao — tốt lắm!' : '📋 Đây là bài tập bắt buộc — hãy làm và nộp bài.'}
                {assignmentDone && (
                  <Link href="/bai-tap-giao" className="ml-auto text-xs text-green-600 hover:underline">← Về danh sách</Link>
                )}
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">✏️ Bài làm</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(p => !p)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${showPreview ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-200'}`}
                  >
                    {showPreview ? '📝 Gõ bài' : '🔢 Xem toán'}
                  </button>
                  <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">🚫 Không paste</span>
                </div>
              </div>
              {showPreview ? (
                <div className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 min-h-[200px] text-sm leading-relaxed whitespace-pre-wrap">
                  {answer
                    ? <>{renderMathContent(answer)}</>
                    : <span className="text-gray-400 italic">Bài làm sẽ hiện ở đây dưới dạng toán học...</span>
                  }
                </div>
              ) : null}
              <textarea
                style={{ display: showPreview ? 'none' : undefined }}
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onPaste={e => { e.preventDefault(); alert('Không được phép dán văn bản vào ô bài làm. Hãy tự gõ lời giải của em!') }}
                onDrop={e => { e.preventDefault() }}
                onContextMenu={e => e.preventDefault()}
                placeholder={`Trình bày lời giải tại đây...\n\nVí dụ:\nBước 1: ...\nBước 2: ...\nKết luận: ...`}
                rows={16}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors resize-y ${
                  gradingResult
                    ? gradingResult.overallCorrect
                      ? 'border-green-300 bg-green-50'
                      : 'border-amber-300 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-indigo-200'
                }`}
              />
              {/* Hình vẽ đã chèn từ bảng vẽ */}
              {canvasImages.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    🖊️ Hình vẽ đính kèm ({canvasImages.length})
                  </p>
                  {canvasImages.map((src, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-indigo-100 shadow-sm">
                      <img src={src} alt={`Hình vẽ ${i + 1}`} className="w-full object-contain bg-white max-h-64" />
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingIndex(i); setShowCanvas(true) }}
                          className="w-6 h-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center"
                          title="Sửa hình này"
                        >✏️</button>
                        <button
                          onClick={() => setCanvasImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
                          title="Xóa hình này"
                        >✕</button>
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 bg-indigo-600/80 text-white text-xs px-2 py-0.5 rounded-full">
                        Hình {i + 1}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowCanvas(true)}
                    className="w-full text-xs text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl py-2 transition-colors"
                  >
                    + Vẽ thêm hình
                  </button>
                </div>
              )}

              <button
                onClick={onSubmit}
                disabled={isGrading || !answer.trim()}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isGrading
                  ? <><span className="animate-spin inline-block">⏳</span> Đang chấm bài...</>
                  : <>🤖 Nộp bài để AI chấm</>
                }
              </button>
            </div>

            {gradingResult && <GradingResult result={gradingResult} />}

            {/* Điều hướng sau khi chấm bài */}
            {gradingResult && (
              <div className={`rounded-2xl border p-5 ${gradingResult.overallCorrect ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <p className="font-bold text-sm mb-3 text-gray-800">
                  {gradingResult.overallCorrect ? '🎉 Tuyệt vời! Tiếp tục nào?' : '💪 Cố lên! Em muốn làm gì tiếp?'}
                </p>
                <div className="flex flex-col gap-2">
                  {/* Làm lại */}
                  <button
                    onClick={() => { setAnswer(''); setGradingResult(null); setCanvasImages([]) }}
                    className="w-full py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    🔄 Làm lại bài này
                  </button>

                  {/* Bài kế tiếp trong chủ đề */}
                  {nextExercise ? (
                    <button
                      onClick={() => router.push(`/lam-bai/${params.topicId}/${nextExercise.id}`)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Bài tiếp theo →</span>
                      <span className="text-indigo-200 text-xs truncate max-w-[180px]">{nextExercise.title}</span>
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-1">✅ Đã hoàn thành tất cả bài trong chủ đề này!</div>
                  )}

                  {/* Bài trước */}
                  {prevExercise && (
                    <button
                      onClick={() => router.push(`/lam-bai/${params.topicId}/${prevExercise.id}`)}
                      className="w-full py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      ← Quay lại bài trước
                    </button>
                  )}

                  {/* Chọn dạng khác */}
                  <div className="border-t border-gray-200 pt-2 mt-1">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Chọn chủ đề khác:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TOPICS.slice(0, 6).map(t => (
                        <Link
                          key={t.id}
                          href={`/lam-bai/${t.id}`}
                          className={`text-xs py-2 px-2 rounded-lg border text-center transition-colors truncate ${
                            t.id === params.topicId
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-medium'
                              : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/lam-bai"
                      className="mt-2 block text-center text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
                    >
                      Xem tất cả chủ đề →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Bàn phím toán + Gia sư AI */}
          <div className="md:col-span-3">
            <div className="sticky top-6 space-y-4">
              <MathKeyboard onInsert={handleKeyboardInsert} />
              <TutorChat
                exercise={{ ...exercise, topicName: topic?.name }}
                studentAnswer={answer}
                onAiHelp={() => { aiHelpCountRef.current += 1 }}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
