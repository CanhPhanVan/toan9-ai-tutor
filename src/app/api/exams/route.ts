import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? undefined
  const exams = await prisma.exam.findMany({
    where: { status: 'published', ...(type ? { type } : {}) },
    select: { id: true, title: true, type: true, duration: true, createdAt: true,
      _count: { select: { attempts: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(exams)
}
