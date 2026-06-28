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

  const parents = await prisma.user.findMany({
    where: { role: 'parent' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, createdAt: true,
      childrenOf: {
        select: {
          student: { select: { id: true, name: true, studentCode: true } }
        }
      }
    },
  })
  return NextResponse.json({ parents })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, username, password, studentCode, studentId } = await req.json()
  if (!name || !username || !password)
    return NextResponse.json({ error: 'Thiếu tên, tên đăng nhập hoặc mật khẩu' }, { status: 400 })
  if (password.length < 6)
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })

  const email = username.includes('@') ? username : `${username}@parent.school`
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 409 })

  // Find student by id (preferred) or studentCode
  let student = null
  if (studentId) {
    student = await prisma.user.findUnique({ where: { id: studentId } })
  } else if (studentCode?.trim()) {
    student = await prisma.user.findUnique({ where: { studentCode: studentCode.trim().toUpperCase() } })
  }
  if (student && student.role !== 'student') student = null

  const hashed = await bcrypt.hash(password, 10)
  const parent = await prisma.user.create({
    data: { name, email, password: hashed, role: 'parent' },
  })

  if (student) {
    await prisma.parentStudent.create({
      data: { parentId: parent.id, studentId: student.id },
    })
  }

  return NextResponse.json({ id: parent.id, name: parent.name, email: parent.email })
}
