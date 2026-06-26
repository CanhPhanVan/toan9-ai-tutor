'use client'
import Link from 'next/link'

interface TopicCardProps {
  id: string
  name: string
  icon: string
  description: string
  exerciseCount?: number
  order: number
}

export function TopicCard({ id, name, icon, description, exerciseCount, order }: TopicCardProps) {
  return (
    <Link href={`/lam-bai/${id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 p-5 cursor-pointer border border-gray-100 hover:border-indigo-200 group">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0 w-10 text-center">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Chủ đề {order}</span>
            </div>
            <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm leading-tight">{name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
            {exerciseCount !== undefined && (
              <p className="text-xs text-indigo-400 mt-2 font-medium">{exerciseCount} bài tập</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
