import { prisma } from '@/lib/prisma'
import StudentsClient from './StudentsClient'

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { submissions: true },
      },
    },
  })

  const studentData = students.map((s: typeof students[0], idx: number) => ({
    id: s.id,
    stt: idx + 1,
    name: s.name || '—',
    email: s.email,
    createdAt: new Date(s.createdAt).toLocaleDateString('vi-VN'),
    submissionCount: s._count.submissions,
  }))

  return (
    <div className="p-8">
      <StudentsClient students={studentData} />
    </div>
  )
}
