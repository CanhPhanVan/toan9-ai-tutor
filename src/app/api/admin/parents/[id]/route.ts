import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? '')) return null
  return session
}

// Link / unlink student
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: parentId } = await params
  const body = await req.json()
  const { studentCode, studentId, action } = body

  if (action === 'unlink') {
    await prisma.parentStudent.deleteMany({ where: { parentId, studentId } })
    return NextResponse.json({ ok: true })
  }

  // Find student by id or studentCode
  let student = null
  if (studentId) {
    student = await prisma.user.findUnique({ where: { id: studentId } })
  } else if (studentCode?.trim()) {
    student = await prisma.user.findUnique({ where: { studentCode: studentCode.trim().toUpperCase() } })
  }
  if (!student || student.role !== 'student')
    return NextResponse.json({ error: 'Không tìm thấy học sinh' }, { status: 404 })

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId, studentId: student.id } },
    create: { parentId, studentId: student.id },
    update: {},
  })
  return NextResponse.json({ student: { id: student.id, name: student.name, studentCode: student.studentCode } })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.parentStudent.deleteMany({ where: { parentId: id } })
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
