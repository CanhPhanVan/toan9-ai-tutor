export interface ExamPart {
  label: string   // 'a', 'b', 'c' hoặc '' nếu không có phần
  points: number
  content: string
  solution: string
  answer: string
}

export interface ExamQuestion {
  number: number
  points: number
  topic: string
  parts: ExamPart[]
}

export interface ExamContent {
  structure: string
  totalPoints: number
  duration: number
  questions: ExamQuestion[]
}

// Cấu trúc đề tuyển sinh lớp 10 TPHCM 2026
export const TUYEN_SINH_STRUCTURE = {
  type: 'tuyen-sinh',
  duration: 90,
  totalPoints: 10,
  questions: [
    { number: 1, points: 2.0, topic: 'Căn bậc hai - Căn bậc ba', parts: ['a', 'b', 'c'], partPoints: [0.5, 0.75, 0.75] },
    { number: 2, points: 1.5, topic: 'Hàm số và đồ thị', parts: ['a', 'b'], partPoints: [0.75, 0.75] },
    { number: 3, points: 1.5, topic: 'Phương trình - Hệ phương trình', parts: ['a', 'b'], partPoints: [0.75, 0.75] },
    { number: 4, points: 1.0, topic: 'Phương trình bậc hai', parts: ['a', 'b'], partPoints: [0.5, 0.5] },
    { number: 5, points: 2.0, topic: 'Hình học phẳng', parts: ['a', 'b', 'c'], partPoints: [0.5, 0.75, 0.75] },
    { number: 6, points: 1.0, topic: 'Đường tròn', parts: ['a', 'b'], partPoints: [0.5, 0.5] },
    { number: 7, points: 1.0, topic: 'Bài toán thực tế', parts: ['a', 'b'], partPoints: [0.5, 0.5] },
  ],
}

// Cấu trúc đề kiểm tra học kỳ 1
export const HK1_STRUCTURE = {
  type: 'hk1',
  duration: 60,
  totalPoints: 10,
  // HK1 bao gồm: Căn bậc hai, Biểu thức đại số, Hàm số y=ax+b, Hệ phương trình
  questions: [
    { number: 1, points: 2.0, topic: 'Trắc nghiệm (8 câu × 0.25đ)', parts: ['1', '2', '3', '4', '5', '6', '7', '8'], partPoints: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25], isMCQ: true },
    { number: 2, points: 2.0, topic: 'Căn bậc hai - Biểu thức đại số', parts: ['a', 'b', 'c'], partPoints: [0.5, 0.75, 0.75] },
    { number: 3, points: 2.0, topic: 'Hàm số và đồ thị', parts: ['a', 'b'], partPoints: [1.0, 1.0] },
    { number: 4, points: 2.0, topic: 'Hệ phương trình bậc nhất hai ẩn', parts: ['a', 'b'], partPoints: [1.0, 1.0] },
    { number: 5, points: 2.0, topic: 'Bài toán tổng hợp', parts: ['a', 'b'], partPoints: [1.0, 1.0] },
  ],
}

// Cấu trúc đề kiểm tra học kỳ 2
export const HK2_STRUCTURE = {
  type: 'hk2',
  duration: 60,
  totalPoints: 10,
  // HK2 bao gồm: Phương trình bậc hai, Hình học phẳng, Đường tròn, Thống kê, Xác suất
  questions: [
    { number: 1, points: 2.0, topic: 'Trắc nghiệm (8 câu × 0.25đ)', parts: ['1', '2', '3', '4', '5', '6', '7', '8'], partPoints: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25], isMCQ: true },
    { number: 2, points: 2.0, topic: 'Phương trình bậc hai', parts: ['a', 'b', 'c'], partPoints: [0.5, 0.75, 0.75] },
    { number: 3, points: 2.0, topic: 'Hình học phẳng - Đường tròn', parts: ['a', 'b', 'c'], partPoints: [0.5, 0.75, 0.75] },
    { number: 4, points: 2.0, topic: 'Thống kê - Xác suất', parts: ['a', 'b'], partPoints: [1.0, 1.0] },
    { number: 5, points: 2.0, topic: 'Bài toán thực tế', parts: ['a', 'b'], partPoints: [1.0, 1.0] },
  ],
}

export const EXAM_STRUCTURES = {
  'tuyen-sinh': TUYEN_SINH_STRUCTURE,
  'hk1': HK1_STRUCTURE,
  'hk2': HK2_STRUCTURE,
}

export const EXAM_TYPE_LABELS: Record<string, string> = {
  'tuyen-sinh': '🎓 Tuyển sinh lớp 10',
  'hk1': '📘 Kiểm tra học kỳ 1',
  'hk2': '📗 Kiểm tra học kỳ 2',
}
