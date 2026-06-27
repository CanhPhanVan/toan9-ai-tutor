'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { FileUpload } from '@/components/FileUpload'
import { renderMathContent } from '@/components/MathDisplay'
import { MathKeyboard } from '@/components/MathKeyboard'
import FreeChatBot from '@/components/FreeChatBot'

interface SolutionStep {
  step: number
  title: string
  content: string
  formula?: string
}

interface SolutionResult {
  method: string
  steps: SolutionStep[]
  answer: string
  commonMistakes: string[]
  tips: string
}

export default function HuongDanPage() {
  const [problemText, setProblemText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOcring, setIsOcring] = useState(false)
  const [solution, setSolution] = useState<SolutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'type' | 'upload'>('type')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInsert = (value: string, cursorOffset?: number) => {
    const el = textareaRef.current
    if (!el) {
      setProblemText((prev) => prev + value)
      return
    }
    const start = el.selectionStart ?? problemText.length
    const end = el.selectionEnd ?? problemText.length
    const next = problemText.slice(0, start) + value + problemText.slice(end)
    setProblemText(next)
    const cursorPos = cursorOffset !== undefined ? start + cursorOffset : start + value.length
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const handleFileAccepted = async (file: File) => {
    setIsOcring(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/ocr', { method: 'POST', body: formData })
      const data = await response.json()
      if (data.problem) {
        setProblemText(data.problem)
        setActiveTab('type')
      } else {
        setError('Không thể đọc bài toán từ ảnh. Vui lòng thử lại hoặc nhập tay.')
      }
    } catch {
      setError('Lỗi khi xử lý ảnh.')
    } finally {
      setIsOcring(false)
    }
  }

  const handleSolve = async () => {
    if (!problemText.trim()) return
    setIsLoading(true)
    setError(null)
    setSolution(null)
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problemText }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSolution(data)
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Trang chủ</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">🤖 Hướng dẫn giải chi tiết</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 3-col on lg, 2-col on md, 1-col on sm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Input + Keyboard */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('type')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'type' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  ✏️ Nhập bài toán
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  📷 Upload ảnh/PDF
                </button>
              </div>

              <div className="p-5">
                {activeTab === 'type' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập bài toán</label>
                    <textarea
                      ref={textareaRef}
                      value={problemText}
                      onChange={(e) => setProblemText(e.target.value)}
                      placeholder={'Ví dụ:\nCâu 1. Biểu thức nào sau đây không phải là phân thức đại số?\nA. 3\nB. x\nC. y'}
                      rows={8}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y"
                      style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">Có thể dùng ký hiệu toán học thông thường</p>
                      {problemText && (
                        <button
                          type="button"
                          onClick={() => {
                            const lines = problemText.split('\n')
                            const result: string[] = []
                            let buffer = ''
                            for (const line of lines) {
                              const trimmed = line.trim()
                              if (trimmed === '') {
                                if (buffer) { result.push(buffer); buffer = '' }
                                result.push('')
                                continue
                              }
                              if (/^(Câu\s*\d|[A-E][\.\)]|Bước|Phần)/i.test(trimmed)) {
                                if (buffer) { result.push(buffer); buffer = '' }
                                buffer = trimmed
                                continue
                              }
                              if (trimmed.length <= 6 && buffer) {
                                buffer += ' ' + trimmed
                              } else if (buffer) {
                                result.push(buffer)
                                buffer = trimmed
                              } else {
                                buffer = trimmed
                              }
                            }
                            if (buffer) result.push(buffer)
                            setProblemText(result.join('\n').replace(/\n{3,}/g, '\n\n').trim())
                          }}
                          className="text-xs text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 transition-colors"
                        >
                          🧹 Dọn dẹp định dạng
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <FileUpload onFileAccepted={handleFileAccepted} isLoading={isOcring} />
                    {isOcring && (
                      <p className="text-sm text-indigo-600 text-center mt-3 animate-pulse">⏳ Đang đọc bài toán từ ảnh...</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Math Keyboard */}
            <MathKeyboard onInsert={handleInsert} />

            <button
              onClick={handleSolve}
              disabled={isLoading || !problemText.trim() || isOcring}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-md"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  AI đang giải bài...
                </>
              ) : (
                <>🤖 Giải chi tiết với AI</>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                ❌ {error}
              </div>
            )}

            {/* Sample problems */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">VÍ DỤ BÀI TOÁN</p>
              <div className="space-y-2">
                {[
                  'Giải phương trình bậc hai: 2x² - 7x + 3 = 0',
                  'Tính căn bậc hai: √75 + √48 - √27',
                  'Giải hệ phương trình: {2x + y = 5; x - 2y = 0}',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => { setProblemText(sample); setActiveTab('type') }}
                    className="w-full text-left text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Solution display */}
          <div>
            {solution ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">📚 Lời giải chi tiết</h3>
                  <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    Phương pháp: {solution.method}
                  </span>
                </div>

                <div className="space-y-4">
                  {solution.steps.map((step) => (
                    <div key={step.step} className="border-l-4 border-indigo-200 pl-4">
                      <p className="font-semibold text-sm text-indigo-700 mb-1">
                        Bước {step.step}: {step.title}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{renderMathContent(step.content)}</p>
                      {step.formula && (
                        <div className="mt-2 bg-gray-50 rounded-lg p-2 font-mono text-sm text-gray-600">
                          {renderMathContent(step.formula)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-bold text-green-700 text-sm">✅ Đáp án: {renderMathContent(solution.answer)}</p>
                </div>

                {solution.commonMistakes && solution.commonMistakes.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="font-semibold text-amber-700 text-sm mb-2">⚠️ Lỗi thường gặp:</p>
                    <ul className="space-y-1">
                      {solution.commonMistakes.map((mistake, i) => (
                        <li key={i} className="text-xs text-amber-600 flex gap-2">
                          <span>•</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {solution.tips && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700">💡 {solution.tips}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 min-h-64 flex items-center justify-center">
                <div>
                  <p className="text-5xl mb-3">🤖</p>
                  <p className="text-sm">Nhập bài toán hoặc upload ảnh để AI giải chi tiết</p>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Chatbot — on md it spans full width below, on lg it's its own column */}
          <div className="md:col-span-2 lg:col-span-1">
            <FreeChatBot problemContext={problemText} />
          </div>
        </div>
      </main>
    </div>
  )
}
