'use client'
import { renderMathContent } from './MathDisplay'

interface MathContentProps {
  text: string
}

export default function MathContent({ text }: MathContentProps) {
  return <>{renderMathContent(text)}</>
}
