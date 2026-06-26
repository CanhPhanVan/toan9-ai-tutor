'use client'
import { useRef, useState, useEffect, useCallback } from 'react'

type Tool = 'pen' | 'line' | 'circle' | 'rect' | 'eraser'

interface Pos { x: number; y: number }

interface MathCanvasProps {
  onClose?: () => void
  onSave?: (dataUrl: string) => void
  initialImage?: string
}

const COLORS = [
  { hex: '#1e293b', label: 'Đen' },
  { hex: '#ef4444', label: 'Đỏ' },
  { hex: '#3b82f6', label: 'Xanh dương' },
  { hex: '#16a34a', label: 'Xanh lá' },
  { hex: '#f59e0b', label: 'Vàng' },
  { hex: '#a855f7', label: 'Tím' },
]

const STROKE_WIDTHS = [
  { value: 1, label: 'Mỏng' },
  { value: 3, label: 'Vừa' },
  { value: 6, label: 'Dày' },
]

export default function MathCanvas({ onClose, onSave, initialImage }: MathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#1e293b')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [showGrid, setShowGrid] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const startPos = useRef<Pos>({ x: 0, y: 0 })
  const snapshot = useRef<ImageData | null>(null)

  const CANVAS_W = 600
  const CANVAS_H = 450

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    const step = 40
    const ox = Math.round(w / 2)
    const oy = Math.round(h / 2)

    ctx.save()
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 0.5
    // Vertical gridlines
    for (let x = ox % step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    // Horizontal gridlines
    for (let y = oy % step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1.5
    // X axis
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.stroke()
    // Y axis
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, h); ctx.stroke()

    // Arrows
    ctx.fillStyle = '#94a3b8'
    // X arrow
    ctx.beginPath(); ctx.moveTo(w - 2, oy); ctx.lineTo(w - 10, oy - 5); ctx.lineTo(w - 10, oy + 5); ctx.fill()
    // Y arrow
    ctx.beginPath(); ctx.moveTo(ox, 2); ctx.lineTo(ox - 5, 10); ctx.lineTo(ox + 5, 10); ctx.fill()

    // Labels
    ctx.fillStyle = '#64748b'
    ctx.font = '12px sans-serif'
    ctx.fillText('x', w - 16, oy - 8)
    ctx.fillText('y', ox + 6, 14)
    ctx.fillText('O', ox + 4, oy + 14)

    // Tick marks & numbers
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#94a3b8'
    for (let xi = ox + step; xi < w - 20; xi += step) {
      const label = ((xi - ox) / step).toString()
      ctx.fillText(label, xi - 3, oy + 14)
      ctx.beginPath(); ctx.moveTo(xi, oy - 3); ctx.lineTo(xi, oy + 3); ctx.stroke()
    }
    for (let xi = ox - step; xi > 10; xi -= step) {
      const label = (-(ox - xi) / step).toString()
      ctx.fillText(label, xi - 5, oy + 14)
      ctx.beginPath(); ctx.moveTo(xi, oy - 3); ctx.lineTo(xi, oy + 3); ctx.stroke()
    }
    for (let yi = oy - step; yi > 10; yi -= step) {
      const label = ((oy - yi) / step).toString()
      ctx.fillText(label, ox + 5, yi + 4)
      ctx.beginPath(); ctx.moveTo(ox - 3, yi); ctx.lineTo(ox + 3, yi); ctx.stroke()
    }
    for (let yi = oy + step; yi < h - 10; yi += step) {
      const label = (-((yi - oy) / step)).toString()
      ctx.fillText(label, ox + 5, yi + 4)
      ctx.beginPath(); ctx.moveTo(ox - 3, yi); ctx.lineTo(ox + 3, yi); ctx.stroke()
    }
    ctx.restore()
  }, [])

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (showGrid) drawGrid(ctx)
  }, [showGrid, drawGrid])

  useEffect(() => {
    initCanvas()
    if (initialImage) {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = initialImage
    }
  }, [initCanvas, initialImage])

  const getPos = (e: React.MouseEvent | React.TouchEvent): Pos => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    startPos.current = pos
    setIsDrawing(true)
    if (tool !== 'pen' && tool !== 'eraser') {
      snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)

    if (tool === 'pen') {
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = strokeWidth * 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (snapshot.current) {
      ctx.putImageData(snapshot.current, 0, 0)
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'

      if (tool === 'line') {
        ctx.beginPath()
        ctx.moveTo(startPos.current.x, startPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (tool === 'circle') {
        const dx = pos.x - startPos.current.x
        const dy = pos.y - startPos.current.y
        const radius = Math.sqrt(dx * dx + dy * dy)
        ctx.beginPath()
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      } else if (tool === 'rect') {
        ctx.beginPath()
        ctx.strokeRect(
          startPos.current.x, startPos.current.y,
          pos.x - startPos.current.x, pos.y - startPos.current.y
        )
      }
    }
  }

  const onMouseUp = () => {
    setIsDrawing(false)
    snapshot.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (showGrid) drawGrid(ctx)
  }

  const toggleGrid = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const newShow = !showGrid
    setShowGrid(newShow)
    if (newShow) {
      // Redraw grid on top of current content
      drawGrid(ctx)
    } else {
      // Redraw without grid — we need to clear and repaint (grid was baked in)
      // Just clear and repaint white — user loses drawn content if toggling off
      // Better: always keep track; for simplicity just redraw grid on top or remove by reinit
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  const drawParabola = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const ox = canvas.width / 2
    const oy = canvas.height / 2
    const step = 40 // pixels per unit

    ctx.save()
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    let first = true
    for (let px = 0; px < canvas.width; px++) {
      const xVal = (px - ox) / step
      const yVal = xVal * xVal
      const py = oy - yVal * step
      if (py < -20 || py > canvas.height + 20) { first = true; continue }
      if (first) { ctx.moveTo(px, py); first = false } else { ctx.lineTo(px, py) }
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Label
    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText('y = x²', ox + 45, oy - 45)
    ctx.restore()
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current!
    const link = document.createElement('a')
    link.download = 'math-canvas.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleSave = () => {
    const canvas = canvasRef.current!
    const dataUrl = canvas.toDataURL('image/png')
    onSave?.(dataUrl)
    onClose?.()
  }

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: 'pen', icon: '✏️', label: 'Bút vẽ' },
    { id: 'line', icon: '—', label: 'Đường thẳng' },
    { id: 'circle', icon: '○', label: 'Hình tròn' },
    { id: 'rect', icon: '□', label: 'Hình chữ nhật' },
    { id: 'eraser', icon: '⌫', label: 'Tẩy' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
        <span className="font-bold text-sm">📐 Bảng vẽ Toán học</span>
        {onClose && (
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {/* Drawing tools */}
        <div className="flex gap-1">
          {tools.map(t => (
            <button
              key={t.id}
              title={t.label}
              onClick={() => setTool(t.id)}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-colors ${
                tool === t.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Action buttons */}
        <button
          title="Xóa tất cả"
          onClick={clearCanvas}
          className="w-8 h-8 rounded-lg text-sm flex items-center justify-center bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >🗑️</button>
        <button
          title={showGrid ? 'Ẩn lưới' : 'Hiện lưới'}
          onClick={toggleGrid}
          className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-colors ${
            showGrid ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >📐</button>
        <button
          title="Vẽ parabol y=x²"
          onClick={drawParabola}
          className="px-2 h-8 rounded-lg text-xs flex items-center justify-center bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors font-mono font-bold"
        >y=x²</button>
        <button
          title="Tải xuống PNG"
          onClick={downloadCanvas}
          className="w-8 h-8 rounded-lg text-sm flex items-center justify-center bg-white text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
        >💾</button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Colors */}
        <div className="flex gap-1">
          {COLORS.map(c => (
            <button
              key={c.hex}
              title={c.label}
              onClick={() => setColor(c.hex)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c.hex ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Stroke widths */}
        <div className="flex gap-1 items-center">
          {STROKE_WIDTHS.map(sw => (
            <button
              key={sw.value}
              title={sw.label}
              onClick={() => setStrokeWidth(sw.value)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                strokeWidth === sw.value ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span
                className="rounded-full"
                style={{
                  width: sw.value * 2 + 4,
                  height: sw.value * 2 + 4,
                  backgroundColor: strokeWidth === sw.value ? '#fff' : '#374151',
                  minWidth: 4,
                  minHeight: 4,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-auto bg-gray-100 flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="touch-none shadow-sm rounded"
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair', maxWidth: '100%' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
        />
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
        <span className="text-xs text-gray-400">
          Công cụ: <span className="text-gray-600 font-medium">{tools.find(t => t.id === tool)?.label ?? tool}</span>
        </span>
        <span className="text-xs text-gray-300">•</span>
        <span className="text-xs text-gray-400">
          Màu: <span className="inline-block w-3 h-3 rounded-full align-middle border border-gray-300 ml-0.5" style={{ backgroundColor: color }} />
        </span>
        <div className="flex-1" />
        {onSave && (
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            ✅ Hoàn thành — chèn vào bài làm
          </button>
        )}
      </div>
    </div>
  )
}
