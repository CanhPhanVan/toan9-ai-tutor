import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TOPICS } from '@/lib/topics'
import { THEORY } from '@/lib/theory'
import MathContent from '@/components/MathContent'

interface Props {
  params: Promise<{ topicId: string }>
}

export async function generateStaticParams() {
  return TOPICS.map((t) => ({ topicId: t.id }))
}

export default async function LyThuyetTopicPage({ params }: Props) {
  const { topicId } = await params

  const topic = TOPICS.find((t) => t.id === topicId)
  const theory = THEORY.find((t) => t.topicId === topicId)

  if (!topic || !theory) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Trang chủ</Link>
          <span className="text-gray-300">|</span>
          <Link href="/ly-thuyet" className="text-gray-500 hover:text-gray-700 text-sm">Lý thuyết</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 text-sm font-medium">{topic.name}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{topic.icon}</span>
            <div>
              <div className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-1">
                Chủ đề {topic.order}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
              <p className="text-gray-500 mt-1">{topic.description}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Tóm tắt lý thuyết</h2>
          <ul className="space-y-2">
            {theory.summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                <span className="text-gray-700 text-sm leading-relaxed">
                  <MathContent text={point} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Formulas */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📐 Công thức cần nhớ</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {theory.formulas.map((f, i) => (
              <div key={i} className="border border-indigo-100 rounded-xl bg-indigo-50 p-4">
                <div className="text-xs text-indigo-500 font-semibold mb-1">
                  <MathContent text={f.name} />
                </div>
                <div className="font-mono text-sm bg-white rounded-lg px-3 py-2 border border-indigo-100 text-gray-700 mb-2 overflow-x-auto">
                  <MathContent text={f.formula} />
                </div>
                <div className="text-xs text-gray-500 italic">{f.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Examples */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">✏️ Ví dụ minh họa</h2>
          <div className="space-y-6">
            {theory.examples.map((ex, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Problem */}
                <div className="bg-amber-50 border-b border-amber-100 p-4">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Ví dụ {i + 1}</span>
                  <div className="mt-1 text-gray-800 font-medium text-sm leading-relaxed">
                    <MathContent text={ex.problem} />
                  </div>
                </div>
                {/* Solution */}
                <div className="p-4">
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Lời giải</div>
                  <ol className="space-y-1">
                    {ex.solution.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-gray-400 text-xs mt-0.5 flex-shrink-0 font-mono">{j + 1}.</span>
                        <span className="text-sm text-gray-700 leading-relaxed">
                          <MathContent text={step} />
                        </span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600">Kết quả:</span>
                    <span className="text-sm text-indigo-700 font-medium">
                      <MathContent text={ex.solution.answer} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">⚠️ Lỗi thường gặp</h2>
          <ul className="space-y-3">
            {theory.commonMistakes.map((mistake, i) => (
              <li key={i} className="flex items-start gap-3 bg-red-50 rounded-xl p-3">
                <span className="text-red-400 font-bold flex-shrink-0">✕</span>
                <span className="text-sm text-red-700 leading-relaxed">
                  <MathContent text={mistake} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/lam-bai/${topicId}`}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-colors shadow-sm"
          >
            Làm bài tập chủ đề này →
          </Link>
          <Link
            href="/ly-thuyet"
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl text-center transition-colors border border-gray-200"
          >
            ← Xem chủ đề khác
          </Link>
        </div>
      </main>
    </div>
  )
}
