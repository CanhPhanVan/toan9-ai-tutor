'use client'
import { useState, useRef, useEffect } from 'react'
import { stripLatex } from '@/lib/stripLatex'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Exercise {
  id: string
  topicId: string
  title: string
  content: string
  difficulty: string
  topicName?: string
}

interface TutorChatProps {
  exercise: Exercise
  studentAnswer: string
  onAiHelp?: () => void
}

type Mode = 'hint' | 'step' | 'error'

const QUICK_ACTIONS = [
  { label: 'Em không hiểu đề', message: 'Em không hiểu đề bài, thầy/cô giải thích giúp em với?' },
  { label: 'Gợi ý bước đầu', message: 'Cho em gợi ý để bắt đầu bài này?' },
  { label: 'Công thức cần dùng', message: 'Bài này cần dùng công thức gì?' },
  { label: 'Kiểm tra bước này', message: 'Thầy/cô kiểm tra bước em đang làm có đúng không?' },
  { label: 'Vì sao em sai?', message: 'Vì sao bài làm của em bị sai? Cho em biết lỗi ở đâu?' },
  { label: 'Lời giải chi tiết', message: 'Thầy/cô cho em xem lời giải chi tiết được không?' },
]

const MODE_CONFIG: Record<Mode, { label: string; icon: string; desc: string; color: string }> = {
  hint:  { label: 'Gợi ý nhẹ',        icon: '💡', desc: 'Chỉ gợi ý, em tự tìm ra',     color: 'bg-amber-50 border-amber-200 text-amber-700' },
  step:  { label: 'Từng bước',         icon: '🪜', desc: 'Hướng dẫn chi tiết từng bước', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  error: { label: 'Giải thích lỗi',    icon: '🔍', desc: 'Phân tích lỗi trong bài làm',  color: 'bg-rose-50 border-rose-200 text-rose-700' },
}

export function TutorChat({ exercise, studentAnswer, onAiHelp }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('hint')
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    onAiHelp?.()
    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise: { ...exercise },
          studentAnswer,
          messages: newMessages,
          mode,
        }),
      })
      const data = await res.json()
      const reply = data.reply ?? data.error ?? 'Xin lỗi, gia sư chưa phản hồi được.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi kết nối, thử lại nhé!' }])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header — click to toggle */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🧑‍🏫</span>
          <div className="text-left">
            <p className="font-bold text-gray-800 text-sm">Gia sư AI</p>
            <p className="text-xs text-gray-500">Hỗ trợ từng bước • không cho đáp án ngay</p>
          </div>
        </div>
        <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          {/* Mode selector */}
          <div className="px-3 pb-2 flex gap-1.5 border-t border-gray-50 pt-2">
            {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex-1 text-xs py-1.5 px-1 rounded-lg border font-medium transition-all ${
                  mode === key ? cfg.color : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                }`}
                title={cfg.desc}
              >
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="h-56 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-4">
                <p className="text-2xl mb-1">🧑‍🏫</p>
                <p className="text-xs">Xin chào! Em cần hỗ trợ gì về bài này?</p>
                <p className="text-xs mt-1">Dùng các nút gợi ý bên dưới hoặc tự đặt câu hỏi.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && <span className="text-indigo-400 mr-1">🧑‍🏫</span>}
                    {msg.role === 'assistant' ? stripLatex(msg.content) : msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <span className="text-xs text-gray-400 animate-pulse">🧑‍🏫 Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-1">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.message)}
                disabled={isLoading}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi gia sư... (Enter để gửi)"
              rows={2}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white px-3 rounded-xl text-sm font-bold transition-colors self-end pb-2 pt-2"
            >
              ↑
            </button>
          </div>
        </>
      )}
    </div>
  )
}
