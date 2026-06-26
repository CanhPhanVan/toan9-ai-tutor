import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exam)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  await prisma.examAttempt.deleteMany({ where: { examId } })
  await prisma.exam.delete({ where: { id: examId } })
  return NextResponse.json({ ok: true })
}
