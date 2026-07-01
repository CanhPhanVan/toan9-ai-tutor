import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
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

async function callGroqWithFallback(messages: { role: string; content: string }[]) {
  let lastError: Error | null = null
  for (const model of FALLBACK_MODELS) {
    try {
      const chat = await groq.chat.completions.create({
        model,
        temperature: 0.8,
        max_tokens: 2500,
        messages: messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      })
      return { chat, model }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const skip = msg.includes('429') || msg.includes('rate_limit') || msg.includes('decommissioned') || msg.includes('model_not_active')
      if (skip) {
        console.warn(`[gen] ${model} unavailable, trying next...`)
        lastError = e instanceof Error ? e : new Error(msg)
        continue
      }
      throw e
    }
  }
  throw lastError ?? new Error('All models rate limited')
}

export async function POST(req: NextRequest) {
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

    const { chat, model: usedModel } = await callGroqWithFallback(messages)
    console.log(`[gen] Used model: ${usedModel} for ${topicId} b${batch}`)

    const raw = chat.choices[0]?.message?.content ?? '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) {
      console.error(`[gen] No JSON for ${topicId} b${batch}:`, raw.slice(0, 200))
      return NextResponse.json({ saved: 0, error: 'AI không trả JSON' })
    }

    let exercises: Record<string, unknown>[]
    try {
      exercises = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ saved: 0, error: 'JSON parse thất bại' })
    }

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
