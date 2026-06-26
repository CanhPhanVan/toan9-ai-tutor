'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function NavAuth() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div className="w-20 h-8 bg-gray-100 rounded-xl animate-pulse" />

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors px-3 py-2">
          Đăng nhập
        </Link>
        <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          Đăng ký
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.role === 'parent' && (
        <Link href="/admin" className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-100 transition-colors">
          👑 Quản trị
        </Link>
      )}
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
          {session.user.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-24 truncate">{session.user.name}</span>
      </div>
      <button onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm text-gray-400 hover:text-red-500 transition-colors">
        Đăng xuất
      </button>
    </div>
  )
}
