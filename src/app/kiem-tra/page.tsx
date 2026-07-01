import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { EXAM_TYPE_LABELS } from '@/lib/examStructures'

export const dynamic = 'force-dynamic'

export default async function KiemTraPage() {
  const exams = await prisma.exam.findMany({
    where: { status: 'published' },
    select: { id: true, title: true, type: true, duration: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const grouped: Record<string, typeof exams> = {}
  for (const exam of exams) {
    if (!grouped[exam.type]) grouped[exam.type] = []
    grouped[exam.type].push(exam)
  }

  const typeOrder = ['tuyen-sinh', 'hk1', 'hk2']
  const typeColors: Record<string, string> = {
    'tuyen-sinh': 'bg-red-50 border-red-100 text-red-700',
    'hk1': 'bg-blue-50 border-blue-100 text-blue-700',
    'hk2': 'bg-green-50 border-green-100 text-green-700',
  }
  const typeIcons: Record<string, string> = {
    'tuyen-sinh': '🎓', 'hk1': '📘', 'hk2': '📗',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Trang chủ</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">📋 Kiểm tra & Thi thử</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn đề thi</h2>
          <p className="text-gray-600 text-sm">Đề thi theo cấu trúc Sở GD&ĐT TP.HCM 2026 · AI chấm bài và giải thích chi tiết</p>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>Chưa có đề thi nào. Vui lòng liên hệ giáo viên.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {typeOrder.filter(t => grouped[t]?.length).map(type => (
              <div key={type}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{typeIcons[type]}</span>
                  <h3 className="text-lg font-bold text-gray-800">{EXAM_TYPE_LABELS[type]}</h3>
                  <span className="text-xs text-gray-400">{grouped[type].length} đề</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[type].map(exam => (
                    <Link key={exam.id} href={`/kiem-tra/${exam.id}`}>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 cursor-pointer group">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-3 ${typeColors[exam.type]}`}>
                          {typeIcons[exam.type]} {EXAM_TYPE_LABELS[exam.type]}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                          {exam.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>⏱ {exam.duration} phút</span>
                          <span>📅 {new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-end">
                          <span className="text-xs text-indigo-500 font-medium group-hover:text-indigo-700">Vào thi →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
