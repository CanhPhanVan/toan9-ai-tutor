'use client'
import { renderMathContent } from './MathDisplay'

// Compact math-rendered content preview for table rows.
// KaTeX size is scaled down to text-xs; display math margins are collapsed.
export default function MathPreview({ content, className = '' }: { content: string; className?: string }) {
  return (
    <div
      className={`text-xs text-gray-400 leading-snug overflow-hidden max-h-10 ${className}`}
      style={{ fontSize: '0.72rem' }}
    >
      {renderMathContent(content)}
    </div>
  )
}
