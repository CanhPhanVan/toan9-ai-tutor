import type { NextAuthConfig } from 'next-auth'

// Lightweight config for middleware — no DB imports
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.role = (user as { role?: string }).role; token.id = user.id }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      session.user.id = token.id as string
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}
