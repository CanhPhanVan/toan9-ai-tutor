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
Trả về JSON hợp lệ (không thêm text ngoài JSON, không dùng markdown):
{
  "method": "Tên phương pháp giải",
  "steps": [
    {
      "step": 1,
      "title": "Tên bước",
      "content": "Nội dung chi tiết",
      "formula": "Công thức sử dụng nếu có"
    }
  ],
  "answer": "Đáp án cuối cùng",
  "commonMistakes": ["Lỗi thường gặp 1", "Lỗi thường gặp 2"],
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
