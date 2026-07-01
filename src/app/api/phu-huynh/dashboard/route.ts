import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const DAY_NAMES = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'parent')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const period = req.nextUrl.searchParams.get('period') ?? 'week' // 'day' | 'week' | 'month'

  const links = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: { student: { select: { id: true, name: true, studentCode: true } } },
  })

  if (links.length === 0) return NextResponse.json({ students: [], noStudents: true })

  const studentIds = links.map(l => l.studentId)
  const allSubs = await prisma.submission.findMany({
    where: { userId: { in: studentIds } },
    orderBy: { submittedAt: 'desc' },
  })

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // --- Chart data, shaped by selected period ---
  let chartData: { label: string; total: number; correct: number; rate: number }[]
  let rangeStart: Date

  if (period === 'day') {
    // Today, split into 4-hour buckets
    rangeStart = todayStart
    chartData = []
    for (let h = 0; h < 24; h += 4) {
      const bucketStart = new Date(todayStart); bucketStart.setHours(h)
      const bucketEnd = new Date(todayStart); bucketEnd.setHours(h + 4)
      const bucketSubs = allSubs.filter(s => s.submittedAt >= bucketStart && s.submittedAt < bucketEnd)
      const correct = bucketSubs.filter(s => s.isCorrect === true).length
      chartData.push({
        label: `${h}h-${h + 4}h`,
        total: bucketSubs.length,
        correct,
        rate: bucketSubs.length > 0 ? Math.round((correct / bucketSubs.length) * 100) : 0,
      })
    }
  } else if (period === 'month') {
    // Last 4 weeks, weekly buckets
    rangeStart = new Date(todayStart); rangeStart.setDate(todayStart.getDate() - 27)
    chartData = []
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(todayStart); weekStart.setDate(todayStart.getDate() - w * 7 - 6)
      const weekEnd = new Date(todayStart); weekEnd.setDate(todayStart.getDate() - w * 7 + 1)
      const weekSubs = allSubs.filter(s => s.submittedAt >= weekStart && s.submittedAt < weekEnd)
      const correct = weekSubs.filter(s => s.isCorrect === true).length
      chartData.push({
        label: w === 0 ? 'Tuần này' : `${w} tuần trước`,
        total: weekSubs.length,
        correct,
        rate: weekSubs.length > 0 ? Math.round((correct / weekSubs.length) * 100) : 0,
      })
    }
  } else {
    // Last 7 calendar days (default)
    rangeStart = new Date(todayStart); rangeStart.setDate(todayStart.getDate() - 6)
    chartData = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart); dayStart.setDate(todayStart.getDate() - i)
      const dayEnd   = new Date(dayStart);   dayEnd.setDate(dayStart.getDate() + 1)
      const daySubs  = allSubs.filter(s => s.submittedAt >= dayStart && s.submittedAt < dayEnd)
      const correct  = daySubs.filter(s => s.isCorrect === true).length
      chartData.push({
        label: i === 0 ? 'Hôm nay' : DAY_NAMES[dayStart.getDay()],
        total: daySubs.length,
        correct,
        rate: daySubs.length > 0 ? Math.round((correct / daySubs.length) * 100) : 0,
      })
    }
  }

  // --- Stats scoped to the selected period ---
  const periodSubs = allSubs.filter(s => s.submittedAt >= rangeStart)

  // --- Donut stats ---
  const total   = periodSubs.length
  const correct = periodSubs.filter(s => s.isCorrect === true).length
  const wrong   = periodSubs.filter(s => s.isCorrect === false).length
  const withAI  = periodSubs.filter(s => s.aiHelpCount > 0).length
  const viewedSolution = periodSubs.filter(s => s.aiHelpCount >= 3).length
  const overallRate = total > 0 ? Math.round((correct / total) * 100) : 0

  // --- Topic stats with last-wrong title as hint ---
  const topicMap: Record<string, { total: number; wrong: number; lastWrongTitle: string }> = {}
  for (const s of periodSubs) {
    const topic = s.topicName ?? 'Khác'
    if (!topicMap[topic]) topicMap[topic] = { total: 0, wrong: 0, lastWrongTitle: '' }
    topicMap[topic].total++
    if (s.isCorrect === false) {
      topicMap[topic].wrong++
      if (!topicMap[topic].lastWrongTitle) topicMap[topic].lastWrongTitle = s.exerciseTitle ?? ''
    }
  }
  const topWrongTopics = Object.entries(topicMap)
    .filter(([, v]) => v.wrong > 0)
    .map(([topic, v]) => ({
      topic,
      total: v.total,
      wrong: v.wrong,
      wrongRate: Math.round((v.wrong / v.total) * 100),
      lastWrongTitle: v.lastWrongTitle,
    }))
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 5)

  // --- Recent 10 for "Bài tự làm gần đây" (right panel) ---
  const recentSelf = allSubs
    .filter(s => s.score != null)
    .slice(0, 10)
    .map(s => ({
      id: s.id,
      exerciseTitle: s.exerciseTitle ?? s.exerciseId,
      topicName: s.topicName ?? '',
      score: s.score,
      submittedAt: s.submittedAt,
    }))

  // --- Full history (last 50) ---
  const history = allSubs.slice(0, 50).map(s => {
    let howDone: string
    if (s.aiHelpCount === 0) howDone = 'self'
    else if (s.aiHelpCount >= 3) howDone = 'solution'
    else howDone = `ai${s.aiHelpCount}`
    return {
      id: s.id,
      submittedAt: s.submittedAt,
      exerciseTitle: s.exerciseTitle ?? s.exerciseId,
      topicName: s.topicName ?? '',
      score: s.score,
      isCorrect: s.isCorrect,
      aiHelpCount: s.aiHelpCount,
      howDone,
      studentName: links.find(l => l.studentId === s.userId)?.student.name ?? '',
    }
  })

  return NextResponse.json({
    students: links.map(l => l.student),
    parentName: session.user.name,
    period,
    weekdayData: chartData,
    donut: { total, correct, wrong, withAI, viewedSolution, overallRate },
    topWrongTopics,
    recentSelf,
    history,
  })
}
