'use client'
import Link from 'next/link'
import { renderMathContent } from './MathDisplay'

interface ExerciseCardProps {
  id: string
  title: string
  content: string
  difficulty: string
  topicId: string
  isDone?: boolean
  isCorrect?: boolean | null
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Dễ', color: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  hard: { label: 'Khó', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  advanced: { label: 'Vận dụng cao', color: 'bg-red-100 text-red-700 border-red-200' },
}

export function ExerciseCard({ id, title, content, difficulty, topicId, isDone, isCorrect }: ExerciseCardProps) {
  const config = difficultyConfig[difficulty] ?? difficultyConfig.easy

  return (
    <Link href={`/lam-bai/${topicId}/${id}`}>
      <div className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-5 cursor-pointer border hover:border-indigo-200 group
        ${isDone && isCorrect ? 'border-green-200 bg-green-50/30' : isDone ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'}`}>
        {/* Done status badge */}
        {isDone && (
          <div className="absolute top-3 right-3">
            {isCorrect === true
              ? <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-semibold">✅ Đúng</span>
              : <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full font-semibold">📝 Đã thử</span>
            }
          </div>
        )}
        <div className={`flex items-start gap-3 mb-3 ${isDone ? 'pr-16' : ''}`}>
          <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm flex-1">{title}</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${config.color} ${isDone ? 'hidden' : ''}`}>
            {config.label}
          </span>
        </div>
        <div className="text-sm text-gray-600 line-clamp-3">
          {renderMathContent(content.slice(0, 150))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          {isDone && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.color}`}>{config.label}</span>
          )}
          <span className="text-xs text-indigo-500 font-medium group-hover:text-indigo-700 ml-auto">
            {isDone ? 'Làm lại →' : 'Làm bài →'}
          </span>
        </div>
      </div>
    </Link>
  )
}
