'use client'
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
      <span>🚪</span><span>Đăng xuất</span>
    </button>
  )
}
