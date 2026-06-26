import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Không có file' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
        },
      },
      'Hãy đọc và chép lại chính xác bài toán trong ảnh này. Chỉ trả về nội dung bài toán, không thêm bất kỳ giải thích nào. Nếu có ký hiệu toán học hãy giữ nguyên hoặc dùng ký hiệu thông thường.',
    ])

    const text = result.response.text()
    return NextResponse.json({ problem: text })
  } catch (error) {
    console.error('OCR API error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi đọc ảnh. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
