require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function migrate() {
  // 1. Rename role 'parent' (old admin) -> 'admin'
  const renamed = await prisma.user.updateMany({ where: { role: 'parent' }, data: { role: 'admin' } })
  console.log('Renamed admin users:', renamed.count)

  // 2. Generate studentCode for existing students
  const students = await prisma.user.findMany({ where: { role: 'student', studentCode: null } })
  for (let i = 0; i < students.length; i++) {
    const code = 'HS9-' + String(i + 1).padStart(4, '0')
    try {
      await prisma.user.update({ where: { id: students[i].id }, data: { studentCode: code } })
    } catch (_) {}
  }
  console.log('Generated student codes:', students.length)

  // 3. Create demo parent account (role = 'parent' = phụ huynh)
  const existing = await prisma.user.findFirst({ where: { email: 'parent@school.vn' } })
  if (!existing) {
    const hashed = await bcrypt.hash('parent123', 10)
    await prisma.user.create({ data: { name: 'Phụ huynh Demo', email: 'parent@school.vn', password: hashed, role: 'parent' } })
    console.log('Created demo parent: parent / parent123')
  } else {
    console.log('Demo parent already exists:', existing.email)
  }

  await prisma.$disconnect()
}

migrate().catch(e => { console.error(e); process.exit(1) })
