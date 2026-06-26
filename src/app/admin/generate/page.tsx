'use client'
import { useState } from 'react'
import { TOPICS } from '@/lib/topics'

const BATCHES_PER_TOPIC = 5  // 5 × 10 = 50 bài/chủ đề
const DELAY_MS = 2500         // 2.5s giữa các batch để tránh rate limit TPM

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export default function AdminGeneratePage() {
  const [topicId, setTopicId] = useState('')
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const addLog = (line: string) => setLog(prev => [...prev, line])

  const start = async () => {
    setRunning(true)
    setDone(false)
    setLog(['🚀 Bắt đầu tạo bài toán nâng cao...'])

    const targets = topicId ? [TOPICS.find(t => t.id === topicId)!] : TOPICS
    let grandTotal = 0

    for (const topic of targets) {
      addLog(``)
      addLog(`📚 Chủ đề: ${topic.name}`)
      let topicTotal = 0

      for (let batch = 0; batch < BATCHES_PER_TOPIC; batch++) {
        addLog(`  ⏳ Batch ${batch + 1}/${BATCHES_PER_TOPIC}...`)

        try {
          const res = await fetch('/api/admin/generate-exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topicId: topic.id, batch }),
          })
          const data = await res.json()

          if (res.status === 429 || data.isRateLimit) {
            const wait = data.retryAfter ?? 'vài phút'
            addLog(`  ⚠️ Hết quota Groq, thử lại sau ${wait}. Dừng tạm.`)
            addLog(`  💡 Đã lưu ${topicTotal} bài cho "${topic.name}". Chạy lại sau để tiếp tục.`)
            setRunning(false)
            setDone(true)
            return
          }

          if (data.error && !data.saved) {
            addLog(`  ❌ Batch ${batch + 1} lỗi: ${data.error.slice(0, 80)}`)
          } else {
            topicTotal += data.saved ?? 0
            const modelTag = data.model ? ` [${data.model.replace('llama-3.1-8b-instant','8b').replace('gemma2-9b-it','gemma2').replace('mixtral-8x7b-32768','mixtral').replace('llama-3.3-70b-versatile','70b')}]` : ''
            addLog(`  ✅ Batch ${batch + 1}: +${data.saved} bài (tổng: ${topicTotal})${modelTag}`)
          }
        } catch (e) {
          addLog(`  ❌ Lỗi kết nối batch ${batch + 1}: ${e}`)
        }

        // Delay giữa các batch để tránh vượt TPM
        if (batch < BATCHES_PER_TOPIC - 1) {
          await delay(DELAY_MS)
        }
      }

      grandTotal += topicTotal
      addLog(`  → Hoàn thành "${topic.name}": ${topicTotal} bài`)
    }

    addLog(``)
    addLog(`🎉 Xong! Tổng cộng ${grandTotal} bài đã được tạo và lưu vào database.`)
    setRunning(false)
    setDone(true)
  }

  const totalBatches = (topicId ? 1 : TOPICS.length) * BATCHES_PER_TOPIC
  const estimateMins = Math.ceil((totalBatches * (DELAY_MS / 1000 + 8)) / 60)

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">⚡ Tạo bài tập nâng cao bằng AI</h1>
      <p className="text-sm text-gray-500 mb-8">
        AI tạo 50 bài toán nâng cao mỗi chủ đề (5 lô × 10 bài), lưu thẳng vào database.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn chủ đề</label>
          <select
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            disabled={running}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">🗂️ Tất cả chủ đề ({TOPICS.length} chủ đề)</option>
            {TOPICS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Ước tính: ~{estimateMins} phút · {topicId ? '50' : TOPICS.length * 50} bài
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">ℹ️ Cách hoạt động mới:</p>
          <ul className="space-y-1 text-xs">
            <li>• Mỗi lô gọi API riêng, có delay {DELAY_MS / 1000}s giữa các lô để tránh rate limit</li>
            <li>• Nếu hết quota Groq giữa chừng, chương trình dừng và báo — chạy lại sau vài giờ</li>
            <li>• Bài đã tạo được lưu, không bị mất khi dừng giữa chừng</li>
          </ul>
        </div>

        <button
          onClick={start}
          disabled={running}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {running ? (
            <><span className="animate-spin">⏳</span> Đang tạo bài... (đừng đóng tab)</>
          ) : done ? (
            <>🔄 Chạy lại</>
          ) : (
            <>⚡ Bắt đầu tạo bài tập nâng cao</>
          )}
        </button>
      </div>

      {log.length > 0 && (
        <div className="mt-6 bg-gray-900 rounded-2xl p-5 font-mono text-xs text-green-400 max-h-[500px] overflow-y-auto">
          {log.map((line, i) => (
            <div key={i} className={`leading-relaxed ${
              line === '' ? 'h-2' :
              line.startsWith('🎉') ? 'text-yellow-300 font-bold mt-1' :
              line.startsWith('❌') ? 'text-red-400' :
              line.startsWith('⚠️') ? 'text-amber-400' :
              line.startsWith('📚') ? 'text-white font-semibold mt-1' :
              line.startsWith('  →') ? 'text-cyan-400' : ''
            }`}>
              {line || ' '}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
