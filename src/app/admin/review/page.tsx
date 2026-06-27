import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { renderMathContent } from '@/components/MathDisplay'

export default async function AdminReviewPage() {
  const drafts = await prisma.dbExercise.findMany({
    where: { status: 'review' },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">🔍 Kiểm duyệt bài tập</h1>
      <p className="text-sm text-gray-500 mb-6">Bài tập đang chờ duyệt trước khi công bố cho học sinh</p>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p>Không có bài tập nào đang chờ duyệt</p>
          <Link href="/admin/exercises" className="mt-4 inline-block text-indigo-500 hover:underline text-sm">
            Tạo bài tập mới →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map(ex => (
            <div key={ex.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Chờ duyệt</span>
                    <span className="text-xs text-gray-400">{ex.topicName}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{ex.title}</h3>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{renderMathContent(ex.content)}</div>
                  {ex.solution && (
                    <div className="mt-3 bg-indigo-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-indigo-600 mb-1">Lời giải:</p>
                      <div className="text-sm text-gray-700 leading-relaxed">{renderMathContent(ex.solution)}</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <ApproveButton id={ex.id} />
                  <RejectButton id={ex.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ApproveButton({ id }: { id: string }) {
  return (
    <form action={async () => {
      'use server'
      const { prisma: p } = await import('@/lib/prisma')
      await p.dbExercise.update({ where: { id }, data: { status: 'published' } })
    }}>
      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors w-full">
        ✅ Duyệt
      </button>
    </form>
  )
}

function RejectButton({ id }: { id: string }) {
  return (
    <form action={async () => {
      'use server'
      const { prisma: p } = await import('@/lib/prisma')
      await p.dbExercise.update({ where: { id }, data: { status: 'draft' } })
    }}>
      <button type="submit" className="border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors w-full">
        ❌ Từ chối
      </button>
    </form>
  )
}
