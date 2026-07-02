import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { auth } from '@/auth'
import { TOPICS } from '@/lib/topics'

export const runtime = 'nodejs'
export const maxDuration = 120

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TOPIC_LIST = TOPICS.map(t => `"${t.id}": ${t.name}`).join('\n')

// llama-3.1-8b-instant: 30k TPM — primary (fast, high limit)
// llama-3.3-70b-versatile: 12k TPM — fallback (better quality)
const PARSE_MODELS = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile']

// Safe chunk size: ~4000 chars ≈ 1200 tokens input + 2500 output ≈ 3700 tokens total
// Well under 30k TPM of 8b-instant
const CHUNK_CHARS = 4000

function repairJSON(s: string): string {
  let result = ''
  let inStr = false
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch === '"' && (i === 0 || s[i - 1] !== '\\')) { inStr = !inStr; result += ch }
    else if (inStr) {
      if (ch === '\n') result += '\\n'
      else if (ch === '\r') result += '\\r'
      else if (ch === '\t') result += '\\t'
      else if (ch === '\\' && i + 1 < s.length) {
        const next = s[i + 1]
        if ('"\\\/nrtu'.includes(next)) { result += ch + next; i += 2; continue }
        else result += '\\\\'
      } else result += ch
    } else result += ch
    i++
  }
  return result
}

function parseJsonArray(raw: string): unknown[] {
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) return []
  try { return JSON.parse(match[0]) as unknown[] } catch { /* try repair */ }
  try { return JSON.parse(repairJSON(match[0])) as unknown[] } catch { return [] }
}

// Split text into chunks at natural exercise boundaries (double newline / "Bài "/"Câu ")
function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_CHARS) return [text]

  // Split into paragraphs at double-newline or before "Bài "/"Câu "/"Câu hỏi "
  const paragraphs = text.split(/(?=\nBài |\nCâu |\nPhần |\nChuyên đề )|\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > CHUNK_CHARS && current.length > 0) {
      chunks.push(current.trim())
      current = para
    } else {
      current = current ? current + '\n\n' + para : para
    }
  }
  if (current.trim()) chunks.push(current.trim())

  // Safety: if some chunk is still huge (single massive exercise), hard-split it
  const result: string[] = []
  for (const chunk of chunks) {
    if (chunk.length <= CHUNK_CHARS * 1.5) {
      result.push(chunk)
    } else {
      // Hard split at sentence boundaries
      let start = 0
      while (start < chunk.length) {
        let end = start + CHUNK_CHARS
        if (end < chunk.length) {
          const dot = chunk.lastIndexOf('.', end)
          if (dot > start + 500) end = dot + 1
        }
        result.push(chunk.slice(start, Math.min(end, chunk.length)))
        start = end
      }
    }
  }

  return result.filter(c => c.trim().length > 0)
}

function buildSystemPrompt(autoTopic: boolean): string {
  return `Bạn là trợ lý xử lý đề toán lớp 9 Việt Nam. Nhận văn bản đề toán, trả về JSON array.

BƯỚC 1: Ghép text vỡ — nếu ký tự đơn tách rời nhau (ví dụ "v à đ ư ờ n g"), nối lại thành từ đúng.
BƯỚC 2: Tách thành từng bài tập độc lập.
BƯỚC 3: Trả về JSON array, MỖI PHẦN TỬ gồm:
- "title": tiêu đề ngắn (≤80 ký tự)
- "content": nội dung đầy đủ bài (gồm tất cả a), b), c)...)
${autoTopic ? `- "topicId": chọn từ:\n${TOPIC_LIST}\n- "topicName": tên chủ đề tương ứng` : ''}

ĐỊNH DẠNG TOÁN (BẮT BUỘC trong content):
Dùng LaTeX trong $...$: x^2→$x^2$, sqrt(x)→$\\sqrt{x}$, Delta→$\\Delta$, >=→$\\geq$, <=→$\\leq$

QUY TẮC:
- Mỗi bài/câu là 1 phần tử riêng; a),b),c) của cùng 1 bài giữ chung 1 phần tử
- Chỉ trả JSON array thuần, không markdown, không giải thích`
}

async function parseChunk(chunk: string, systemPrompt: string): Promise<unknown[]> {
  let lastErr: Error | null = null

  for (const model of PARSE_MODELS) {
    try {
      const chat = await groq.chat.completions.create({
        model,
        temperature: 0.1,
        max_tokens: 2500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: chunk },
        ],
      })
      const raw = chat.choices[0]?.message?.content ?? '[]'
      return parseJsonArray(raw)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const isTokenLimit = msg.includes('413') || msg.includes('rate_limit') ||
        msg.includes('tokens') || msg.includes('TPM') || msg.includes('429')
      console.warn(`[parse] ${model} failed: ${msg.slice(0, 120)}`)
      lastErr = e instanceof Error ? e : new Error(msg)
      if (isTokenLimit) continue  // try next model
      throw e                      // non-rate-limit error → bubble up
    }
  }
  throw lastErr ?? new Error('All models failed')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { text, autoTopic } = await req.json()
    if (!text?.trim()) return NextResponse.json({ exercises: [] })

    const systemPrompt = buildSystemPrompt(!!autoTopic)
    const chunks = splitIntoChunks(text)
    console.log(`[parse] ${chunks.length} chunk(s) for ${text.length} chars`)

    const allExercises: unknown[] = []
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[parse] chunk ${i + 1}/${chunks.length}: ${chunks[i].length} chars`)
      const exercises = await parseChunk(chunks[i], systemPrompt)
      allExercises.push(...exercises)
      // Small delay between chunks to respect TPM window
      if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 800))
    }

    return NextResponse.json({ exercises: allExercises })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('parse-exercises error:', msg)

    // User-friendly error messages
    if (msg.includes('413') || msg.includes('tokens') || msg.includes('TPM')) {
      return NextResponse.json({
        error: 'Văn bản quá dài cho một lần xử lý. Hãy chia nhỏ thành từng phần (mỗi phần ≤ 10 bài) và thử lại.',
      }, { status: 413 })
    }
    if (msg.includes('429') || msg.includes('rate_limit')) {
      return NextResponse.json({
        error: 'AI đang bận (rate limit). Vui lòng đợi 30 giây rồi thử lại.',
      }, { status: 429 })
    }
    return NextResponse.json({ error: 'Lỗi xử lý: ' + msg }, { status: 500 })
  }
}
