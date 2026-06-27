import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { assignmentId } = await req.json()
  if (!assignmentId) return NextResponse.json({ error: 'Thiếu assignmentId' }, { status: 400 })

  await prisma.assignmentCompletion.upsert({
    where: { assignmentId_userId: { assignmentId, userId: session.user.id } },
    create: { assignmentId, userId: session.user.id },
    update: { completedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
