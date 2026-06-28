import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'parent')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get linked students
  const links = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: { student: { select: { id: true, name: true, studentCode: true } } },
  })

  if (links.length === 0) return NextResponse.json({ students: [], noStudents: true })

  const studentIds = links.map(l => l.studentId)

  // Fetch all submissions for these students
  const allSubs = await prisma.submission.findMany({
    where: { userId: { in: studentIds } },
    orderBy: { submittedAt: 'desc' },
  })

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart); weekStart.setDate(todayStart.getDate() - todayStart.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(weekStart.getDate() - 7)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(monthStart)

  function periodStats(subs: typeof allSubs, from: Date, to?: Date) {
    const filtered = subs.filter(s => s.submittedAt >= from && (!to || s.submittedAt < to))
    const total = filtered.length
    const correct = filtered.filter(s => s.isCorrect === true).length
    return { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 }
  }

  const todaySubs   = allSubs.filter(s => s.submittedAt >= todayStart)
  const weekSubs    = allSubs.filter(s => s.submittedAt >= weekStart)
  const monthSubs   = allSubs.filter(s => s.submittedAt >= monthStart)
  const prevWeek    = periodStats(allSubs, prevWeekStart, weekStart)
  const prevMonth   = periodStats(allSubs, prevMonthStart, prevMonthEnd)

  // Wrong topics count
  const wrongByTopic: Record<string, number> = {}
  for (const s of allSubs.filter(s => s.isCorrect === false)) {
    const topic = s.topicName ?? s.topicId ?? 'Khác'
    wrongByTopic[topic] = (wrongByTopic[topic] ?? 0) + 1
  }
  const topWrongTopics = Object.entries(wrongByTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }))

  // AI usage
  const withAI = allSubs.filter(s => s.aiHelpCount > 0).length
  const fullAI  = allSubs.filter(s => s.aiHelpCount >= 3).length

  // Daily accuracy for chart (last 14 days)
  const dailyData: { date: string; total: number; correct: number; rate: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const dayStart = new Date(todayStart); dayStart.setDate(todayStart.getDate() - i)
    const dayEnd   = new Date(dayStart);   dayEnd.setDate(dayStart.getDate() + 1)
    const daySubs  = allSubs.filter(s => s.submittedAt >= dayStart && s.submittedAt < dayEnd)
    const correct  = daySubs.filter(s => s.isCorrect === true).length
    dailyData.push({
      date: dayStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      total: daySubs.length,
      correct,
      rate: daySubs.length > 0 ? Math.round((correct / daySubs.length) * 100) : 0,
    })
  }

  // Recent submissions (last 20)
  const recentSubs = allSubs.slice(0, 20).map(s => ({
    id: s.id,
    exerciseTitle: s.exerciseTitle ?? s.exerciseId,
    topicName: s.topicName ?? 'Chưa phân loại',
    isCorrect: s.isCorrect,
    score: s.score,
    aiHelpCount: s.aiHelpCount,
    submittedAt: s.submittedAt,
    studentName: links.find(l => l.studentId === s.userId)?.student.name ?? '',
  }))

  return NextResponse.json({
    students: links.map(l => l.student),
    today: {
      hasDone: todaySubs.length > 0,
      count: todaySubs.length,
      correct: todaySubs.filter(s => s.isCorrect === true).length,
      rate: todaySubs.length > 0 ? Math.round((todaySubs.filter(s => s.isCorrect === true).length / todaySubs.length) * 100) : 0,
    },
    overall: {
      total: allSubs.length,
      correct: allSubs.filter(s => s.isCorrect === true).length,
      rate: allSubs.length > 0 ? Math.round((allSubs.filter(s => s.isCorrect === true).length / allSubs.length) * 100) : 0,
    },
    week:      { ...periodStats(allSubs, weekStart),  prevRate: prevWeek.rate  },
    month:     { ...periodStats(allSubs, monthStart), prevRate: prevMonth.rate },
    topWrongTopics,
    aiStats: {
      total: allSubs.length,
      withAI,
      fullAI,
      rateWithAI: allSubs.length > 0 ? Math.round((withAI  / allSubs.length) * 100) : 0,
      rateFullAI: allSubs.length > 0 ? Math.round((fullAI   / allSubs.length) * 100) : 0,
    },
    dailyData,
    recentSubs,
  })
}
