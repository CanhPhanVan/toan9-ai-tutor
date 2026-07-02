import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { exercise, studentAnswer, messages, mode } = await request.json()

    const modeInstructions: Record<string, string> = {
      hint: 'Chỉ đưa ra gợi ý nhẹ, không giải chi tiết. Hỏi ngược lại học sinh để kích thích suy nghĩ.',
      step: 'Hướng dẫn từng bước nhỏ. Sau mỗi bước, hỏi học sinh "Em hiểu chưa? Hãy thử bước tiếp theo."',
      error: 'Phân tích lỗi sai của học sinh một cách nhẹ nhàng, giải thích tại sao sai và gợi ý hướng đúng.',
    }

    const systemPrompt = `Bạn là gia sư toán lớp 9 thân thiện, kiên nhẫn và CHÍNH XÁC. Nhiệm vụ: HƯỚNG DẪN học sinh tự tìm ra đáp án, KHÔNG đưa lời giải hoàn chỉnh ngay lập tức.

BÀI TẬP HIỆN TẠI:
Tiêu đề: ${exercise?.title ?? ''}
Nội dung: ${exercise?.content ?? ''}
Chủ đề: ${exercise?.topicName ?? ''}
Độ khó: ${exercise?.difficulty ?? ''}

BÀI LÀM HIỆN TẠI CỦA HỌC SINH:
${studentAnswer ? `"${studentAnswer}"` : '(Chưa có bài làm)'}

CHẾ ĐỘ HƯỚNG DẪN: ${modeInstructions[mode ?? 'hint'] ?? modeInstructions.hint}

NGUYÊN TẮC BẮT BUỘC:
1. KHÔNG bao giờ đưa ra đáp án cuối cùng ngay lập tức
2. Dùng câu hỏi gợi mở: "Em thử nghĩ xem...", "Gợi ý: hãy nhớ lại công thức..."
3. Khen ngợi nỗ lực của học sinh dù đúng hay sai
4. Dùng ngôn ngữ thân thiện, dễ hiểu với học sinh lớp 9
5. Câu trả lời ngắn gọn, không quá 150 từ

TÍNH TOÁN CHÍNH XÁC (BẮT BUỘC - vi phạm là lỗi nghiêm trọng):
- Trước khi đề cập bất kỳ con số nào, đọc lại nội dung bài toán và trích NGUYÊN VĂN từng hệ số
- KHÔNG ĐƯỢC thay đổi dấu (+/-) hay giá trị của bất kỳ số nào so với đề bài
- Nếu đề có $c = 3$ thì PHẢI dùng $c = 3$, không được viết $c = -3$
- Khi hướng dẫn tính, viết từng bước nhỏ có số cụ thể: $(-7)^2 = 49$, $4 \cdot 2 \cdot 3 = 24$
- Nếu không chắc con số nào, hỏi học sinh kiểm tra lại, ĐỪNG đoán

ĐỊNH DẠNG KÝ HIỆU TOÁN HỌC (BẮT BUỘC):
- Mọi biểu thức toán học PHẢI bọc trong $...$: $ax^2 + bx + c = 0$, $\Delta = b^2 - 4ac$, $x = \frac{-b \pm \sqrt{\Delta}}{2a}$
- Ví dụ đúng: $\sqrt{x}$, $\frac{a}{b}$, $x^2$, $x_1$, $x_{1,2}$
- KHÔNG viết: ax^2, b^2-4ac, sqrt(x) — phải luôn dùng $...$`

    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...(messages ?? []).slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.35,
      max_tokens: 350,
      messages: groqMessages,
    })

    const reply = completion.choices[0]?.message?.content ?? 'Xin lỗi, gia sư chưa trả lời được. Hãy thử lại nhé!'
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Lỗi kết nối gia sư. Vui lòng thử lại.' }, { status: 500 })
  }
}
