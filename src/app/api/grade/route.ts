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
Trả về JSON hợp lệ với format CHÍNH XÁC (không thêm text ngoài JSON, không dùng markdown):
{
  "steps": [
    {
      "stepNumber": 1,
      "isCorrect": true,
      "feedback": "Nhận xét chi tiết",
      "wrongReason": null
    }
  ],
  "overallCorrect": false,
  "correctSolution": {
    "method": "Tên phương pháp",
    "steps": ["Bước 1 chi tiết", "Bước 2 chi tiết"],
    "answer": "Đáp án cuối cùng"
  },
  "encouragement": "Lời động viên cho học sinh lớp 9"
}`,
        },
        { role: 'user', content: prompt },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const result = parseAIJson(text) as { overallCorrect?: boolean }

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
