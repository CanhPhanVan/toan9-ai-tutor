import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protect admin — parent only
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url))
    }
    if (!['admin', 'teacher'].includes(session.user.role ?? '')) {
      return NextResponse.redirect(new URL('/?error=forbidden', req.url))
    }
  }

  // Protect parent dashboard
  if (pathname.startsWith('/phu-huynh')) {
    if (!session) return NextResponse.redirect(new URL('/login?callbackUrl=/phu-huynh', req.url))
    if (session.user.role !== 'parent') return NextResponse.redirect(new URL('/?error=forbidden', req.url))
  }

  // Protect student pages — any logged-in user
  if (pathname.startsWith('/lam-bai') || pathname.startsWith('/ly-thuyet') || pathname.startsWith('/kiem-tra')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/phu-huynh/:path*', '/lam-bai/:path*', '/ly-thuyet/:path*', '/kiem-tra/:path*'],
}
