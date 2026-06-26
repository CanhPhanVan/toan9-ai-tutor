'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface FreeChatBotProps {
  problemContext: string
}

const QUICK_ACTIONS = [
  'Giải thích bài này',
  'Gợi ý công thức',
  'Giải từng bước',
  'Kiểm tra đáp án',
]

export default function FreeChatBot({ problemContext }: FreeChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          exercise: { content: problemContext, title: 'Bài toán', topicName: 'Toán 9' },
          mode: 'step',
        }),
      })
      const data = await response.json()
      const reply = data.reply ?? 'Xin lỗi, không nhận được phản hồi.'
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...nextMessages, { role: 'assistant', content: 'Lỗi kết nối. Vui lòng thử lại.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[500px]">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-lg">💬</span>
        <div>
          <p className="font-semibold text-gray-800 text-sm">Gia sư AI</p>
          <p className="text-xs text-gray-400">Hỏi bất cứ điều gì về bài toán</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-xs mt-6">
            <p className="text-3xl mb-2">🤖</p>
            <p>Chọn câu hỏi nhanh hoặc nhập câu hỏi bên dưới</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl rounded-bl-none text-sm animate-pulse">
              Đang trả lời...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 border-t border-gray-50 flex flex-wrap gap-1">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => sendMessage(action)}
            disabled={isLoading}
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi về bài toán..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-3 py-2 rounded-xl transition-colors text-sm font-medium"
        >
          Gửi
        </button>
      </div>
    </div>
  )
}
