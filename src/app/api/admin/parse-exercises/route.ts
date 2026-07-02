import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { auth } from '@/auth'
import { TOPICS } from '@/lib/topics'

export const runtime = 'nodejs'
export const maxDuration = 60

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TOPIC_LIST = TOPICS.map(t => `"${t.id}": ${t.name}`).join('\n')

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
        if ('"\\\/bfnrtu'.includes(next)) { result += ch + next; i += 2; continue }
        else result += '\\\\'
      } else result += ch
    } else result += ch
    i++
  }
  return result
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { text, autoTopic } = await req.json()
    if (!text?.trim()) return NextResponse.json({ exercises: [] })

    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 6000,
      messages: [
        {
          role: 'system',
          content: `Bạn là trợ lý xử lý đề toán lớp 9 Việt Nam. Nhiệm vụ: nhận văn bản đề toán (có thể bị vỡ ký tự do copy PDF), trả về JSON array.

BƯỚC 1: Ghép text vỡ — nếu thấy ký tự đơn tách rời nhau (ví dụ "v à đ ư ờ n g"), hãy nối lại thành từ đúng.
BƯỚC 2: Tách thành từng bài tập độc lập.
BƯỚC 3: Trả về JSON array, MỖI PHẦN TỬ gồm:
- "title": tiêu đề ngắn (≤80 ký tự)
- "content": nội dung đầy đủ bài (gồm tất cả a), b), c)...)
${autoTopic ? `- "topicId": chọn từ danh sách:\n${TOPIC_LIST}\n- "topicName": tên chủ đề tương ứng` : ''}

ĐỊNH DẠNG TOÁN HỌC (BẮT BUỘC trong trường content):
Chuyển đổi ký hiệu toán thành LaTeX trong $...$: x^2 → $x^2$, sqrt(x) → $\\sqrt{x}$, Delta → $\\Delta$, >= → $\\geq$

QUY TẮC QUAN TRỌNG:
- Tách MỖI bài/câu thành 1 phần tử riêng (đừng gộp tất cả vào 1)
- Các phần a), b), c) của CÙNG 1 bài thì GIỮ CHUNG trong 1 phần tử
- Chỉ trả về JSON array thuần, KHÔNG có markdown, KHÔNG giải thích`,
        },
        {
          role: 'user',
          content: text.slice(0, 14000),
        },
      ],
    })

    const raw = chat.choices[0]?.message?.content ?? '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ exercises: [] })
    let exercises: unknown[]
    try { exercises = JSON.parse(match[0]) } catch {
      try { exercises = JSON.parse(repairJSON(match[0])) } catch (e2) {
        return NextResponse.json({ error: 'AI trả về JSON không hợp lệ. Thử lại hoặc đơn giản hóa nội dung: ' + (e2 instanceof Error ? e2.message : String(e2)) }, { status: 500 })
      }
    }
    return NextResponse.json({ exercises })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('parse-exercises error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
