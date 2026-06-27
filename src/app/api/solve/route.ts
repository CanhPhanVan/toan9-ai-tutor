import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { parseAIJson } from '@/lib/parseJson'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { problem } = await request.json()

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Bạn là gia sư toán lớp 9 chuyên nghiệp. Giải bài toán chi tiết từng bước.

ĐỊNH DẠNG TOÁN HỌC (BẮT BUỘC): Mọi ký hiệu toán PHẢI dùng LaTeX trong $...$
Ví dụ: $x^2$, $\\sqrt{x}$, $\\frac{a}{b}$, $\\Delta = b^2 - 4ac$, $x_1 + x_2 = \\frac{-b}{a}$
KHÔNG viết: x^2, sqrt(x), delta — phải luôn dùng $...$

Trả về JSON hợp lệ (không thêm text ngoài JSON, không dùng markdown):
{
  "method": "Tên phương pháp giải",
  "steps": [
    {
      "step": 1,
      "title": "Tên bước",
      "content": "Nội dung chi tiết với $x^2 + bx = 0$",
      "formula": "$\\\\Delta = b^2 - 4ac$"
    }
  ],
  "answer": "Đáp án: $x_1 = 1, x_2 = 3$",
  "commonMistakes": ["Quên tính $\\\\Delta$ trước", "Nhầm dấu"],
  "tips": "Mẹo khi làm dạng bài này"
}`,
        },
        { role: 'user', content: `Giải bài toán sau đây một cách chi tiết:\n${problem}` },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const result = parseAIJson(text)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Solve API error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi giải bài. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
