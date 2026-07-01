import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { EXAM_STRUCTURES, type ExamContent, type ExamQuestion } from '@/lib/examStructures'

export const runtime = 'nodejs'
export const maxDuration = 30  // 1 exam per call

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

async function groqChat(messages: { role: string; content: string }[], maxTokens = 3000) {
  let lastError: Error | null = null
  for (const model of FALLBACK_MODELS) {
    try {
      const chat = await groq.chat.completions.create({
        model,
        temperature: 0.85,
        max_tokens: maxTokens,
        messages: messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
      })
      return { chat, model }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const skip = msg.includes('429') || msg.includes('rate_limit') ||
                   msg.includes('decommissioned') || msg.includes('model_not_active')
      if (skip) {
        console.warn(`[gen-exam] ${model} unavailable, trying next...`)
        lastError = e instanceof Error ? e : new Error(msg)
        continue
      }
      throw e
    }
  }
  const lastMsg = lastError?.message ?? ''
  const waitMatch = lastMsg.match(/try again in ([^".\n]+)/)
  const err = Object.assign(lastError ?? new Error('All models rate limited'), {
    isRateLimit: true,
    retryAfter: waitMatch?.[1] ?? null,
  })
  throw err
}

function extractFirstJSON(s: string): string | null {
  const start = s.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inStr = false
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (ch === '"' && (i === 0 || s[i - 1] !== '\\')) inStr = !inStr
    if (!inStr) {
      if (ch === '{') depth++
      else if (ch === '}') { depth--; if (depth === 0) return s.slice(start, i + 1) }
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

function safeParseJSON(raw: string): { questions?: ExamQuestion[] } {
  const extracted = extractFirstJSON(raw)
  if (!extracted) throw new Error('AI khong tra ve JSON hop le')
  try { return JSON.parse(extracted) } catch { /* try repair */ }
  try { return JSON.parse(repairJSON(extracted)) } catch (e) {
    throw new Error('JSON parse that bai: ' + (e instanceof Error ? e.message : String(e)))
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, examIndex = 0, totalExisting = 0 } = await req.json()
    const structure = EXAM_STRUCTURES[type as keyof typeof EXAM_STRUCTURES]
    if (!structure) return NextResponse.json({ error: 'Loai de khong hop le' }, { status: 400 })

    const isMCQ = (q: typeof structure.questions[0]) => 'isMCQ' in q && q.isMCQ
    const structureDesc = structure.questions.map(q => {
      if (isMCQ(q)) return `Cau ${q.number} (${q.points}d): Trac nghiem 8 cau 0.25d, chu de ${q.topic}.`
      const parts = q as typeof q & { parts: string[], partPoints: number[] }
      return `Cau ${q.number} (${q.points}d): ${q.topic}. ${parts.parts.map((p: string, i: number) => `${p}) ${parts.partPoints[i]}d`).join(', ')}.`
    }).join('\n')

    const systemPrompt = `Ban la giao vien toan lop 9 TPHCM. Soan 1 de thi so ${examIndex + 1} theo cau truc:

${structureDesc}

VI DU DUNG (content phai co so lieu cu the nhu the nay):
- "Tinh A = can(12) + can(27) - can(48)"
- "Giai he phuong trinh: 2x + 3y = 7 va x - y = 1"
- "Cho tam giac ABC co AB=6cm, BC=8cm, AC=10cm. Chung minh tam giac ABC vuong"
- "Tim m de phuong trinh x^2 - 2mx + m + 6 = 0 co hai nghiem duong"

VI DU SAI (TUYET DOI KHONG lam the nay):
- "He phuong trinh sau co vo so nghiem:" (thieu so lieu!)
- "Cho bieu thuc sau day:" (thieu noi dung!)
- "Tinh gia tri bieu thuc:" (qua chung chung!)

KY HIEU TOAN HOC (BAT BUOC trong content, solution, answer):
Dung $...$ cho moi ky hieu toan: $x^2$, $\sqrt{x}$, $\frac{a}{b}$, $\Delta = b^2 - 4ac$, $x_1$, $\geq$, $\leq$
Vi du content dung: "Tinh $A = \sqrt{12} + \sqrt{27} - \sqrt{48}$"
Vi du content dung: "Tim $m$ de $x^2 - 2mx + m + 6 = 0$ co hai nghiem duong"

Yeu cau:
- "content": PHAI co day du bai toan voi so lieu cu the, hoc sinh doc xong la lam duoc ngay
- "solution": loi giai chi tiet tung buoc co ky hieu $...$
- "answer": ket qua cuoi cung co ky hieu $...$

Tra ve JSON (chi JSON, khong them text ngoai):
{"questions":[{"number":1,"points":2.0,"topic":"ten chu de","parts":[{"label":"a","points":0.5,"content":"Tinh $A = \\sqrt{12} + \\sqrt{27} - \\sqrt{48}$","solution":"$\\sqrt{12}=2\\sqrt{3}$, $\\sqrt{27}=3\\sqrt{3}$, $\\sqrt{48}=4\\sqrt{3}$ => $A=\\sqrt{3}$","answer":"$A = \\sqrt{3}$"}]}]}`

    const { chat, model: usedModel } = await groqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Soan de thi so ${examIndex + 1}. BAT BUOC: moi "content" phai co so lieu va phuong trinh cu the, hoc sinh doc xong la biet can lam gi. Chi tra ve JSON.` },
    ])

    const raw = chat.choices[0]?.message?.content ?? '{}'
    const parsed = safeParseJSON(raw)
    const questions: ExamQuestion[] = (parsed.questions ?? []).map(q => ({
      ...q,
      parts: q.parts ?? [],
    }))

    const typeLabels: Record<string, string> = {
      'tuyen-sinh': 'Tuyen sinh lop 10',
      'hk1': 'Kiem tra HK1',
      'hk2': 'Kiem tra HK2',
    }
    const title = `${typeLabels[type] ?? type} - De so ${totalExisting + examIndex + 1}`
    const content: ExamContent = {
      structure: type,
      totalPoints: structure.totalPoints,
      duration: structure.duration,
      questions,
    }

    await prisma.exam.create({
      data: { title, type, content: JSON.stringify(content), duration: structure.duration, status: 'published' },
    })

    return NextResponse.json({ saved: 1, title, model: usedModel })
  } catch (e) {
    const err = e as Error & { isRateLimit?: boolean; retryAfter?: string }
    const msg = err.message ?? String(e)
    const isRateLimit = err.isRateLimit || msg.includes('429') || msg.includes('rate_limit')
    const waitMatch = msg.match(/try again in ([^".\n]+)/)
    return NextResponse.json({
      saved: 0, error: msg, isRateLimit,
      retryAfter: err.retryAfter ?? waitMatch?.[1] ?? null,
    }, { status: isRateLimit ? 429 : 500 })
  }
}
