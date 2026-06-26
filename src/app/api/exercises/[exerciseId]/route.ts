import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params
  try {
    const exercise = await prisma.dbExercise.findUnique({ where: { id: exerciseId } })
    if (!exercise) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(exercise)
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
