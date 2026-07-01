import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exam)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  const session = await auth()
  if (!session || !['admin', 'teacher'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { examId } = await params
  await prisma.examAttempt.deleteMany({ where: { examId } })
  await prisma.exam.delete({ where: { id: examId } })
  return NextResponse.json({ ok: true })
}
