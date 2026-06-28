'use client'
import { useState, useEffect } from 'react'

interface Student { id: string; name: string; studentCode: string | null }
interface Parent {
  id: string
  name: string
  email: string
  createdAt: string
  childrenOf: { student: Student }[]
}

export default function AdminParentsPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Create form
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Link student
  const [linkParentId, setLinkParentId] = useState<string | null>(null)
  const [linkStudentId, setLinkStudentId] = useState('')
  const [linking, setLinking] = useState(false)

  const load = async () => {
    setLoading(true)
    const [pRes, sRes] = await Promise.all([
      fetch('/api/admin/parents'),
      fetch('/api/admin/students'),
    ])
    const [pData, sData] = await Promise.all([pRes.json(), sRes.json()])
    setParents(pData.parents ?? [])
    const arr: Student[] = Array.isArray(sData) ? sData : (sData.students ?? [])
    setStudents(arr.filter(s => s.studentCode))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    const selected = students.find(s => s.id === selectedStudentId)
    const res = await fetch('/api/admin/parents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password, studentCode: selected?.studentCode ?? '' }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setCreateError(data.error); return }
    setName(''); setUsername(''); setPassword(''); setSelectedStudentId('')
    load()
  }

  const handleDelete = async (id: string, parentName: string) => {
    if (!confirm(`Xóa tài khoản phụ huynh "${parentName}"?`)) return
    await fetch(`/api/admin/parents/${id}`, { method: 'DELETE' })
    load()
  }

  const handleLink = async (parentId: string) => {
    if (!linkStudentId) return
    const selected = students.find(s => s.id === linkStudentId)
    if (!selected) return
    setLinking(true)
    const res = await fetch(`/api/admin/parents/${parentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentCode: selected.studentCode, action: 'link' }),
    })
    const data = await res.json()
    setLinking(false)
    if (!res.ok) { alert(data.error); return }
    setLinkParentId(null); setLinkStudentId('')
    load()
  }

  // Students not yet linked to the parent being edited
  const availableStudents = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId)
    const linkedIds = new Set(parent?.childrenOf.map(c => c.student.id) ?? [])
    return students.filter(s => !linkedIds.has(s.id))
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👨‍👩‍👧 Quản lý phụ huynh</h1>
        <p className="text-gray-500 text-sm mt-1">Tạo tài khoản phụ huynh và gán học sinh</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">➕ Tạo tài khoản phụ huynh mới</h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Họ tên phụ huynh *</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Nguyễn Văn A"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Tên đăng nhập *</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required placeholder="nguyenvana"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Mật khẩu *</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="tối thiểu 6 ký tự"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Gán học sinh (tuỳ chọn)</label>
            <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="">-- Chọn học sinh --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentCode} · {s.name}
                </option>
              ))}
            </select>
          </div>
          {createError && (
            <div className="sm:col-span-2 bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl border border-red-200">
              ❌ {createError}
            </div>
          )}
          <div className="sm:col-span-2">
            <button type="submit" disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              {creating ? 'Đang tạo...' : '➕ Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>

      {/* Parents list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Danh sách phụ huynh ({parents.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải...</div>
        ) : parents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Chưa có phụ huynh nào</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {parents.map(p => (
              <div key={p.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{p.name}</span>
                      <span className="text-xs text-gray-400">{p.email.replace('@parent.school', '')}</span>
                    </div>
                    {/* Linked students */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.childrenOf.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Chưa gán học sinh</span>
                      ) : p.childrenOf.map(({ student: s }) => (
                        <span key={s.id} className="text-xs bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full font-medium">
                          🎓 {s.name} · {s.studentCode}
                        </span>
                      ))}
                      <button onClick={() => { setLinkParentId(p.id); setLinkStudentId('') }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 bg-indigo-50 px-2.5 py-1 rounded-full font-medium transition-colors">
                        + Gán thêm HS
                      </button>
                    </div>

                    {/* Link dropdown */}
                    {linkParentId === p.id && (
                      <div className="flex items-center gap-2 mt-3">
                        <select
                          value={linkStudentId}
                          onChange={e => setLinkStudentId(e.target.value)}
                          className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                          autoFocus
                        >
                          <option value="">-- Chọn học sinh --</option>
                          {availableStudents(p.id).map(s => (
                            <option key={s.id} value={s.id}>
                              {s.studentCode} · {s.name}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => handleLink(p.id)} disabled={linking || !linkStudentId}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
                          {linking ? '...' : 'Gán'}
                        </button>
                        <button onClick={() => setLinkParentId(null)}
                          className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1.5">Hủy</button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(p.id, p.name)}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
