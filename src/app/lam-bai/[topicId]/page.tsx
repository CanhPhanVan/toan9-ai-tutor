import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TOPICS, DIFFICULTIES } from '@/lib/topics'
import { EXERCISES } from '@/lib/exercises'
import { ExerciseCard } from '@/components/ExerciseCard'
import { prisma } from '@/lib/prisma'

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const topic = TOPICS.find(t => t.id === topicId)
  if (!topic) notFound()

  const staticExercises = EXERCISES.filter(e => e.topicId === topicId)

  const dbExercises = await prisma.dbExercise.findMany({
    where: { topicId, status: 'approved' },
    orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, title: true, content: true, difficulty: true, topicId: true },
  })

  // Gộp: static trước, DB sau, nhóm theo difficulty
  const allExercises = [
    ...staticExercises.map(e => ({ id: e.id, title: e.title, content: e.content, difficulty: e.difficulty, topicId: e.topicId })),
    ...dbExercises,
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
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
          <p className="text-sm text-indigo-500 mt-1 font-medium">{allExercises.length} bài tập</p>
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
