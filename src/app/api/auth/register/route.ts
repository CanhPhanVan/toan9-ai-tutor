import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, adminCode } = await req.json()

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })

    // Parent accounts require a secret admin code
    if (role === 'parent') {
      if (adminCode !== process.env.ADMIN_CODE) {
        return NextResponse.json({ error: 'Mã quản trị không đúng' }, { status: 403 })
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing)
      return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role === 'parent' ? 'admin' : 'student' },
    })

    return NextResponse.json({ id: user.id, name: user.name, role: user.role })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
