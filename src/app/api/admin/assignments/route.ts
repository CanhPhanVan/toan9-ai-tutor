import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'parent') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { completions: true } } },
  })

  const studentCount = await prisma.user.count({ where: { role: 'student' } })

  return NextResponse.json({ assignments, studentCount })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { exerciseId, exerciseTitle, topicId, topicName, dueDate, note } = await req.json()
  if (!exerciseId || !exerciseTitle || !topicId)
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })

  const assignment = await prisma.assignment.create({
    data: {
      exerciseId,
      exerciseTitle,
      topicId,
      topicName: topicName ?? '',
      dueDate: dueDate ? new Date(dueDate) : null,
      note: note || null,
    },
  })
  return NextResponse.json(assignment)
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.assignment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
