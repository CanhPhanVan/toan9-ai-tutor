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
  const [loading, setLoading] = useState(true)

  // Create form
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Link student
  const [linkParentId, setLinkParentId] = useState<string | null>(null)
  const [linkCode, setLinkCode] = useState('')
  const [linking, setLinking] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/parents')
    const data = await res.json()
    setParents(data.parents ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    const res = await fetch('/api/admin/parents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password, studentCode }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setCreateError(data.error); return }
    setName(''); setUsername(''); setPassword(''); setStudentCode('')
    load()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa tài khoản phụ huynh "${name}"?`)) return
    await fetch(`/api/admin/parents/${id}`, { method: 'DELETE' })
    load()
  }

  const handleLink = async (parentId: string) => {
    if (!linkCode.trim()) return
    setLinking(true)
    const res = await fetch(`/api/admin/parents/${parentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentCode: linkCode, action: 'link' }),
    })
    const data = await res.json()
    setLinking(false)
    if (!res.ok) { alert(data.error); return }
    setLinkParentId(null); setLinkCode('')
    load()
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
            <label className="text-xs font-medium text-gray-500 block mb-1">Mã học sinh (HS9-XXXX)</label>
            <input value={studentCode} onChange={e => setStudentCode(e.target.value)} placeholder="HS9-0001 (tuỳ chọn)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 uppercase" />
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
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
                      <button onClick={() => { setLinkParentId(p.id); setLinkCode('') }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 bg-indigo-50 px-2.5 py-1 rounded-full font-medium transition-colors">
                        + Gán HS
                      </button>
                    </div>

                    {/* Link input */}
                    {linkParentId === p.id && (
                      <div className="flex items-center gap-2 mt-3">
                        <input
                          value={linkCode}
                          onChange={e => setLinkCode(e.target.value.toUpperCase())}
                          placeholder="HS9-0001"
                          onKeyDown={e => e.key === 'Enter' && handleLink(p.id)}
                          className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-300 uppercase"
                          autoFocus
                        />
                        <button onClick={() => handleLink(p.id)} disabled={linking}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
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

      {/* Students with codes */}
      <StudentsWithCodes />
    </div>
  )
}

function StudentsWithCodes() {
  const [students, setStudents] = useState<{ id: string; name: string; studentCode: string | null }[]>([])
  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(d => {
      const arr = Array.isArray(d) ? d : (d.students ?? [])
      setStudents(arr)
    })
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">📋 Mã học sinh</h2>
        <p className="text-xs text-gray-400 mt-0.5">Dùng mã này để gán phụ huynh với học sinh</p>
      </div>
      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {students.filter(s => s.studentCode).map(s => (
          <div key={s.id} className="px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">{s.name}</span>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
              {s.studentCode}
            </span>
          </div>
        ))}
        {students.filter(s => !s.studentCode).length > 0 && (
          <div className="px-6 py-2 text-xs text-gray-400 italic">
            {students.filter(s => !s.studentCode).length} học sinh chưa có mã
          </div>
        )}
      </div>
    </div>
  )
}
