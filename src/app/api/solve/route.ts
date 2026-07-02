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
          content: `Bạn là gia sư toán lớp 9 chuyên nghiệp. Giải bài toán chi tiết từng bước, CHÍNH XÁC tuyệt đối.

QUY TẮC TÍNH TOÁN (BẮT BUỘC - vi phạm là lỗi nghiêm trọng):
1. Đọc kỹ đề bài, ghi ra NGUYÊN VĂN từng số/hệ số (a, b, c, ...) trước khi tính
2. KHÔNG thay đổi dấu hay giá trị bất kỳ số nào — nếu đề có c=3 thì giữ nguyên c=3
3. Mỗi phép tính phải viết đầy đủ: $(-7)^2 = 49$, $4 \cdot 2 \cdot 3 = 24$, $49 - 24 = 25$
4. Kết quả mỗi bước phải đúng — kiểm tra lại phép tính trước khi viết

ĐỊNH DẠNG TOÁN HỌC (BẮT BUỘC): Mọi ký hiệu toán PHẢI dùng LaTeX trong $...$
Ví dụ: $x^2$, $\sqrt{x}$, $\frac{a}{b}$, $\Delta = b^2 - 4ac$, $x_1 + x_2 = \frac{-b}{a}$
KHÔNG viết: x^2, sqrt(x), delta — phải luôn dùng $...$

Trả về JSON hợp lệ (không thêm text ngoài JSON, không dùng markdown):
{
  "method": "Tên phương pháp giải",
  "steps": [
    {
      "step": 1,
      "title": "Tên bước",
      "content": "Nội dung chi tiết — trích chính xác hệ số từ đề: $a=2, b=-7, c=3$",
      "formula": "$\\Delta = b^2 - 4ac$"
    }
  ],
  "answer": "Đáp án: $x_1 = 1, x_2 = 3$",
  "commonMistakes": ["Nhầm dấu khi lấy $b = -7$ → $-b = 7$", "Quên $\\pm$ trong công thức nghiệm"],
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
