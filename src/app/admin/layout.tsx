import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'

const NAV = [
  { href: '/admin',           label: 'Tổng quan',            icon: '📊' },
  { href: '/admin/students',  label: 'Học sinh',             icon: '👩‍🎓' },
  { href: '/admin/topics',    label: 'Quản lý chủ đề',       icon: '📚' },
  { href: '/admin/exercises', label: 'Quản lý bài tập',      icon: '✏️' },
  { href: '/admin/upload',    label: 'Upload hàng loạt',     icon: '📤' },
  { href: '/admin/generate',  label: 'Tạo bài tập AI',       icon: '⚡' },
  { href: '/admin/exams',     label: 'Quản lý đề thi',       icon: '📋' },
  { href: '/admin/review',    label: 'Kiểm duyệt AI',        icon: '🔍' },
  { href: '/admin/stats',     label: 'Thống kê lỗi sai',     icon: '📉' },
  { href: '/admin/history',   label: 'Lịch sử học sinh',     icon: '🗓️' },
  { href: '/admin/users',     label: 'Quản trị viên',        icon: '👤' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'parent') redirect('/login?callbackUrl=/admin')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">T9</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Toán 9 Admin</p>
              <p className="text-xs text-gray-400 truncate">{session.user.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <span>🏠</span><span>Trang học sinh</span>
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
