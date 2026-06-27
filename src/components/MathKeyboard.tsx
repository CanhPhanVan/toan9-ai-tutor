'use client'

interface MathKeyboardProps {
  onInsert: (value: string, cursorOffset?: number) => void
}

const KEYS: { label: string; insert: string; title: string; cursorOffset?: number }[] = [
  // Hàng 1 – số mũ & căn & phân số
  { label: 'x²', insert: '²', title: 'Bình phương' },
  { label: 'x³', insert: '³', title: 'Lập phương' },
  { label: 'xⁿ', insert: '^', title: 'Số mũ n' },
  { label: '√', insert: '√', title: 'Căn bậc 2' },
  { label: '∛', insert: '∛', title: 'Căn bậc 3' },
  { label: 'a/b', insert: '/', title: 'Gạch ngang chia' },
  { label: '⁶⁄₃', insert: '$\\frac{}{}$', cursorOffset: 8, title: 'Phân số LaTeX: \\frac{tử}{mẫu}' },
  // Hàng 2 – dấu so sánh & đặc biệt
  { label: '±', insert: '±', title: 'Cộng trừ' },
  { label: '≥', insert: '≥', title: 'Lớn hơn hoặc bằng' },
  { label: '≤', insert: '≤', title: 'Nhỏ hơn hoặc bằng' },
  { label: '≠', insert: '≠', title: 'Khác' },
  { label: '∞', insert: '∞', title: 'Vô cực' },
  { label: '|x|', insert: '||', title: 'Giá trị tuyệt đối' },
  // Hàng 3 – chữ Hy Lạp & hằng số
  { label: 'Δ', insert: 'Δ', title: 'Delta' },
  { label: 'π', insert: 'π', title: 'Pi' },
  { label: 'α', insert: 'α', title: 'Alpha' },
  { label: 'β', insert: 'β', title: 'Beta' },
  { label: 'θ', insert: 'θ', title: 'Theta' },
  { label: '∈', insert: '∈', title: 'Thuộc' },
  // Hàng 4 – phương trình & tập hợp
  { label: '⇒', insert: ' ⇒ ', title: 'Suy ra' },
  { label: '⟺', insert: ' ⟺ ', title: 'Tương đương' },
  { label: 'ℝ', insert: 'ℝ', title: 'Tập số thực' },
  { label: '∅', insert: '∅', title: 'Tập rỗng' },
  { label: 'x₁', insert: 'x₁', title: 'Nghiệm x1' },
  { label: 'x₂', insert: 'x₂', title: 'Nghiệm x2' },
]

const GROUPS = [
  { label: 'Số mũ & Căn & Phân số', keys: KEYS.slice(0, 7), color: 'indigo' },
  { label: 'So sánh', keys: KEYS.slice(7, 13), color: 'blue' },
  { label: 'Ký hiệu', keys: KEYS.slice(13, 19), color: 'violet' },
  { label: 'Phương trình', keys: KEYS.slice(19, 25), color: 'purple' },
]

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 active:bg-indigo-200',
  blue:   'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 active:bg-blue-200',
  violet: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 active:bg-violet-200',
  purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 active:bg-purple-200',
}

export function MathKeyboard({ onInsert }: MathKeyboardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">⌨️ Bàn phím toán học — bấm để chèn vào bài làm</p>
      <div className="space-y-3">
        {GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-xs text-gray-400 mb-1.5">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.keys.map(key => (
                <button
                  key={key.insert}
                  type="button"
                  title={key.title}
                  onClick={() => onInsert(key.insert, key.cursorOffset)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all select-none ${colorMap[group.color]} min-w-[2.5rem] text-center`}
                >
                  {key.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        Bấm vào ô bài làm trước, rồi bấm ký hiệu để chèn vào đúng vị trí con trỏ.
      </p>
    </div>
  )
}
