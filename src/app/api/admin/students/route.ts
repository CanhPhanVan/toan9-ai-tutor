import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    })
    return NextResponse.json(students)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Không thể lấy danh sách học sinh' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, password } = await request.json()
    if (!id) return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user || user.role !== 'student')
      return NextResponse.json({ error: 'Không tìm thấy học sinh' }, { status: 404 })

    // Kiểm tra email trùng (nếu đổi email)
    if (email && email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 400 })
    }

    const updateData: Record<string, string> = {}
    if (name?.trim()) updateData.name = name.trim()
    if (email?.trim()) updateData.email = email.trim().toLowerCase()
    if (password?.trim()) updateData.password = await bcrypt.hash(password.trim(), 10)

    await prisma.user.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Không thể cập nhật học sinh' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID học sinh' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy học sinh' }, { status: 404 })
    }
    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Chỉ có thể xóa tài khoản học sinh' }, { status: 403 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Không thể xóa học sinh' }, { status: 500 })
  }
}
