import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? '')) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    where: { role: { in: ['admin', 'teacher'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email, password } = await req.json()
  if (!name || !email || !password)
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  if (password.length < 6)
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hashed, role: 'admin' } })
  return NextResponse.json({ id: user.id, name: user.name, role: user.role })
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, name, email, password } = await req.json()
  if (!id) return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })

  if (email && email !== user.email) {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 400 })
  }

  const updateData: Record<string, string> = {}
  if (name?.trim()) updateData.name = name.trim()
  if (email?.trim()) updateData.email = email.trim().toLowerCase()
  if (password?.trim()) updateData.password = await bcrypt.hash(password.trim(), 10)

  await prisma.user.update({ where: { id }, data: updateData })
  return NextResponse.json({ success: true })
}
