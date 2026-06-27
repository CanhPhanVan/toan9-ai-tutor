import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import type { ExamContent } from '@/lib/examStructures'

export const runtime = 'nodejs'
export const maxDuration = 60

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 20000,
  maxRetries: 0,
})

const GRADE_MODELS = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'llama-3.3-70b-versatile']

interface PartResult {
  key: string
  label: string
  points: number
  earned: number
  isCorrect: boolean
  studentAnswer: string
  correctAnswer: string
  feedback: string
}

function extractJSON(s: string): string | null {
  const start = s.indexOf('{')
  if (start === -1) return null
  let depth = 0, inStr = false
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

async function gradeOnePart(
  content: string, answer: string, solution: string,
  studentAnswer: string, maxPoints: number
): Promise<{ earned: number; isCorrect: boolean; feedback: string }> {
  const prompt = `Cham bai toan lop 9:
DE BAI: ${content}
DAP AN DUNG: ${answer}
LOI GIAI MAU: ${solution}
BAI LAM HOC SINH: ${studentAnswer}
DIEM TOI DA: ${maxPoints}

Tra ve JSON: {"earned": so_diem (0 den ${maxPoints}), "isCorrect": true/false, "feedback": "nhan xet chi tiet"}`

  let lastErr: Error | null = null
  for (const model of GRADE_MODELS) {
    try {
      const chat = await groq.chat.completions.create({
        model, temperature: 0.1, max_tokens: 400,
        messages: [
          { role: 'system', content: 'Bạn là giáo viên toán lớp 9 chấm bài. Chỉ trả về JSON.\nĐỊNH DẠNG TOÁN (BẮT BUỘC trong feedback và correctAnswer): dùng $...$ cho mọi ký hiệu toán. Ví dụ: $x^2$, $\\Delta = b^2 - 4ac$, $\\sqrt{x}$, $\\frac{a}{b}$.' },
          { role: 'user', content: prompt },
        ],
      })
      const raw = chat.choices[0]?.message?.content ?? '{}'
      const extracted = extractJSON(raw)
      if (!extracted) throw new Error('No JSON')
      const grade = JSON.parse(extracted) as { earned?: number; isCorrect?: boolean; feedback?: string }
      return {
        earned: Math.min(Math.max(Number(grade.earned ?? 0), 0), maxPoints),
        isCorrect: grade.isCorrect ?? false,
        feedback: grade.feedback ?? 'Khong co nhan xet.',
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('decommissioned')) {
        lastErr = e instanceof Error ? e : new Error(msg)
        continue
      }
      throw e
    }
  }
  throw lastErr ?? new Error('All grading models failed')
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  try {
    const { answers } = await req.json() as { answers: Record<string, string> }

    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) return NextResponse.json({ error: 'De thi khong ton tai' }, { status: 404 })

    const content: ExamContent = JSON.parse(exam.content)
    const results: PartResult[] = []
    let totalEarned = 0

    for (const question of content.questions ?? []) {
      for (const part of question.parts ?? []) {
        const key = `${question.number}${part.label}`
        const studentAnswer = (answers[key] ?? '').trim()
        const label = `Cau ${question.number}${part.label ?? ''}`

        if (!studentAnswer) {
          results.push({ key, label, points: part.points, earned: 0, isCorrect: false,
            studentAnswer: '', correctAnswer: part.answer ?? '', feedback: 'Hoc sinh khong lam cau nay.' })
          continue
        }

        try {
          const grade = await gradeOnePart(
            part.content ?? '', part.answer ?? '', part.solution ?? '',
            studentAnswer, part.points
          )
          totalEarned += grade.earned
          results.push({ key, label, points: part.points, ...grade,
            studentAnswer, correctAnswer: part.answer ?? '' })
        } catch {
          results.push({ key, label, points: part.points, earned: 0, isCorrect: false,
            studentAnswer, correctAnswer: part.answer ?? '',
            feedback: 'Khong the cham tu dong. Vui long cho giao vien xem xet.' })
        }
      }
    }

    const score = Math.min(Math.round(totalEarned * 4) / 4, content.totalPoints)
    const session = await auth()

    await prisma.examAttempt.create({
      data: {
        examId,
        userId: session?.user?.id ?? null,
        userName: session?.user?.name ?? null,
        answers: JSON.stringify(answers),
        score,
        feedback: JSON.stringify(results),
      },
    })

    return NextResponse.json({ score, totalPoints: content.totalPoints, results })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[submit-exam]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
