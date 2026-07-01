import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { auth } from '@/auth'

export const runtime = 'nodejs'
export const maxDuration = 60

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function extractPdfText(buf: Buffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buf) })
  const pdf = await loadingTask.promise
  const pages: string[] = []
  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = content.items as any[]
    const lineMap = new Map<number, string[]>()
    for (const item of items) {
      if (!('str' in item) || !item.str.trim()) continue
      const y = Math.round(item.transform[5])
      if (!lineMap.has(y)) lineMap.set(y, [])
      lineMap.get(y)!.push(item.str)
    }
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a)
    const lines = sortedYs.map(y => lineMap.get(y)!.join(''))
    pages.push(lines.join('\n'))
  }
  return pages.join('\n\n')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Không có file' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    let extractedText = ''

    if (ext === 'docx') {
      const mammoth = (await import('mammoth')).default
      const buf = Buffer.from(await file.arrayBuffer())
      const result = await mammoth.extractRawText({ buffer: buf })
      extractedText = result.value
    }
    else if (ext === 'pdf') {
      const buf = Buffer.from(await file.arrayBuffer())
      extractedText = await extractPdfText(buf)
    }
    else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mime = file.type || `image/${ext}`
      const chat = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
            { type: 'text', text: 'Đây là đề toán lớp 9. Chép lại toàn bộ nội dung, số bài, phần a) b)... và công thức. Chỉ trả về văn bản thuần.' },
          ],
        }],
        max_tokens: 2000,
      })
      extractedText = chat.choices[0]?.message?.content ?? ''
    }
    else {
      return NextResponse.json({ error: `Định dạng .${ext} không được hỗ trợ` }, { status: 400 })
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Không đọc được nội dung từ file' }, { status: 422 })
    }

    return NextResponse.json({ text: extractedText.trim() })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('extract-file error:', msg)
    return NextResponse.json({ error: `Lỗi đọc file: ${msg}` }, { status: 500 })
  }
}
