import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ assignments: [], pending: 0 })

  const userId = session.user.id

  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      completions: {
        where: { userId },
      },
    },
  })

  // Filter: only assignments where assignedTo === "all" OR userId is in the list
  const visible = assignments.filter(a => {
    if (a.assignedTo === 'all') return true
    try {
      const ids: string[] = JSON.parse(a.assignedTo)
      return ids.includes(userId)
    } catch {
      return false
    }
  })

  const result = visible.map(a => ({
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
