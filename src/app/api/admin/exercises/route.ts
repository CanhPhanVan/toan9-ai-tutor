import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'parent')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const exercises = await prisma.dbExercise.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ exercises })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'parent')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, topicId, topicName, difficulty, method, solution, hints } = body

  if (!title || !content || !topicId)
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })

  const exercise = await prisma.dbExercise.create({
    data: { title, content, topicId, topicName: topicName ?? '', difficulty: difficulty ?? 'medium', method, solution, hints: hints ?? '[]' },
  })
  return NextResponse.json(exercise)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'parent')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.dbExercise.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
