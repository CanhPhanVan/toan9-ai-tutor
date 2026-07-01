import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { TOPICS } from '@/lib/topics'

export const runtime = 'nodejs'
export const maxDuration = 30  // 1 batch = 1 Groq call, fast

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 25000,
  maxRetries: 0,
})

const FALLBACK_MODELS = [
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'llama-3.3-70b-versatile',
]

const SCHEMA = `[{"title":"string","content":"string","solution":"string","hints":"string","method":"string"}]`

function extractFirstArray(s: string): string | null {
  const start = s.indexOf('[')
  if (start === -1) return null
  let depth = 0
  let inStr = false
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (ch === '"' && (i === 0 || s[i - 1] !== '\\')) inStr = !inStr
    if (!inStr) {
      if (ch === '[') depth++
      else if (ch === ']') { depth--; if (depth === 0) return s.slice(start, i + 1) }
    }
  }
  return null
}

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

function parseExerciseArray(raw: string): Record<string, unknown>[] {
  const extracted = extractFirstArray(raw)
  if (!extracted) throw new Error('AI không trả JSON')
  try { return JSON.parse(extracted) } catch { /* try repair */ }
  try { return JSON.parse(repairJSON(extracted)) } catch (e) {
    throw new Error('JSON parse thất bại: ' + (e instanceof Error ? e.message : String(e)))
  }
}

async function generateWithFallback(messages: { role: string; content: string }[]) {
  let lastError: Error | null = null
  for (const model of FALLBACK_MODELS) {
    try {
      const chat = await groq.chat.completions.create({
        model,
        temperature: 0.8,
        max_tokens: 4000,
        messages: messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      })
      const raw = chat.choices[0]?.message?.content ?? '[]'
      const exercises = parseExerciseArray(raw)
      return { exercises, model }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const skip = msg.includes('429') || msg.includes('rate_limit') || msg.includes('decommissioned') ||
        msg.includes('model_not_active') || msg.includes('AI không trả JSON') || msg.includes('JSON parse thất bại')
      if (skip) {
        console.warn(`[gen] ${model} failed (${msg.slice(0, 80)}), trying next...`)
        lastError = e instanceof Error ? e : new Error(msg)
        continue
      }
      throw e
    }
  }
  throw lastError ?? new Error('All models rate limited or returned invalid JSON')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { topicId, batch = 0 } = await req.json()

    const topic = TOPICS.find(t => t.id === topicId)
    if (!topic) return NextResponse.json({ error: 'Chủ đề không tồn tại' }, { status: 400 })

    const messages = [
      {
        role: 'system',
        content: `Giáo viên toán lớp 9 VN. Tạo 10 bài toán NÂNG CAO về chủ đề "${topic.name}".
Yêu cầu: nâng cao, đa dạng dạng, có lời giải từng bước, batch ${batch + 1}.

ĐỊNH DẠNG TOÁN HỌC (BẮT BUỘC trong mọi trường content/solution/hints):
Mọi ký hiệu toán PHẢI dùng LaTeX trong $...$: $x^2$, $\\sqrt{x}$, $\\frac{a}{b}$, $\\Delta$, $x_1$
KHÔNG viết: x^2, sqrt(x), delta/Delta — phải luôn dùng $...$

Trả về JSON array: ${SCHEMA}
Chỉ JSON array thuần, không markdown, không giải thích.`,
      },
      {
        role: 'user',
        content: `Tạo 10 bài nâng cao về "${topic.name}", batch ${batch + 1}, dạng KHÁC nhau.`,
      },
    ]

    const { exercises, model: usedModel } = await generateWithFallback(messages)
    console.log(`[gen] Used model: ${usedModel} for ${topicId} b${batch}`)

    let saved = 0
    for (const ex of exercises) {
      try {
        await prisma.dbExercise.create({
          data: {
            title: String(ex.title ?? '').slice(0, 200),
            content: String(ex.content ?? ''),
            topicId: topic.id,
            topicName: topic.name,
            difficulty: 'advanced',
            method: String(ex.method ?? ''),
            solution: String(ex.solution ?? ''),
            hints: String(ex.hints ?? ''),
            status: 'published',
          },
        })
        saved++
      } catch (e) {
        console.error(`[gen] DB error ${topicId}:`, e)
      }
    }

    return NextResponse.json({ saved, topicId, topicName: topic.name, batch, model: usedModel })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const isRateLimit = msg.includes('429') || msg.includes('rate_limit')
    const waitMatch = msg.match(/try again in ([^".\n]+)/)
    return NextResponse.json({
      saved: 0,
      error: msg,
      isRateLimit,
      retryAfter: waitMatch?.[1] ?? null,
    }, { status: isRateLimit ? 429 : 500 })
  }
}
