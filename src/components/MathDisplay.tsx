'use client'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface MathDisplayProps {
  formula: string
  block?: boolean
}

export function MathDisplay({ formula, block = false }: MathDisplayProps) {
  if (!formula) return null

  try {
    if (block) {
      return (
        <div className="overflow-x-auto py-2">
          <BlockMath math={formula} />
        </div>
      )
    }
    if (formula.includes('$')) {
      const parts = formula.split(/(\$[^$]+\$)/g)
      return (
        <span>
          {parts.map((part, i) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              const math = part.slice(1, -1)
              try {
                return <InlineMath key={i} math={math} />
              } catch {
                return <span key={i} className="font-mono">{part}</span>
              }
            }
            return <span key={i}>{part}</span>
          })}
        </span>
      )
    }
    return <InlineMath math={formula} />
  } catch {
    return <span className="font-mono text-gray-800">{formula}</span>
  }
}

export function renderMathContent(content: string): React.ReactNode[] {
  // Split by display math $$...$$
  const blockParts = content.split(/(\$\$[\s\S]+?\$\$)/g)
  return blockParts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const math = part.slice(2, -2)
      try {
        return (
          <div key={i} className="overflow-x-auto py-2">
            <BlockMath math={math} />
          </div>
        )
      } catch {
        return <span key={i} className="font-mono">{part}</span>
      }
    }
    // Handle inline math $...$
    const inlineParts = part.split(/(\$[^$]+\$)/g)
    return (
      <span key={i}>
        {inlineParts.map((inlinePart, j) => {
          if (inlinePart.startsWith('$') && inlinePart.endsWith('$')) {
            const math = inlinePart.slice(1, -1)
            try {
              return <InlineMath key={j} math={math} />
            } catch {
              return <span key={j} className="font-mono">{inlinePart}</span>
            }
          }
          return <span key={j}>{inlinePart}</span>
        })}
      </span>
    )
  })
}
