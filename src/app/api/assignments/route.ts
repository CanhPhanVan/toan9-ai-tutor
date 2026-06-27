import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ assignments: [], pending: 0 })

  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      completions: {
        where: { userId: session.user.id },
      },
    },
  })

  const result = assignments.map(a => ({
    id: a.id,
    exerciseId: a.exerciseId,
    exerciseTitle: a.exerciseTitle,
    topicId: a.topicId,
    topicName: a.topicName,
    dueDate: a.dueDate,
    note: a.note,
    createdAt: a.createdAt,
    completed: a.completions.length > 0,
    completedAt: a.completions[0]?.completedAt ?? null,
  }))

  const pending = result.filter(a => !a.completed).length
  return NextResponse.json({ assignments: result, pending })
}
