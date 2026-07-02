import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TOPICS, DIFFICULTIES } from '@/lib/topics'
import { EXERCISES } from '@/lib/exercises'
import { ExerciseCard } from '@/components/ExerciseCard'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const topic = TOPICS.find(t => t.id === topicId)
  if (!topic) notFound()

  const staticExercises = EXERCISES.filter(e => e.topicId === topicId)

  const [dbExercises, session] = await Promise.all([
    prisma.dbExercise.findMany({
      where: { topicId, status: 'published' },
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, content: true, difficulty: true, topicId: true },
    }),
    auth(),
  ])

  // Fetch submission status for logged-in student (take best result per exercise)
  const submissionMap = new Map<string, { isCorrect: boolean | null }>()
  if (session?.user?.id) {
    const subs = await prisma.submission.findMany({
      where: { userId: session.user.id, topicId },
      select: { exerciseId: true, isCorrect: true },
      orderBy: { submittedAt: 'desc' },
    })
    for (const s of subs) {
      const existing = submissionMap.get(s.exerciseId)
      if (!existing || (!existing.isCorrect && s.isCorrect)) {
        submissionMap.set(s.exerciseId, { isCorrect: s.isCorrect ?? null })
      }
    }
  }

  // Gộp: static trước, DB sau, nhóm theo difficulty
  const allExercises = [
    ...staticExercises.map(e => ({ id: e.id, title: e.title, content: e.content, difficulty: e.difficulty, topicId: e.topicId })),
    ...dbExercises,
  ]

  const doneCount = submissionMap.size
  const correctCount = [...submissionMap.values()].filter(s => s.isCorrect).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-indigo-600 text-sm transition-colors" title="Trang chủ">🏠</Link>
          <span className="text-gray-200">|</span>
          <Link href="/lam-bai" className="text-gray-500 hover:text-gray-700 text-sm">← Chủ đề</Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-gray-800">{topic.name}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{topic.icon}</span>
            <h2 className="text-2xl font-bold text-gray-900">{topic.name}</h2>
          </div>
          <p className="text-gray-600">{topic.description}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <p className="text-sm text-indigo-500 font-medium">{allExercises.length} bài tập</p>
            {doneCount > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-green-600 font-medium">✅ {correctCount} đúng</span>
                {doneCount > correctCount && (
                  <span className="text-sm text-orange-500 font-medium">📝 {doneCount - correctCount} đã thử</span>
                )}
                <span className="text-sm text-gray-400">{allExercises.length - doneCount} chưa làm</span>
              </>
            )}
          </div>
          {doneCount > 0 && (
            <div className="mt-3 bg-gray-100 rounded-full h-2 max-w-sm overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.round((correctCount / allExercises.length) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {DIFFICULTIES.map(diff => {
          const exercises = allExercises.filter(e => e.difficulty === diff.id)
          if (exercises.length === 0) return null
          return (
            <div key={diff.id} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">{diff.name}</h3>
                <span className="text-sm text-gray-500">{diff.description}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{exercises.length} bài</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {exercises.map(ex => (
                  <ExerciseCard
                    key={ex.id}
                    id={ex.id}
                    title={ex.title}
                    content={ex.content}
                    difficulty={ex.difficulty}
                    topicId={topicId}
                    isDone={submissionMap.has(ex.id)}
                    isCorrect={submissionMap.get(ex.id)?.isCorrect ?? null}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {allExercises.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">📝</p>
            <p>Chưa có bài tập cho chủ đề này</p>
          </div>
        )}
      </main>
    </div>
  )
}
