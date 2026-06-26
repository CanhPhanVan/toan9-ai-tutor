'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'

type Student = {
  id: string
  stt: number
  name: string
  email: string
  createdAt: string
  submissionCount: number
}

type Props = {
  students: Student[]
}

export default function StudentsClient({ students }: Props) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [tab, setTab] = useState<'manual' | 'excel'>('manual')

  // Manual form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [manualMsg, setManualMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [manualLoading, setManualLoading] = useState(false)

  // Excel state
  const [excelProgress, setExcelProgress] = useState<{ done: number; total: number } | null>(null)
  const [excelMsg, setExcelMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Edit state
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editMsg, setEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  function openEdit(s: Student) {
    setEditStudent(s)
    setEditName(s.name === '—' ? '' : s.name)
    setEditEmail(s.email)
    setEditPassword('')
    setEditMsg(null)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editStudent) return
    setEditMsg(null)
    setEditLoading(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editStudent.id, name: editName, email: editEmail, password: editPassword || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật')
      setEditMsg({ type: 'success', text: 'Cập nhật thành công!' })
      router.refresh()
    } catch (err) {
      setEditMsg({ type: 'error', text: err instanceof Error ? err.message : 'Lỗi' })
    } finally {
      setEditLoading(false)
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    setManualMsg(null)
    if (password !== confirmPassword) {
      setManualMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' })
      return
    }
    setManualLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'student' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Lỗi tạo tài khoản')
      setManualMsg({ type: 'success', text: `Đã tạo học sinh "${name}" thành công!` })
      setName(''); setEmail(''); setPassword(''); setConfirmPassword('')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      setManualMsg({ type: 'error', text: message })
    } finally {
      setManualLoading(false)
    }
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setExcelMsg(null)
    setExcelProgress(null)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<{ 'Họ tên': string; Email: string; 'Mật khẩu': string }>(sheet)

        if (rows.length === 0) {
          setExcelMsg({ type: 'error', text: 'File không có dữ liệu hợp lệ' })
          return
        }

        let done = 0
        const total = rows.length
        setExcelProgress({ done: 0, total })

        for (const row of rows) {
          try {
            await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: row['Họ tên'],
                email: row['Email'],
                password: row['Mật khẩu'],
                role: 'student',
              }),
            })
          } catch {
            // continue on individual row error
          }
          done++
          setExcelProgress({ done, total })
        }

        setExcelMsg({ type: 'success', text: `Đã xử lý ${total} học sinh từ file Excel` })
        router.refresh()
      } catch {
        setExcelMsg({ type: 'error', text: 'Không thể đọc file. Vui lòng kiểm tra định dạng.' })
      }
    }
    reader.readAsArrayBuffer(file)
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Họ tên', 'Email', 'Mật khẩu'],
      ['Nguyễn Văn An', 'an@example.com', 'matkhau123'],
      ['Trần Thị Bình', 'binh@example.com', 'matkhau456'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Học sinh')
    XLSX.writeFile(wb, 'mau_them_hoc_sinh.xlsx')
  }

  async function handleDelete(id: string, studentName: string) {
    if (!confirm(`Bạn có chắc muốn xóa học sinh "${studentName}"?`)) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Không thể xóa học sinh')
      } else {
        router.refresh()
      }
    } catch {
      alert('Đã xảy ra lỗi khi xóa')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý học sinh</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {students.length} học sinh</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            📥 Tải mẫu Excel
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            ➕ Thêm học sinh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">STT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Số bài đã làm</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  Chưa có học sinh nào
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-medium">{student.stt}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.email}</td>
                  <td className="px-4 py-3 text-gray-500">{student.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm">
                      {student.submissionCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(student)}
                        className="px-3 py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(student.id, student.name)}
                        disabled={deletingId === student.id}
                        className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === student.id ? '...' : '🗑️ Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Sửa thông tin học sinh</h2>
              <button onClick={() => setEditStudent(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới <span className="text-gray-400 font-normal">(để trống nếu không đổi)</span>
                </label>
                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>

              {editMsg && (
                <p className={`text-sm rounded-xl px-3 py-2 ${editMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {editMsg.text}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditStudent(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Thêm học sinh</h2>
              <button
                onClick={() => { setShowAddForm(false); setManualMsg(null); setExcelMsg(null); setExcelProgress(null) }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'manual' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setTab('manual')}
              >
                Nhập thủ công
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'excel' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setTab('excel')}
              >
                Import Excel
              </button>
            </div>

            <div className="p-6">
              {tab === 'manual' ? (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="an@example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  {manualMsg && (
                    <p className={`text-sm rounded-xl px-3 py-2 ${manualMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {manualMsg.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={manualLoading}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {manualLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Tải lên file .xlsx hoặc .csv với các cột: <strong>Họ tên</strong>, <strong>Email</strong>, <strong>Mật khẩu</strong>
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    📥 Tải file mẫu
                  </button>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn file</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={handleExcelUpload}
                      className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                    />
                  </div>

                  {excelProgress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Đang xử lý...</span>
                        <span>Đã tạo {excelProgress.done}/{excelProgress.total} học sinh</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${(excelProgress.done / excelProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {excelMsg && (
                    <p className={`text-sm rounded-xl px-3 py-2 ${excelMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {excelMsg.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
