'use client'
import Link from 'next/link'
import { renderMathContent } from './MathDisplay'

interface ExerciseCardProps {
  id: string
  title: string
  content: string
  difficulty: string
  topicId: string
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Dễ', color: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  hard: { label: 'Khó', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  advanced: { label: 'Vận dụng cao', color: 'bg-red-100 text-red-700 border-red-200' },
}

export function ExerciseCard({ id, title, content, difficulty, topicId }: ExerciseCardProps) {
  const config = difficultyConfig[difficulty] ?? difficultyConfig.easy

  return (
    <Link href={`/lam-bai/${topicId}/${id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-5 cursor-pointer border border-gray-100 hover:border-indigo-200 group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm">{title}</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="text-sm text-gray-600 line-clamp-3">
          {renderMathContent(content.slice(0, 150))}
        </div>
        <div className="mt-3 flex items-center justify-end">
          <span className="text-xs text-indigo-500 font-medium group-hover:text-indigo-700">Làm bài →</span>
        </div>
      </div>
    </Link>
  )
}
