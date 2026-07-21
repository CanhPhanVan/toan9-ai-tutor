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

    async function callGroq() {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Bạn là giáo viên toán lớp 9 chuyên nghiệp và thân thiện. Chấm bài làm theo từng bước.

ĐỊNH DẠNG KÝ HIỆU TOÁN (BẮT BUỘC trong mọi chuỗi text):
- Mọi biểu thức toán PHẢI bọc trong $...$: ví dụ $x^2$, $\\Delta = b^2 - 4ac$, $\\sqrt{x}$, $\\frac{a}{b}$, $x_1$
- Phương trình dài dùng $$...$$: ví dụ $$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$
- KHÔNG viết: x^2, delta, sqrt(x) — phải luôn dùng $...$
- QUAN TRỌNG: đây là JSON, mọi dấu \\ trong LaTeX PHẢI viết thành \\\\ để JSON hợp lệ (ví dụ \\\\Delta, \\\\frac, \\\\sqrt)

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
    "method": "Tên phương pháp cụ thể (ví dụ: Phương pháp thế, Phương pháp cộng đại số...)",
    "steps": [
      "Bước 1: Đặt ẩn và lập phương trình — ghi rõ từng phương trình lập được, ví dụ: $\\frac{1}{x} + \\frac{1}{y} = \\frac{1}{6}$ và $\\frac{4}{x} + \\frac{3}{y} = \\frac{2}{3}$",
      "Bước 2: Biến đổi/rút gọn hệ — ghi rõ phép tính, ví dụ: Đặt $u = \\frac{1}{x}$, $v = \\frac{1}{y}$ được hệ $u + v = \\frac{1}{6}$, $4u + 3v = \\frac{2}{3}$",
      "Bước 3: Giải hệ — trình bày từng phép tính cụ thể: từ PT(1) rút $u = \\frac{1}{6} - v$, thế vào PT(2) tính ra $v = ...$, suy ra $u = ...$",
      "Bước 4: Kết luận — tính ngược lại $x = ...$, $y = ...$"
    ],
    "answer": "Đáp án cuối cùng ghi rõ giá trị, ví dụ $x = 10$ ngày, $y = 30$ ngày"
  },
  "encouragement": "Lời động viên cho học sinh lớp 9"
}

YÊU CẦU VỀ correctSolution.steps (BẮT BUỘC):
- Mỗi bước PHẢI ghi rõ phép tính cụ thể, con số thực tế, không được viết chung chung kiểu "Giải hệ phương trình trên"
- Phải trình bày đủ: lập phương trình → biến đổi → tính toán từng bước → kết quả
- Tất cả biểu thức toán bọc trong $...$
- Số bước từ 4 đến 7 bước tùy độ phức tạp của bài`,
          },
          { role: 'user', content: prompt },
        ],
      })
      return completion.choices[0]?.message?.content ?? ''
    }

    let text = await callGroq()
    let result: { overallCorrect?: boolean; steps?: { isCorrect: boolean }[] }
    try {
      result = parseAIJson(text) as typeof result
    } catch (parseError) {
      console.error('Grade API JSON parse failed, raw text (first 500 chars):', text.slice(0, 500))
      console.error('Parse error:', parseError)
      // Retry once — models occasionally emit malformed JSON on the first try
      text = await callGroq()
      try {
        result = parseAIJson(text) as typeof result
      } catch (retryError) {
        console.error('Grade API JSON parse failed on retry too, raw text (first 500 chars):', text.slice(0, 500))
        throw retryError
      }
    }

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
