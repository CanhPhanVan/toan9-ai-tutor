'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function AssignmentBanner() {
  const [pending, setPending] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/assignments')
      .then(r => r.json())
      .then(d => setPending(d.pending ?? 0))
      .catch(() => {})
  }, [])

  if (pending === 0 || dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📋</span>
          <div>
            <span className="font-semibold text-amber-800 text-sm">
              Bạn có {pending} bài tập bắt buộc chưa hoàn thành!
            </span>
            <span className="text-amber-600 text-sm ml-2">Giáo viên đã giao bài, hãy hoàn thành sớm nhé.</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/bai-tap-giao"
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
          >
            Xem bài được giao →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 text-lg leading-none p-1"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
