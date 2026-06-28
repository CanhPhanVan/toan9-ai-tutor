import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { parseAIJson } from '@/lib/parseJson'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { exercise, studentSteps, solution, aiHelpCount = 0 } = await request.json()

    const prompt = `Bài toán: ${exercise.title}
Nội dung: ${exercise.content}

Bài làm của học sinh (từng bước):
${(studentSteps as string[]).map((step: string, i: number) => `Bước ${i + 1}: ${step}`).join('\n')}

Đáp án đúng để tham khảo:
Phương pháp: ${solution.method}
Các bước đúng: ${(solution.steps as string[]).join(' | ')}
Đáp án: ${solution.answer}

Hãy chấm bài làm của học sinh theo từng bước và trả về JSON.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Bạn là giáo viên toán lớp 9 chuyên nghiệp và thân thiện. Chấm bài làm theo từng bước.

ĐỊNH DẠNG KÝ HIỆU TOÁN (BẮT BUỘC trong mọi chuỗi text):
- Mọi biểu thức toán PHẢI bọc trong $...$: ví dụ $x^2$, $\\Delta = b^2 - 4ac$, $\\sqrt{x}$, $\\frac{a}{b}$, $x_1$
- Phương trình dài dùng $$...$$: ví dụ $$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$
- KHÔNG viết: x^2, delta, sqrt(x) — phải luôn dùng $...$

Trả về JSON hợp lệ với format CHÍNH XÁC (không thêm text ngoài JSON, không dùng markdown):
{
  "steps": [
    {
      "stepNumber": 1,
      "isCorrect": true,
      "feedback": "Nhận xét chi tiết với ký hiệu toán đúng, ví dụ: $\\Delta = b^2 - 4ac$",
      "wrongReason": null
    }
  ],
  "overallCorrect": false,
  "correctSolution": {
    "method": "Tên phương pháp",
    "steps": ["Bước 1 với ký hiệu $x^2 + bx + c = 0$", "Bước 2 tính $\\Delta = b^2 - 4ac$"],
    "answer": "Đáp án, ví dụ $x_1 = 1, x_2 = 3$"
  },
  "encouragement": "Lời động viên cho học sinh lớp 9"
}`,
        },
        { role: 'user', content: prompt },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const result = parseAIJson(text) as { overallCorrect?: boolean; steps?: { isCorrect: boolean }[] }

    // Compute score from step results
    const steps = result.steps ?? []
    const correctSteps = steps.filter(s => s.isCorrect).length
    const score = steps.length > 0 ? Math.round((correctSteps / steps.length) * 100) : (result.overallCorrect ? 100 : 0)

    // Save submission to DB (non-blocking)
    try {
      const session = await auth()
      await prisma.submission.create({
        data: {
          userId: session?.user?.id ?? null,
          userName: session?.user?.name ?? null,
          exerciseId: exercise.id ?? 'unknown',
          exerciseTitle: exercise.title ?? null,
          topicId: exercise.topicId ?? null,
          topicName: exercise.topicName ?? null,
          studentAnswer: (studentSteps as string[]).join('\n'),
          isCorrect: result.overallCorrect ?? null,
          score,
          aiHelpCount: typeof aiHelpCount === 'number' ? aiHelpCount : 0,
        },
      })
    } catch { /* non-critical */ }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Grade API error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi chấm bài. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
