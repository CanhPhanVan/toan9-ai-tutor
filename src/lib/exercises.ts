export interface Exercise {
  id: string
  title: string
  content: string
  topicId: string
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced'
  hints: string[]
  solution: {
    method: string
    steps: string[]
    answer: string
  }
}

export const EXERCISES: Exercise[] = [
  // === CĂN BẬC HAI - CĂN BẬC BA ===
  {
    id: 'cbh-1',
    title: 'Tính giá trị biểu thức căn đơn giản',
    content: 'Tính giá trị của biểu thức: $A = \\sqrt{49} + \\sqrt{25} - \\sqrt{16}$',
    topicId: 'can-bac-hai',
    difficulty: 'easy',
    hints: ['Tính từng căn bậc hai riêng biệt', '$\\sqrt{49} = 7$, $\\sqrt{25} = 5$, $\\sqrt{16} = 4$'],
    solution: {
      method: 'Tính trực tiếp căn bậc hai',
      steps: [
        '$\\sqrt{49} = 7$ (vì $7^2 = 49$)',
        '$\\sqrt{25} = 5$ (vì $5^2 = 25$)',
        '$\\sqrt{16} = 4$ (vì $4^2 = 16$)',
        'Vậy $A = 7 + 5 - 4 = 8$',
      ],
      answer: 'A = 8',
    },
  },
  {
    id: 'cbh-2',
    title: 'Rút gọn biểu thức chứa căn',
    content: 'Rút gọn biểu thức: $B = \\sqrt{12} + \\sqrt{27} - \\sqrt{48}$',
    topicId: 'can-bac-hai',
    difficulty: 'medium',
    hints: ['Phân tích mỗi số dưới dấu căn thành tích với số chính phương', '$12 = 4 \\cdot 3$, $27 = 9 \\cdot 3$, $48 = 16 \\cdot 3$'],
    solution: {
      method: 'Đưa thừa số ra ngoài dấu căn',
      steps: [
        '$\\sqrt{12} = \\sqrt{4 \\cdot 3} = 2\\sqrt{3}$',
        '$\\sqrt{27} = \\sqrt{9 \\cdot 3} = 3\\sqrt{3}$',
        '$\\sqrt{48} = \\sqrt{16 \\cdot 3} = 4\\sqrt{3}$',
        '$B = 2\\sqrt{3} + 3\\sqrt{3} - 4\\sqrt{3} = (2+3-4)\\sqrt{3} = \\sqrt{3}$',
      ],
      answer: 'B = √3',
    },
  },
  {
    id: 'cbh-3',
    title: 'Trục căn thức ở mẫu',
    content: 'Trục căn thức ở mẫu và rút gọn: $C = \\dfrac{6}{\\sqrt{3}} + \\dfrac{10}{\\sqrt{5}}$',
    topicId: 'can-bac-hai',
    difficulty: 'medium',
    hints: ['Nhân tử và mẫu với căn thức ở mẫu', '$\\frac{6}{\\sqrt{3}} = \\frac{6\\sqrt{3}}{3} = 2\\sqrt{3}$'],
    solution: {
      method: 'Trục căn thức ở mẫu',
      steps: [
        '$\\dfrac{6}{\\sqrt{3}} = \\dfrac{6\\sqrt{3}}{\\sqrt{3} \\cdot \\sqrt{3}} = \\dfrac{6\\sqrt{3}}{3} = 2\\sqrt{3}$',
        '$\\dfrac{10}{\\sqrt{5}} = \\dfrac{10\\sqrt{5}}{5} = 2\\sqrt{5}$',
        '$C = 2\\sqrt{3} + 2\\sqrt{5}$',
      ],
      answer: 'C = 2√3 + 2√5',
    },
  },
  {
    id: 'cbh-4',
    title: 'Giải phương trình chứa căn',
    content: 'Giải phương trình: $\\sqrt{x - 1} = 3$',
    topicId: 'can-bac-hai',
    difficulty: 'hard',
    hints: ['Bình phương hai vế', 'Kiểm tra điều kiện $x - 1 \\geq 0$'],
    solution: {
      method: 'Bình phương hai vế',
      steps: [
        'Điều kiện xác định: $x - 1 \\geq 0 \\Rightarrow x \\geq 1$',
        'Bình phương hai vế: $x - 1 = 9$',
        '$x = 10$',
        'Kiểm tra: $\\sqrt{10-1} = \\sqrt{9} = 3$ ✓',
      ],
      answer: 'x = 10',
    },
  },

  // === BIỂU THỨC ĐẠI SỐ ===
  {
    id: 'btds-1',
    title: 'Khai triển hằng đẳng thức',
    content: 'Khai triển và rút gọn: $(x+3)^2 - (x-1)(x+1)$',
    topicId: 'bieu-thuc-dai-so',
    difficulty: 'easy',
    hints: ['Dùng hằng đẳng thức $(a+b)^2 = a^2 + 2ab + b^2$', 'Dùng hằng đẳng thức $(a-b)(a+b) = a^2 - b^2$'],
    solution: {
      method: 'Áp dụng hằng đẳng thức đáng nhớ',
      steps: [
        '$(x+3)^2 = x^2 + 6x + 9$',
        '$(x-1)(x+1) = x^2 - 1$',
        'Biểu thức $= x^2 + 6x + 9 - (x^2 - 1)$',
        '$= x^2 + 6x + 9 - x^2 + 1 = 6x + 10$',
      ],
      answer: '6x + 10',
    },
  },
  {
    id: 'btds-2',
    title: 'Phân tích đa thức thành nhân tử',
    content: 'Phân tích đa thức thành nhân tử: $x^2 - 5x + 6$',
    topicId: 'bieu-thuc-dai-so',
    difficulty: 'medium',
    hints: ['Tìm hai số có tích bằng 6 và tổng bằng -5', 'Hai số đó là -2 và -3'],
    solution: {
      method: 'Phân tích thành nhân tử bằng phương pháp tách hạng tử',
      steps: [
        'Tìm hai số $a, b$ sao cho $a + b = -5$ và $a \\cdot b = 6$',
        'Hai số đó là $a = -2, b = -3$',
        '$x^2 - 5x + 6 = x^2 - 2x - 3x + 6$',
        '$= x(x-2) - 3(x-2) = (x-2)(x-3)$',
      ],
      answer: '(x - 2)(x - 3)',
    },
  },
  {
    id: 'btds-3',
    title: 'Rút gọn phân thức đại số',
    content: 'Rút gọn phân thức: $\\dfrac{x^2 - 4}{x^2 - 4x + 4}$',
    topicId: 'bieu-thuc-dai-so',
    difficulty: 'medium',
    hints: ['Phân tích tử số: $x^2 - 4 = (x-2)(x+2)$', 'Phân tích mẫu số: $x^2 - 4x + 4 = (x-2)^2$'],
    solution: {
      method: 'Phân tích và rút gọn nhân tử chung',
      steps: [
        'Tử số: $x^2 - 4 = (x-2)(x+2)$',
        'Mẫu số: $x^2 - 4x + 4 = (x-2)^2$',
        '$\\dfrac{(x-2)(x+2)}{(x-2)^2} = \\dfrac{x+2}{x-2}$ (với $x \\neq 2$)',
      ],
      answer: '(x+2)/(x-2), với x ≠ 2',
    },
  },
  {
    id: 'btds-4',
    title: 'Chứng minh hằng đẳng thức',
    content: 'Chứng minh: $(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$',
    topicId: 'bieu-thuc-dai-so',
    difficulty: 'hard',
    hints: ['Viết $(a+b)^3 = (a+b)^2 \\cdot (a+b)$', 'Khai triển $(a+b)^2$ trước rồi nhân tiếp'],
    solution: {
      method: 'Khai triển trực tiếp',
      steps: [
        '$(a+b)^3 = (a+b)^2 \\cdot (a+b)$',
        '$(a+b)^2 = a^2 + 2ab + b^2$',
        '$(a^2 + 2ab + b^2)(a+b) = a^3 + a^2b + 2a^2b + 2ab^2 + ab^2 + b^3$',
        '$= a^3 + 3a^2b + 3ab^2 + b^3$ (đpcm)',
      ],
      answer: 'Đã chứng minh xong',
    },
  },

  // === PHƯƠNG TRÌNH - HỆ PHƯƠNG TRÌNH ===
  {
    id: 'pt-1',
    title: 'Giải phương trình bậc nhất',
    content: 'Giải phương trình: $3x - 7 = 2x + 5$',
    topicId: 'phuong-trinh',
    difficulty: 'easy',
    hints: ['Chuyển vế các hạng tử chứa x sang một bên', 'Chuyển hằng số sang bên còn lại'],
    solution: {
      method: 'Giải phương trình bậc nhất một ẩn',
      steps: [
        '$3x - 7 = 2x + 5$',
        '$3x - 2x = 5 + 7$',
        '$x = 12$',
      ],
      answer: 'x = 12',
    },
  },
  {
    id: 'pt-2',
    title: 'Giải hệ phương trình bằng phương pháp thế',
    content: 'Giải hệ phương trình: $$\\begin{cases} x + y = 5 \\\\ 2x - y = 4 \\end{cases}$$',
    topicId: 'phuong-trinh',
    difficulty: 'medium',
    hints: ['Từ phương trình (1): $y = 5 - x$', 'Thế vào phương trình (2) để tìm x'],
    solution: {
      method: 'Phương pháp thế',
      steps: [
        'Từ PT(1): $y = 5 - x$',
        'Thế vào PT(2): $2x - (5-x) = 4$',
        '$2x - 5 + x = 4 \\Rightarrow 3x = 9 \\Rightarrow x = 3$',
        '$y = 5 - 3 = 2$',
        'Vậy $(x; y) = (3; 2)$',
      ],
      answer: '(x; y) = (3; 2)',
    },
  },
  {
    id: 'pt-3',
    title: 'Giải hệ phương trình bằng phương pháp cộng',
    content: 'Giải hệ phương trình: $$\\begin{cases} 3x + 2y = 12 \\\\ x - 2y = 0 \\end{cases}$$',
    topicId: 'phuong-trinh',
    difficulty: 'medium',
    hints: ['Cộng hai phương trình theo vế để khử y', 'Sau khi tìm x, thế ngược lại để tìm y'],
    solution: {
      method: 'Phương pháp cộng đại số',
      steps: [
        'Cộng PT(1) và PT(2): $(3x + 2y) + (x - 2y) = 12 + 0$',
        '$4x = 12 \\Rightarrow x = 3$',
        'Thế $x = 3$ vào PT(2): $3 - 2y = 0 \\Rightarrow y = 1.5$',
        'Vậy $(x; y) = (3; 1.5)$',
      ],
      answer: '(x; y) = (3; 3/2)',
    },
  },
  {
    id: 'pt-4',
    title: 'Bài toán hệ phương trình thực tế',
    content: 'Một lớp có 40 học sinh, số nam nhiều hơn số nữ là 4. Tìm số nam và số nữ của lớp đó.',
    topicId: 'phuong-trinh',
    difficulty: 'hard',
    hints: ['Gọi số nam là x, số nữ là y', 'Lập hệ phương trình từ đề bài'],
    solution: {
      method: 'Lập và giải hệ phương trình',
      steps: [
        'Gọi số nam là $x$, số nữ là $y$ (học sinh)',
        'Lập hệ: $\\begin{cases} x + y = 40 \\\\ x - y = 4 \\end{cases}$',
        'Cộng hai PT: $2x = 44 \\Rightarrow x = 22$',
        '$y = 40 - 22 = 18$',
        'Vậy lớp có 22 nam và 18 nữ',
      ],
      answer: '22 học sinh nam, 18 học sinh nữ',
    },
  },

  // === HÀM SỐ VÀ ĐỒ THỊ ===
  {
    id: 'hsdt-1',
    title: 'Xác định hàm số bậc nhất',
    content: 'Cho hàm số $y = 2x - 3$. Tính giá trị của hàm số khi $x = 0$; $x = 2$; $x = -1$.',
    topicId: 'ham-so-do-thi',
    difficulty: 'easy',
    hints: ['Thay giá trị x vào công thức $y = 2x - 3$'],
    solution: {
      method: 'Thay giá trị vào hàm số',
      steps: [
        'Khi $x = 0$: $y = 2(0) - 3 = -3$',
        'Khi $x = 2$: $y = 2(2) - 3 = 1$',
        'Khi $x = -1$: $y = 2(-1) - 3 = -5$',
      ],
      answer: 'y(0) = -3; y(2) = 1; y(-1) = -5',
    },
  },
  {
    id: 'hsdt-2',
    title: 'Tìm phương trình đường thẳng',
    content: 'Tìm phương trình đường thẳng $y = ax + b$ biết đường thẳng đi qua hai điểm $A(0; 3)$ và $B(2; 7)$.',
    topicId: 'ham-so-do-thi',
    difficulty: 'medium',
    hints: ['Thế tọa độ điểm A vào để tìm b', 'Thế tọa độ điểm B vào để tìm a'],
    solution: {
      method: 'Xác định hệ số a, b',
      steps: [
        'Điểm $A(0; 3)$: $3 = a(0) + b \\Rightarrow b = 3$',
        'Điểm $B(2; 7)$: $7 = a(2) + 3 \\Rightarrow 2a = 4 \\Rightarrow a = 2$',
        'Vậy phương trình đường thẳng: $y = 2x + 3$',
      ],
      answer: 'y = 2x + 3',
    },
  },
  {
    id: 'hsdt-3',
    title: 'Vẽ đồ thị hàm số bậc hai',
    content: 'Cho hàm số $y = x^2 - 2x - 3$. Tìm đỉnh parabol, trục đối xứng và giao điểm với trục Ox.',
    topicId: 'ham-so-do-thi',
    difficulty: 'hard',
    hints: [
      'Đỉnh parabol: $x_0 = -\\frac{b}{2a} = -\\frac{-2}{2} = 1$',
      'Phương trình $x^2 - 2x - 3 = 0$ có nghiệm là giao điểm với Ox',
    ],
    solution: {
      method: 'Phân tích parabol',
      steps: [
        'Đỉnh: $x_0 = -\\frac{-2}{2 \\cdot 1} = 1$; $y_0 = 1 - 2 - 3 = -4$ → Đỉnh $I(1; -4)$',
        'Trục đối xứng: $x = 1$',
        'Giao Ox: $x^2 - 2x - 3 = 0 \\Rightarrow (x-3)(x+1) = 0$',
        'Giao tại $x = 3$ và $x = -1$',
      ],
      answer: 'Đỉnh I(1; -4), trục đối xứng x=1, giao Ox tại (-1;0) và (3;0)',
    },
  },

  // === PHƯƠNG TRÌNH BẬC HAI ===
  {
    id: 'ptbh-1',
    title: 'Giải phương trình bậc hai bằng công thức',
    content: 'Giải phương trình: $x^2 - 5x + 6 = 0$',
    topicId: 'phuong-trinh-bac-hai',
    difficulty: 'easy',
    hints: ['Tính $\\Delta = b^2 - 4ac$', 'Với $a=1, b=-5, c=6$'],
    solution: {
      method: 'Công thức nghiệm phương trình bậc hai',
      steps: [
        '$a = 1, b = -5, c = 6$',
        '$\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1 > 0$',
        '$x_1 = \\frac{5 + 1}{2} = 3$; $x_2 = \\frac{5 - 1}{2} = 2$',
      ],
      answer: 'x₁ = 3, x₂ = 2',
    },
  },
  {
    id: 'ptbh-2',
    title: 'Phương trình bậc hai vô nghiệm',
    content: 'Giải phương trình: $x^2 + 2x + 5 = 0$',
    topicId: 'phuong-trinh-bac-hai',
    difficulty: 'easy',
    hints: ['Tính $\\Delta = b^2 - 4ac$', 'Nếu $\\Delta < 0$, phương trình vô nghiệm'],
    solution: {
      method: 'Tính delta xét nghiệm',
      steps: [
        '$a = 1, b = 2, c = 5$',
        '$\\Delta = 4 - 20 = -16 < 0$',
        'Vì $\\Delta < 0$ nên phương trình vô nghiệm trong tập số thực',
      ],
      answer: 'Phương trình vô nghiệm',
    },
  },
  {
    id: 'ptbh-3',
    title: 'Hệ thức Viète',
    content: 'Cho phương trình $x^2 - 7x + 12 = 0$ có hai nghiệm $x_1, x_2$. Tính $x_1 + x_2$ và $x_1 \\cdot x_2$ mà không giải phương trình.',
    topicId: 'phuong-trinh-bac-hai',
    difficulty: 'medium',
    hints: ['Hệ thức Viète: $x_1 + x_2 = -\\frac{b}{a}$, $x_1 \\cdot x_2 = \\frac{c}{a}$'],
    solution: {
      method: 'Áp dụng hệ thức Viète',
      steps: [
        '$a = 1, b = -7, c = 12$',
        'Kiểm tra $\\Delta = 49 - 48 = 1 > 0$ nên PT có 2 nghiệm',
        '$x_1 + x_2 = -\\frac{-7}{1} = 7$',
        '$x_1 \\cdot x_2 = \\frac{12}{1} = 12$',
      ],
      answer: 'x₁ + x₂ = 7; x₁·x₂ = 12',
    },
  },
  {
    id: 'ptbh-4',
    title: 'Lập phương trình bậc hai khi biết nghiệm',
    content: 'Lập phương trình bậc hai có hai nghiệm là $x_1 = 3$ và $x_2 = -5$.',
    topicId: 'phuong-trinh-bac-hai',
    difficulty: 'medium',
    hints: ['Dùng hệ thức Viète ngược', '$S = x_1 + x_2$, $P = x_1 \\cdot x_2$'],
    solution: {
      method: 'Lập phương trình từ hệ thức Viète',
      steps: [
        '$S = x_1 + x_2 = 3 + (-5) = -2$',
        '$P = x_1 \\cdot x_2 = 3 \\cdot (-5) = -15$',
        'Phương trình: $x^2 - Sx + P = 0$',
        'Vậy: $x^2 + 2x - 15 = 0$',
      ],
      answer: 'x² + 2x - 15 = 0',
    },
  },

  // === HÌNH HỌC PHẲNG ===
  {
    id: 'hhp-1',
    title: 'Tam giác đồng dạng cơ bản',
    content: 'Cho tam giác $ABC$ có $DE \\parallel BC$ với $D \\in AB$, $E \\in AC$. Biết $AD = 4$, $DB = 2$, $AE = 6$. Tính $EC$.',
    topicId: 'hinh-hoc-phang',
    difficulty: 'easy',
    hints: ['Tam giác $ADE \\sim$ tam giác $ABC$', 'Tỉ số đồng dạng: $\\frac{AD}{AB} = \\frac{AE}{AC}$'],
    solution: {
      method: 'Tính tỉ lệ theo định lý Thales',
      steps: [
        'Vì $DE \\parallel BC$ nên theo định lý Thales: $\\frac{AD}{DB} = \\frac{AE}{EC}$',
        '$\\frac{4}{2} = \\frac{6}{EC}$',
        '$2 = \\frac{6}{EC} \\Rightarrow EC = 3$',
      ],
      answer: 'EC = 3',
    },
  },
  {
    id: 'hhp-2',
    title: 'Tính diện tích tam giác',
    content: 'Tam giác $ABC$ vuông tại $A$ có $AB = 3$ cm, $AC = 4$ cm. Tính diện tích và độ dài $BC$.',
    topicId: 'hinh-hoc-phang',
    difficulty: 'easy',
    hints: ['Dùng định lý Pythagoras', 'Diện tích = $\\frac{1}{2} \\cdot AB \\cdot AC$'],
    solution: {
      method: 'Định lý Pythagoras và công thức diện tích',
      steps: [
        '$BC^2 = AB^2 + AC^2 = 9 + 16 = 25$',
        '$BC = 5$ cm',
        'Diện tích $= \\frac{1}{2} \\cdot 3 \\cdot 4 = 6$ cm²',
      ],
      answer: 'BC = 5 cm, S = 6 cm²',
    },
  },
  {
    id: 'hhp-3',
    title: 'Chứng minh tam giác đồng dạng',
    content: 'Cho tam giác $ABC$ với $M$ là trung điểm $AB$ và $N$ là trung điểm $AC$. Chứng minh $MN \\parallel BC$ và $MN = \\frac{1}{2}BC$.',
    topicId: 'hinh-hoc-phang',
    difficulty: 'hard',
    hints: ['Dùng định lý đường trung bình của tam giác'],
    solution: {
      method: 'Định lý đường trung bình tam giác',
      steps: [
        '$M$ là trung điểm $AB \\Rightarrow AM = MB = \\frac{AB}{2}$',
        '$N$ là trung điểm $AC \\Rightarrow AN = NC = \\frac{AC}{2}$',
        '$\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{1}{2}$ và góc $A$ chung',
        'Suy ra $\\triangle AMN \\sim \\triangle ABC$ (c-g-c)',
        'Tỉ số đồng dạng $= \\frac{1}{2}$ nên $MN = \\frac{1}{2}BC$ và $MN \\parallel BC$',
      ],
      answer: 'Đã chứng minh MN // BC và MN = BC/2',
    },
  },

  // === ĐƯỜNG TRÒN ===
  {
    id: 'dt-1',
    title: 'Tiếp tuyến đường tròn',
    content: 'Cho đường tròn tâm $O$ bán kính $R = 5$. Điểm $M$ nằm ngoài đường tròn có $OM = 13$. Tính độ dài tiếp tuyến $MA$ kẻ từ $M$ đến đường tròn.',
    topicId: 'duong-tron',
    difficulty: 'easy',
    hints: ['Tiếp tuyến vuông góc với bán kính tại tiếp điểm', '$OA \\perp MA$'],
    solution: {
      method: 'Tam giác vuông OAM',
      steps: [
        'Vì $MA$ là tiếp tuyến nên $OA \\perp MA$ (tại A)',
        'Tam giác $OAM$ vuông tại $A$',
        '$MA^2 = OM^2 - OA^2 = 169 - 25 = 144$',
        '$MA = 12$',
      ],
      answer: 'MA = 12',
    },
  },
  {
    id: 'dt-2',
    title: 'Góc nội tiếp',
    content: 'Cho đường tròn tâm $O$. Biết cung $AB = 120°$ (cung nhỏ). Tính góc nội tiếp $ACB$ trong đó $C$ nằm trên cung lớn.',
    topicId: 'duong-tron',
    difficulty: 'medium',
    hints: ['Góc nội tiếp bằng nửa cung bị chắn', 'Góc $ACB$ chắn cung $AB = 120°$'],
    solution: {
      method: 'Định lý góc nội tiếp',
      steps: [
        'Góc nội tiếp $ACB$ chắn cung $AB$',
        'Theo định lý: Góc nội tiếp = $\\frac{1}{2}$ cung bị chắn',
        '$\\angle ACB = \\frac{1}{2} \\cdot 120° = 60°$',
      ],
      answer: '∠ACB = 60°',
    },
  },
  {
    id: 'dt-3',
    title: 'Tứ giác nội tiếp',
    content: 'Tứ giác $ABCD$ nội tiếp đường tròn. Biết $\\angle A = 75°$. Tính $\\angle C$.',
    topicId: 'duong-tron',
    difficulty: 'medium',
    hints: ['Tứ giác nội tiếp có hai góc đối bù nhau', '$\\angle A + \\angle C = 180°$'],
    solution: {
      method: 'Tính chất tứ giác nội tiếp',
      steps: [
        'Tứ giác $ABCD$ nội tiếp đường tròn',
        'Hai góc đối của tứ giác nội tiếp bù nhau',
        '$\\angle A + \\angle C = 180°$',
        '$\\angle C = 180° - 75° = 105°$',
      ],
      answer: '∠C = 105°',
    },
  },

  // === HỆ THỨC LƯỢNG ===
  {
    id: 'htl-1',
    title: 'Hệ thức lượng trong tam giác vuông',
    content: 'Tam giác $ABC$ vuông tại $A$, đường cao $AH$. Biết $BH = 4$, $HC = 9$. Tính $AH$, $AB$, $AC$.',
    topicId: 'he-thuc-luong',
    difficulty: 'medium',
    hints: ['$AH^2 = BH \\cdot HC$', '$AB^2 = BH \\cdot BC$, $AC^2 = HC \\cdot BC$'],
    solution: {
      method: 'Hệ thức lượng trong tam giác vuông',
      steps: [
        '$BC = BH + HC = 4 + 9 = 13$',
        '$AH^2 = BH \\cdot HC = 4 \\cdot 9 = 36 \\Rightarrow AH = 6$',
        '$AB^2 = BH \\cdot BC = 4 \\cdot 13 = 52 \\Rightarrow AB = 2\\sqrt{13}$',
        '$AC^2 = HC \\cdot BC = 9 \\cdot 13 = 117 \\Rightarrow AC = 3\\sqrt{13}$',
      ],
      answer: 'AH = 6, AB = 2√13, AC = 3√13',
    },
  },
  {
    id: 'htl-2',
    title: 'Tỉ số lượng giác',
    content: 'Tam giác $ABC$ vuông tại $C$ có $\\angle A = 30°$, $BC = 5$. Tính $AB$ và $AC$.',
    topicId: 'he-thuc-luong',
    difficulty: 'easy',
    hints: ['$\\sin A = \\frac{BC}{AB}$', '$\\cos A = \\frac{AC}{AB}$'],
    solution: {
      method: 'Tỉ số lượng giác trong tam giác vuông',
      steps: [
        '$\\sin 30° = \\frac{BC}{AB} \\Rightarrow \\frac{1}{2} = \\frac{5}{AB} \\Rightarrow AB = 10$',
        '$\\cos 30° = \\frac{AC}{AB} \\Rightarrow \\frac{\\sqrt{3}}{2} = \\frac{AC}{10} \\Rightarrow AC = 5\\sqrt{3}$',
      ],
      answer: 'AB = 10, AC = 5√3',
    },
  },
  {
    id: 'htl-3',
    title: 'Ứng dụng tỉ số lượng giác',
    content: 'Từ điểm A trên mặt đất, nhìn đỉnh tháp B với góc ngẩng $45°$. Khoảng cách từ A đến chân tháp C là 30m. Tính chiều cao tháp BC.',
    topicId: 'he-thuc-luong',
    difficulty: 'hard',
    hints: ['Tam giác $ABC$ vuông tại $C$', '$\\tan(\\angle BAC) = \\frac{BC}{AC}$'],
    solution: {
      method: 'Tỉ số lượng giác',
      steps: [
        'Tam giác $ABC$ vuông tại $C$',
        '$\\tan 45° = \\frac{BC}{AC}$',
        '$1 = \\frac{BC}{30} \\Rightarrow BC = 30$ m',
        'Vậy chiều cao tháp là 30m',
      ],
      answer: 'Chiều cao tháp = 30m',
    },
  },

  // === THỐNG KÊ ===
  {
    id: 'tk-1',
    title: 'Tính số trung bình cộng',
    content: 'Điểm kiểm tra của 10 học sinh: 7, 8, 6, 9, 7, 10, 8, 7, 9, 6. Tính điểm trung bình.',
    topicId: 'thong-ke',
    difficulty: 'easy',
    hints: ['Số trung bình = Tổng / Số phần tử'],
    solution: {
      method: 'Tính số trung bình cộng',
      steps: [
        'Tổng điểm: $7+8+6+9+7+10+8+7+9+6 = 77$',
        'Số học sinh: 10',
        'Điểm trung bình: $\\bar{x} = \\frac{77}{10} = 7.7$',
      ],
      answer: 'Điểm trung bình = 7,7',
    },
  },
  {
    id: 'tk-2',
    title: 'Tìm mốt và trung vị',
    content: 'Cho dãy số liệu: 5, 7, 8, 6, 7, 9, 7, 8, 6, 5, 7. Tìm mốt và trung vị.',
    topicId: 'thong-ke',
    difficulty: 'medium',
    hints: ['Sắp xếp dữ liệu theo thứ tự tăng dần', 'Mốt là giá trị xuất hiện nhiều nhất', 'Trung vị là giá trị giữa dãy đã sắp xếp'],
    solution: {
      method: 'Thống kê mô tả',
      steps: [
        'Sắp xếp: 5, 5, 6, 6, 7, 7, 7, 7, 8, 8, 9',
        'Mốt (Mode): 7 (xuất hiện 4 lần)',
        'Trung vị (Median): Có 11 phần tử, phần tử thứ 6 = 7',
      ],
      answer: 'Mốt = 7, Trung vị = 7',
    },
  },
  {
    id: 'tk-3',
    title: 'Đọc biểu đồ và tính tần suất',
    content: 'Trong lớp 40 học sinh, số học sinh đạt điểm Giỏi là 12, Khá là 18, Trung bình là 8, Yếu là 2. Tính tần suất (%) của mỗi loại.',
    topicId: 'thong-ke',
    difficulty: 'easy',
    hints: ['Tần suất % = (Số học sinh / Tổng) × 100%'],
    solution: {
      method: 'Tính tần suất tương đối',
      steps: [
        'Giỏi: $\\frac{12}{40} \\times 100\\% = 30\\%$',
        'Khá: $\\frac{18}{40} \\times 100\\% = 45\\%$',
        'Trung bình: $\\frac{8}{40} \\times 100\\% = 20\\%$',
        'Yếu: $\\frac{2}{40} \\times 100\\% = 5\\%$',
      ],
      answer: 'Giỏi 30%, Khá 45%, TB 20%, Yếu 5%',
    },
  },

  // === XÁC SUẤT ===
  {
    id: 'xs-1',
    title: 'Xác suất lấy bi từ túi',
    content: 'Trong túi có 5 bi đỏ và 3 bi xanh. Lấy ngẫu nhiên 1 bi. Tính xác suất lấy được bi đỏ.',
    topicId: 'xac-suat',
    difficulty: 'easy',
    hints: ['$P(A) = \\frac{\\text{số kết quả thuận lợi}}{\\text{tổng số kết quả}}$'],
    solution: {
      method: 'Tính xác suất cổ điển',
      steps: [
        'Tổng số bi: $5 + 3 = 8$',
        'Số bi đỏ: 5',
        '$P(\\text{đỏ}) = \\frac{5}{8}$',
      ],
      answer: 'P = 5/8',
    },
  },
  {
    id: 'xs-2',
    title: 'Xác suất tung đồng xu',
    content: 'Tung một đồng xu cân đối 3 lần. Tính xác suất để được đúng 2 lần ngửa (N).',
    topicId: 'xac-suat',
    difficulty: 'medium',
    hints: ['Liệt kê tất cả kết quả có thể', 'Đếm số kết quả có đúng 2 mặt N'],
    solution: {
      method: 'Không gian mẫu và biến cố',
      steps: [
        'Không gian mẫu: {NNN, NNS, NSN, SNN, NSS, SNS, SSN, SSS} → 8 kết quả',
        'Kết quả có đúng 2N: {NNS, NSN, SNN} → 3 kết quả',
        '$P = \\frac{3}{8}$',
      ],
      answer: 'P = 3/8',
    },
  },
  {
    id: 'xs-3',
    title: 'Xác suất gieo xúc xắc',
    content: 'Gieo một xúc xắc cân đối. Tính xác suất để được số chẵn hoặc số lớn hơn 4.',
    topicId: 'xac-suat',
    difficulty: 'medium',
    hints: ['Số chẵn: {2, 4, 6}; số > 4: {5, 6}', 'Hợp của hai biến cố (dùng quy tắc cộng)'],
    solution: {
      method: 'Xác suất hợp hai biến cố',
      steps: [
        'A = "số chẵn" = {2, 4, 6}; $P(A) = \\frac{3}{6} = \\frac{1}{2}$',
        'B = "số > 4" = {5, 6}; $P(B) = \\frac{2}{6} = \\frac{1}{3}$',
        '$A \\cap B = \\{6\\}$; $P(A \\cap B) = \\frac{1}{6}$',
        '$P(A \\cup B) = \\frac{1}{2} + \\frac{1}{3} - \\frac{1}{6} = \\frac{4}{6} = \\frac{2}{3}$',
      ],
      answer: 'P = 2/3',
    },
  },

  // === BÀI TOÁN THỰC TẾ ===
  {
    id: 'btt-1',
    title: 'Bài toán vòi nước',
    content: 'Vòi A một mình chảy đầy bể hết 6 giờ. Vòi B một mình chảy đầy bể hết 4 giờ. Hỏi mở cả hai vòi thì bao lâu đầy bể?',
    topicId: 'bai-toan-thuc-te',
    difficulty: 'medium',
    hints: ['Trong 1 giờ vòi A chảy được 1/6 bể', 'Trong 1 giờ vòi B chảy được 1/4 bể'],
    solution: {
      method: 'Bài toán năng suất',
      steps: [
        'Trong 1 giờ, vòi A chảy: $\\frac{1}{6}$ bể',
        'Trong 1 giờ, vòi B chảy: $\\frac{1}{4}$ bể',
        'Cả hai vòi trong 1 giờ: $\\frac{1}{6} + \\frac{1}{4} = \\frac{5}{12}$ bể',
        'Thời gian đầy bể: $\\frac{1}{\\frac{5}{12}} = \\frac{12}{5} = 2.4$ giờ',
      ],
      answer: '2 giờ 24 phút',
    },
  },
  {
    id: 'btt-2',
    title: 'Bài toán chuyển động',
    content: 'Xe máy đi từ A đến B hết 3 giờ. Ô tô đi từ A đến B nhanh hơn xe máy 20 km/h và chỉ mất 2 giờ. Tính quãng đường AB.',
    topicId: 'bai-toan-thuc-te',
    difficulty: 'medium',
    hints: ['Gọi vận tốc xe máy là v', 'Quãng đường: xe máy = 3v, ô tô = 2(v+20)'],
    solution: {
      method: 'Lập phương trình từ điều kiện bài toán',
      steps: [
        'Gọi vận tốc xe máy là $v$ (km/h)',
        'Vận tốc ô tô là $v + 20$ (km/h)',
        'Cùng quãng đường: $3v = 2(v+20)$',
        '$3v = 2v + 40 \\Rightarrow v = 40$ km/h',
        'Quãng đường $AB = 3 \\times 40 = 120$ km',
      ],
      answer: 'AB = 120 km',
    },
  },
  {
    id: 'btt-3',
    title: 'Bài toán diện tích',
    content: 'Mảnh vườn hình chữ nhật có chu vi 60m. Chiều dài hơn chiều rộng 6m. Tính diện tích mảnh vườn.',
    topicId: 'bai-toan-thuc-te',
    difficulty: 'easy',
    hints: ['Gọi chiều dài là a, chiều rộng là b', 'Chu vi: 2(a+b) = 60'],
    solution: {
      method: 'Lập hệ phương trình',
      steps: [
        'Gọi chiều dài là $a$, chiều rộng là $b$ (m)',
        'Hệ: $\\begin{cases} 2(a+b) = 60 \\\\ a - b = 6 \\end{cases}$',
        '$a + b = 30$ và $a - b = 6$',
        '$2a = 36 \\Rightarrow a = 18$; $b = 12$',
        'Diện tích: $S = 18 \\times 12 = 216$ m²',
      ],
      answer: 'S = 216 m²',
    },
  },

  // === ĐỀ TỔNG HỢP ===
  {
    id: 'dth-1',
    title: 'Bài 1 đề thi vào lớp 10 (2023)',
    content: 'Cho biểu thức $P = \\left(\\frac{\\sqrt{x}}{\\sqrt{x}-1} - \\frac{1}{x - \\sqrt{x}}\\right) \\div \\frac{\\sqrt{x}+1}{\\sqrt{x}}$ với $x > 0, x \\neq 1$. Rút gọn P.',
    topicId: 'de-tong-hop',
    difficulty: 'advanced',
    hints: ['Nhân tử chung trong ngoặc là $\\sqrt{x}(\\sqrt{x}-1)$', 'Sau khi rút gọn trong ngoặc, đổi phép chia thành nhân'],
    solution: {
      method: 'Rút gọn phân thức chứa căn',
      steps: [
        '$P = \\left(\\frac{\\sqrt{x}}{\\sqrt{x}-1} - \\frac{1}{\\sqrt{x}(\\sqrt{x}-1)}\\right) \\cdot \\frac{\\sqrt{x}}{\\sqrt{x}+1}$',
        '$= \\frac{x - 1}{\\sqrt{x}(\\sqrt{x}-1)} \\cdot \\frac{\\sqrt{x}}{\\sqrt{x}+1}$',
        '$= \\frac{(\\sqrt{x}-1)(\\sqrt{x}+1)}{\\sqrt{x}(\\sqrt{x}-1)} \\cdot \\frac{\\sqrt{x}}{\\sqrt{x}+1}$',
        '$= 1$',
      ],
      answer: 'P = 1',
    },
  },
  {
    id: 'dth-2',
    title: 'Bài toán hình học tổng hợp',
    content: 'Cho đường tròn tâm $O$ bán kính $R = 10$. Dây $AB = 16$. Tính khoảng cách từ tâm $O$ đến dây $AB$.',
    topicId: 'de-tong-hop',
    difficulty: 'medium',
    hints: ['Đường kính vuông góc với dây cung tại trung điểm', 'Tam giác vuông với cạnh huyền là R'],
    solution: {
      method: 'Tính khoảng cách từ tâm đến dây cung',
      steps: [
        'Gọi $H$ là trung điểm $AB$ thì $OH \\perp AB$',
        '$AH = \\frac{AB}{2} = 8$',
        'Tam giác $OAH$ vuông tại $H$: $OH^2 + AH^2 = OA^2$',
        '$OH^2 = 100 - 64 = 36 \\Rightarrow OH = 6$',
      ],
      answer: 'OH = 6',
    },
  },
  {
    id: 'dth-3',
    title: 'Hệ phương trình đề thi',
    content: 'Giải hệ phương trình: $$\\begin{cases} x^2 + y^2 = 25 \\\\ x + y = 7 \\end{cases}$$',
    topicId: 'de-tong-hop',
    difficulty: 'advanced',
    hints: ['Từ PT(2): $y = 7 - x$', 'Thế vào PT(1) để được phương trình bậc 2'],
    solution: {
      method: 'Phương pháp thế kết hợp phương trình bậc hai',
      steps: [
        'Từ PT(2): $y = 7 - x$',
        'Thế vào PT(1): $x^2 + (7-x)^2 = 25$',
        '$x^2 + 49 - 14x + x^2 = 25$',
        '$2x^2 - 14x + 24 = 0 \\Rightarrow x^2 - 7x + 12 = 0$',
        '$(x-3)(x-4) = 0 \\Rightarrow x = 3$ hoặc $x = 4$',
        'Nếu $x=3$ thì $y=4$; nếu $x=4$ thì $y=3$',
      ],
      answer: '(x;y) = (3;4) hoặc (4;3)',
    },
  },

  // === CĂN BẬC HAI - BỔ SUNG ===
  {
    id: 'cbh-5',
    title: 'Trục căn thức mẫu liên hợp',
    content: 'Trục căn thức ở mẫu: $D = \\dfrac{4}{\\sqrt{5}+\\sqrt{3}}$',
    topicId: 'can-bac-hai',
    difficulty: 'medium',
    hints: ['Nhân tử và mẫu với $\\sqrt{5}-\\sqrt{3}$', '$(\\sqrt{5}+\\sqrt{3})(\\sqrt{5}-\\sqrt{3}) = 5-3 = 2$'],
    solution: {
      method: 'Nhân với biểu thức liên hợp',
      steps: [
        '$D = \\dfrac{4(\\sqrt{5}-\\sqrt{3})}{(\\sqrt{5}+\\sqrt{3})(\\sqrt{5}-\\sqrt{3})}$',
        '$= \\dfrac{4(\\sqrt{5}-\\sqrt{3})}{5-3} = \\dfrac{4(\\sqrt{5}-\\sqrt{3})}{2}$',
        '$= 2(\\sqrt{5}-\\sqrt{3}) = 2\\sqrt{5}-2\\sqrt{3}$',
      ],
      answer: '$D = 2\\sqrt{5}-2\\sqrt{3}$',
    },
  },
  {
    id: 'cbh-6',
    title: 'Rút gọn biểu thức chứa căn phức tạp',
    content: 'Rút gọn: $E = \\dfrac{\\sqrt{x}+1}{\\sqrt{x}-1} - \\dfrac{\\sqrt{x}-1}{\\sqrt{x}+1}$ với $x \\geq 0, x \\neq 1$',
    topicId: 'can-bac-hai',
    difficulty: 'hard',
    hints: ['Quy đồng mẫu thức $(\\sqrt{x}-1)(\\sqrt{x}+1) = x-1$', 'Khai triển tử số'],
    solution: {
      method: 'Quy đồng và rút gọn',
      steps: [
        'MTC $= (\\sqrt{x}-1)(\\sqrt{x}+1) = x-1$',
        'Tử số: $(\\sqrt{x}+1)^2 - (\\sqrt{x}-1)^2$',
        '$= [(\\sqrt{x}+1)-(\\sqrt{x}-1)][(\\sqrt{x}+1)+(\\sqrt{x}-1)]$',
        '$= 2 \\cdot 2\\sqrt{x} = 4\\sqrt{x}$',
        '$E = \\dfrac{4\\sqrt{x}}{x-1}$',
      ],
      answer: '$E = \\dfrac{4\\sqrt{x}}{x-1}$',
    },
  },
  {
    id: 'cbh-7',
    title: 'So sánh biểu thức chứa căn',
    content: 'So sánh $A = \\sqrt{7}-\\sqrt{3}$ và $B = \\sqrt{5}-1$',
    topicId: 'can-bac-hai',
    difficulty: 'hard',
    hints: ['Xét $A - B$ hoặc so sánh $A^2$ và $B^2$ (chú ý A, B đều dương)'],
    solution: {
      method: 'So sánh bằng cách bình phương',
      steps: [
        '$A = \\sqrt{7}-\\sqrt{3} \\approx 2.646 - 1.732 = 0.914$',
        '$B = \\sqrt{5}-1 \\approx 2.236 - 1 = 1.236$',
        'Chứng minh chặt: $A < B \\Leftrightarrow \\sqrt{7}-\\sqrt{3} < \\sqrt{5}-1$',
        '$\\Leftrightarrow \\sqrt{7}+1 < \\sqrt{5}+\\sqrt{3}$',
        'Bình phương hai vế (cả hai dương): $8+2\\sqrt{7}$ và $8+2\\sqrt{15}$',
        'Vì $\\sqrt{7} < \\sqrt{15}$ nên $A < B$',
      ],
      answer: '$A < B$, tức $\\sqrt{7}-\\sqrt{3} < \\sqrt{5}-1$',
    },
  },
  {
    id: 'cbh-8',
    title: 'Tính căn bậc ba và biểu thức',
    content: 'Tính: $F = \\sqrt[3]{27} + \\sqrt[3]{-8} + \\sqrt[3]{125}$',
    topicId: 'can-bac-hai',
    difficulty: 'easy',
    hints: ['$\\sqrt[3]{27} = 3$, $\\sqrt[3]{-8} = -2$, $\\sqrt[3]{125} = 5$'],
    solution: {
      method: 'Tính trực tiếp căn bậc ba',
      steps: [
        '$\\sqrt[3]{27} = 3$ (vì $3^3 = 27$)',
        '$\\sqrt[3]{-8} = -2$ (vì $(-2)^3 = -8$)',
        '$\\sqrt[3]{125} = 5$ (vì $5^3 = 125$)',
        '$F = 3 + (-2) + 5 = 6$',
      ],
      answer: '$F = 6$',
    },
  },
  {
    id: 'cbh-9',
    title: 'Phương trình chứa căn bậc hai nâng cao',
    content: 'Giải phương trình: $\\sqrt{x^2 - 5x + 6} = x - 2$',
    topicId: 'can-bac-hai',
    difficulty: 'advanced',
    hints: ['Điều kiện: $x^2-5x+6 \\geq 0$ và $x-2 \\geq 0$', 'Bình phương hai vế rồi kiểm tra'],
    solution: {
      method: 'Bình phương hai vế với điều kiện',
      steps: [
        'ĐK: $x-2 \\geq 0 \\Rightarrow x \\geq 2$',
        'Bình phương: $x^2-5x+6 = (x-2)^2 = x^2-4x+4$',
        '$-5x+6 = -4x+4 \\Rightarrow -x = -2 \\Rightarrow x = 2$',
        'Kiểm tra: $\\sqrt{4-10+6} = \\sqrt{0} = 0 = 2-2$ ✓',
      ],
      answer: '$x = 2$',
    },
  },

  // === BIỂU THỨC ĐẠI SỐ - BỔ SUNG ===
  {
    id: 'btds-5',
    title: 'Phân tích bằng phương pháp nhóm',
    content: 'Phân tích thành nhân tử: $x^3 - x^2 - x + 1$',
    topicId: 'bieu-thuc-dai-so',
    difficulty: 'medium',
    hints: ['Nhóm: $(x^3-x^2) - (x-1)$', 'Đặt nhân tử chung mỗi nhóm'],
    solution: {
      method: 'Nhóm hạng tử',
      steps: [
        '$(x^3-x^2) - (x-1)$',
        '$= x^2(x-1) - (x-1)$',
        '$= (x-1)(x^2-1)$',
        '$= (x-1)(x-1)(x+1) = (x-1)^2(x+1)$',
      ],
      answer: '$(x-1)^2(x+1)$',
    },
  },
  {
    id: 'btds-6',
    title: 'Tính giá trị biểu thức bằng hằng đẳng thức',
    content: 'Cho $a + b = 5$ và $ab = 3$. Tính $a^3 + b^3$.',
    topicId: 'bieu-thuc-dai-so',
    difficulty: 'medium',
    hints: ['$a^3+b^3 = (a+b)^3 - 3ab(a+b)$'],
    solution: {
      method: 'Biến đổi theo công thức lập phương tổng',
      steps: [
        '$a^3+b^3 = (a+b)(a^2-ab+b^2)$',
        '$a^2+b^2 = (a+b)^2 - 2ab = 25-6 = 19$',
        '$a^2-ab+b^2 = 19-3 = 16$',
        '$a^3+b^3 = 5 \\cdot 16 = 80$',
      ],
      answer: '$a^3+b^3 = 80$',
    },
  },
  {
    id: 'btds-7',
    title: 'Phép chia đa thức',
    content: 'Chia đa thức $2x^3 - 3x^2 + x - 2$ cho $x-2$.',
    topicId: 'bieu-thuc-dai-so',
    difficulty: 'hard',
    hints: ['Dùng phép chia đa thức hoặc lược đồ Horner', 'Nếu $x=2$ là nghiệm thì chia hết'],
    solution: {
      method: 'Phép chia đa thức',
      steps: [
        'Thử $x=2$: $2(8)-3(4)+2-2 = 16-12+0 = 4 \\neq 0$, không chia hết',
        'Chia: $2x^3 - 3x^2 + x - 2 = (x-2) \\cdot q(x) + r$',
        '$2x^3-3x^2+x-2 \\div (x-2)$: thương $2x^2+x+3$, dư $4$',
        'Kiểm tra: $(x-2)(2x^2+x+3)+4 = 2x^3+x^2+3x-4x^2-2x-6+4 = 2x^3-3x^2+x-2$ ✓',
      ],
      answer: '$2x^3-3x^2+x-2 = (x-2)(2x^2+x+3)+4$',
    },
  },

  // === PHƯƠNG TRÌNH - BỔ SUNG ===
  {
    id: 'pt-5',
    title: 'Phương trình chứa ẩn ở mẫu',
    content: 'Giải phương trình: $\\dfrac{2}{x-1} - \\dfrac{1}{x+1} = \\dfrac{3}{x^2-1}$',
    topicId: 'phuong-trinh',
    difficulty: 'medium',
    hints: ['ĐK: $x \\neq \\pm 1$', 'MTC $= (x-1)(x+1)$'],
    solution: {
      method: 'Quy đồng mẫu',
      steps: [
        'ĐK: $x \\neq \\pm 1$',
        'MTC $= (x-1)(x+1)$',
        '$2(x+1) - (x-1) = 3$',
        '$2x+2-x+1 = 3$',
        '$x+3 = 3 \\Rightarrow x = 0$ (thoả ĐK)',
      ],
      answer: '$x = 0$',
    },
  },
  {
    id: 'pt-6',
    title: 'Hệ phương trình với tham số',
    content: 'Giải và biện luận hệ: $\\begin{cases} mx + y = 2 \\\\ x + my = 1 \\end{cases}$ theo tham số $m$.',
    topicId: 'phuong-trinh',
    difficulty: 'advanced',
    hints: ['Định thức $D = m^2-1$', 'Hệ có nghiệm duy nhất khi $D \\neq 0$'],
    solution: {
      method: 'Giải hệ theo tham số',
      steps: [
        'Từ PT(1): $y = 2-mx$; thế vào PT(2): $x+m(2-mx)=1$',
        '$x+2m-m^2x=1 \\Rightarrow x(1-m^2) = 1-2m$',
        'Nếu $m \\neq \\pm 1$: $x = \\dfrac{1-2m}{1-m^2} = \\dfrac{1-2m}{(1-m)(1+m)} = \\dfrac{1}{1+m}$',
        '$y = 2-m \\cdot \\dfrac{1}{1+m} = \\dfrac{2+2m-m}{1+m} = \\dfrac{m+2}{m+1}$',
        'Nếu $m=1$: $0 = -1$ (vô nghiệm). Nếu $m=-1$: $0 = 3$ (vô nghiệm)',
      ],
      answer: '$m\\neq\\pm1$: $x=\\dfrac{1}{m+1}$, $y=\\dfrac{m+2}{m+1}$; $m=\\pm1$: vô nghiệm',
    },
  },
  {
    id: 'pt-7',
    title: 'Hệ phương trình ba ẩn (dạng đơn giản)',
    content: 'Giải hệ: $\\begin{cases} x+y+z=6 \\\\ x+y=4 \\\\ y+z=5 \\end{cases}$',
    topicId: 'phuong-trinh',
    difficulty: 'hard',
    hints: ['Từ PT(1) và PT(2) suy ra z', 'Thế lại để tìm các ẩn còn lại'],
    solution: {
      method: 'Rút ẩn tuần tự',
      steps: [
        'Từ PT(1) - PT(2): $z = 6-4 = 2$',
        'Từ PT(3): $y = 5-z = 5-2 = 3$',
        'Từ PT(2): $x = 4-y = 4-3 = 1$',
        'Kiểm tra PT(1): $1+3+2=6$ ✓',
      ],
      answer: '$(x;y;z) = (1;3;2)$',
    },
  },

  // === HÀM SỐ - BỔ SUNG ===
  {
    id: 'hsdt-4',
    title: 'Xác định hàm số bậc nhất thỏa điều kiện',
    content: 'Tìm hàm số $y = ax+b$ biết đồ thị song song với $y = 3x-1$ và đi qua $M(2; 5)$.',
    topicId: 'ham-so-do-thi',
    difficulty: 'medium',
    hints: ['Song song: cùng hệ số $a=3$, khác $b$', 'Thế tọa độ $M$ để tìm $b$'],
    solution: {
      method: 'Dùng điều kiện song song',
      steps: [
        'Song song với $y=3x-1$ nên $a=3$',
        'Hàm số: $y = 3x+b$',
        'Thế $M(2;5)$: $5 = 3(2)+b \\Rightarrow b = -1$... nhưng $b \\neq -1$ (phải khác)',
        'Thực ra $b = 5-6 = -1$, nhưng $b=-1$ trùng với đường song song → kiểm tra lại',
        'Nếu $b=-1$ thì trùng với $y=3x-1$, không song song mà chính là một đường. Vậy không có hàm số thỏa mãn...',
        'Xét lại: $M(2;5)$: $y=3(2)-1=5$, tức $M$ nằm trên $y=3x-1$ → không tồn tại đường song song đi qua $M$.',
      ],
      answer: 'Không tồn tại ($M$ nằm trên đường đã cho)',
    },
  },
  {
    id: 'hsdt-5',
    title: 'Tìm tham số để parabol có đỉnh cho trước',
    content: 'Hàm số $y = x^2 - 2mx + m^2 - 1$ có đỉnh tại điểm có tung độ $y_0 = -1$. Tìm $m$.',
    topicId: 'ham-so-do-thi',
    difficulty: 'hard',
    hints: ['Tung độ đỉnh: $y_0 = c - \\dfrac{b^2}{4a}$', 'Với $a=1, b=-2m, c=m^2-1$'],
    solution: {
      method: 'Tính tung độ đỉnh',
      steps: [
        '$a=1, b=-2m, c=m^2-1$',
        'Tung độ đỉnh: $y_0 = m^2-1 - \\dfrac{4m^2}{4} = m^2-1-m^2 = -1$',
        'Vậy với mọi $m$, tung độ đỉnh luôn bằng $-1$.',
      ],
      answer: 'Mọi giá trị $m$ đều thoả mãn',
    },
  },
  {
    id: 'hsdt-6',
    title: 'Tìm giao điểm parabol và đường thẳng',
    content: 'Tìm giao điểm của parabol $y = x^2 - 3x + 2$ và đường thẳng $y = x - 1$.',
    topicId: 'ham-so-do-thi',
    difficulty: 'medium',
    hints: ['Cho $x^2-3x+2 = x-1$', 'Giải phương trình bậc hai'],
    solution: {
      method: 'Giải hệ phương trình',
      steps: [
        '$x^2-3x+2 = x-1$',
        '$x^2-4x+3 = 0$',
        '$(x-1)(x-3)=0 \\Rightarrow x=1$ hoặc $x=3$',
        'Khi $x=1$: $y=0$. Khi $x=3$: $y=2$.',
      ],
      answer: 'Giao điểm $(1;0)$ và $(3;2)$',
    },
  },

  // === PHƯƠNG TRÌNH BẬC HAI - BỔ SUNG ===
  {
    id: 'ptbh-5',
    title: 'Tìm tham số để phương trình có nghiệm kép',
    content: 'Tìm $m$ để phương trình $x^2 - 2(m+1)x + m^2 = 0$ có nghiệm kép.',
    topicId: 'phuong-trinh-bac-hai',
    difficulty: 'medium',
    hints: ['Nghiệm kép khi $\\Delta = 0$', '$\\Delta = [2(m+1)]^2 - 4m^2$'],
    solution: {
      method: 'Đặt Delta = 0',
      steps: [
        '$\\Delta = 4(m+1)^2 - 4m^2 = 0$',
        '$4(m^2+2m+1) - 4m^2 = 0$',
        '$4m^2+8m+4-4m^2=0$',
        '$8m+4=0 \\Rightarrow m=-\\dfrac{1}{2}$',
      ],
      answer: '$m = -\\dfrac{1}{2}$',
    },
  },
  {
    id: 'ptbh-6',
    title: 'Điều kiện để phương trình có hai nghiệm dương',
    content: 'Tìm $m$ để phương trình $x^2 - (m+2)x + 2m - 1 = 0$ có hai nghiệm dương phân biệt.',
    topicId: 'phuong-trinh-bac-hai',
    difficulty: 'hard',
    hints: ['Cần: $\\Delta > 0$, $x_1+x_2 > 0$, $x_1 x_2 > 0$'],
    solution: {
      method: 'Điều kiện nghiệm dương',
      steps: [
        '$x_1+x_2 = m+2 > 0 \\Rightarrow m > -2$',
        '$x_1 x_2 = 2m-1 > 0 \\Rightarrow m > \\dfrac{1}{2}$',
        '$\\Delta = (m+2)^2-4(2m-1) = m^2+4m+4-8m+4 = m^2-4m+8 = (m-2)^2+4 > 0$ (luôn đúng)',
        'Vậy điều kiện là $m > \\dfrac{1}{2}$',
      ],
      answer: '$m > \\dfrac{1}{2}$',
    },
  },
  {
    id: 'ptbh-7',
    title: 'Bài toán tìm hai số qua hệ thức Viète',
    content: 'Tìm hai số biết tổng của chúng là 14 và tổng bình phương là 100.',
    topicId: 'phuong-trinh-bac-hai',
    difficulty: 'medium',
    hints: ['Gọi hai số là $x_1, x_2$: $x_1+x_2=14$, $x_1^2+x_2^2=100$', 'Tìm $x_1 x_2$ từ $(x_1+x_2)^2 = x_1^2+2x_1x_2+x_2^2$'],
    solution: {
      method: 'Áp dụng hệ thức Viète',
      steps: [
        '$x_1+x_2 = 14$, $x_1^2+x_2^2 = 100$',
        '$(x_1+x_2)^2 = x_1^2+2x_1x_2+x_2^2 \\Rightarrow 196 = 100+2x_1x_2$',
        '$x_1 x_2 = 48$',
        'Phương trình: $x^2-14x+48=0 \\Rightarrow (x-6)(x-8)=0$',
        '$x=6$ hoặc $x=8$',
      ],
      answer: 'Hai số là 6 và 8',
    },
  },

  // === HÌNH HỌC PHẲNG - BỔ SUNG ===
  {
    id: 'hhp-4',
    title: 'Tính diện tích hình thang',
    content: 'Hình thang $ABCD$ có $AB \\parallel CD$, $AB=10$ cm, $CD=6$ cm. Đường cao $h=8$ cm. Tính diện tích.',
    topicId: 'hinh-hoc-phang',
    difficulty: 'easy',
    hints: ['$S = \\dfrac{(AB+CD)}{2} \\cdot h$'],
    solution: {
      method: 'Công thức diện tích hình thang',
      steps: [
        '$S = \\dfrac{AB+CD}{2} \\cdot h = \\dfrac{10+6}{2} \\cdot 8 = 8 \\cdot 8 = 64$ cm²',
      ],
      answer: '$S = 64$ cm²',
    },
  },
  {
    id: 'hhp-5',
    title: 'Chứng minh ba điểm thẳng hàng',
    content: 'Cho $\\triangle ABC$ có $M, N$ lần lượt là trung điểm $AB, AC$. Gọi $I$ là trung điểm $MN$. Chứng minh $I$ nằm trên đường trung tuyến từ $A$.',
    topicId: 'hinh-hoc-phang',
    difficulty: 'hard',
    hints: ['Tìm tọa độ I theo A, B, C', 'Đường trung tuyến từ A đến trung điểm BC'],
    solution: {
      method: 'Dùng tọa độ trung điểm',
      steps: [
        'Đặt $A, B, C$ là gốc tọa độ: $M = \\dfrac{A+B}{2}$, $N = \\dfrac{A+C}{2}$',
        '$I = \\dfrac{M+N}{2} = \\dfrac{\\frac{A+B}{2}+\\frac{A+C}{2}}{2} = \\dfrac{A+\\frac{B+C}{2}}{2}$',
        'Gọi $G_{BC} = \\dfrac{B+C}{2}$ là trung điểm $BC$. Thì $I = \\dfrac{A+G_{BC}}{2}$ là trung điểm $A$ và $G_{BC}$.',
        'Vậy $I$ nằm trên đoạn $A G_{BC}$, tức nằm trên đường trung tuyến từ $A$ (đpcm)',
      ],
      answer: '$I$ nằm trên đường trung tuyến từ $A$ của $\\triangle ABC$',
    },
  },
  {
    id: 'hhp-6',
    title: 'Tam giác đồng dạng tính cạnh',
    content: 'Cho $\\triangle ABC \\sim \\triangle DEF$ với tỉ số $k=2$. Biết $DE=5$, $EF=7$, $DF=8$. Tính các cạnh của $\\triangle ABC$.',
    topicId: 'hinh-hoc-phang',
    difficulty: 'easy',
    hints: ['Các cạnh tương ứng tỉ lệ với $k=2$', '$AB = k \\cdot DE$'],
    solution: {
      method: 'Dùng tỉ số đồng dạng',
      steps: [
        '$AB = k \\cdot DE = 2 \\cdot 5 = 10$',
        '$BC = k \\cdot EF = 2 \\cdot 7 = 14$',
        '$AC = k \\cdot DF = 2 \\cdot 8 = 16$',
      ],
      answer: '$AB=10$, $BC=14$, $AC=16$',
    },
  },
  {
    id: 'hhp-7',
    title: 'Tứ giác có đường chéo vuông góc',
    content: 'Tứ giác $ABCD$ có hai đường chéo $AC \\perp BD$. Biết $AC=12$ cm, $BD=10$ cm. Tính diện tích tứ giác.',
    topicId: 'hinh-hoc-phang',
    difficulty: 'medium',
    hints: ['$S = \\dfrac{1}{2} d_1 d_2$ khi hai đường chéo vuông góc'],
    solution: {
      method: 'Công thức diện tích tứ giác có đường chéo vuông góc',
      steps: [
        '$S = \\dfrac{1}{2} \\cdot AC \\cdot BD = \\dfrac{1}{2} \\cdot 12 \\cdot 10 = 60$ cm²',
      ],
      answer: '$S = 60$ cm²',
    },
  },

  // === ĐƯỜNG TRÒN - BỔ SUNG ===
  {
    id: 'dt-4',
    title: 'Tính độ dài cung tròn',
    content: 'Đường tròn có bán kính $R=6$ cm. Tính độ dài cung tròn có số đo góc tâm $60°$.',
    topicId: 'duong-tron',
    difficulty: 'easy',
    hints: ['$l = \\dfrac{\\alpha \\pi R}{180}$ (với $\\alpha$ độ)'],
    solution: {
      method: 'Công thức độ dài cung',
      steps: [
        '$l = \\dfrac{60 \\cdot \\pi \\cdot 6}{180} = \\dfrac{360\\pi}{180} = 2\\pi \\approx 6.28$ cm',
      ],
      answer: '$l = 2\\pi$ cm',
    },
  },
  {
    id: 'dt-5',
    title: 'Tính diện tích hình quạt',
    content: 'Hình quạt có bán kính $R=10$ cm, góc ở tâm $90°$. Tính diện tích hình quạt.',
    topicId: 'duong-tron',
    difficulty: 'easy',
    hints: ['$S_{quạt} = \\dfrac{\\alpha}{360} \\cdot \\pi R^2$'],
    solution: {
      method: 'Công thức diện tích quạt tròn',
      steps: [
        '$S = \\dfrac{90}{360} \\cdot \\pi \\cdot 100 = \\dfrac{1}{4} \\cdot 100\\pi = 25\\pi \\approx 78.5$ cm²',
      ],
      answer: '$S = 25\\pi$ cm²',
    },
  },
  {
    id: 'dt-6',
    title: 'Hai tiếp tuyến từ điểm ngoài',
    content: 'Từ điểm $M$ ngoài đường tròn $(O; R)$, kẻ hai tiếp tuyến $MA$ và $MB$ ($A, B$ là tiếp điểm). Chứng minh $OA \\perp MB$ không đúng, thay vào đó chứng minh $MA = MB$.',
    topicId: 'duong-tron',
    difficulty: 'medium',
    hints: ['Hai tam giác $OAM$ và $OBM$ đồng dạng', '$OA = OB = R$, $OM$ chung, $\\angle OAM = \\angle OBM = 90°$'],
    solution: {
      method: 'Hai tam giác bằng nhau',
      steps: [
        'Xét $\\triangle OAM$ và $\\triangle OBM$:',
        '$OA = OB = R$ (bán kính)',
        '$\\angle OAM = \\angle OBM = 90°$ (tiếp tuyến ⊥ bán kính)',
        '$OM$ chung',
        '$\\Rightarrow \\triangle OAM = \\triangle OBM$ (cạnh huyền-cạnh góc vuông)',
        '$\\Rightarrow MA = MB$ (đpcm)',
      ],
      answer: '$MA = MB$ (hai tiếp tuyến từ ngoài bằng nhau)',
    },
  },
  {
    id: 'dt-7',
    title: 'Góc tạo bởi tiếp tuyến và dây cung',
    content: 'Tại điểm $A$ trên đường tròn $(O)$, kẻ tiếp tuyến $Ax$. Dây $AB$ sao cho $\\angle xAB = 40°$. Tính số đo cung $AB$ (cung nhỏ).',
    topicId: 'duong-tron',
    difficulty: 'hard',
    hints: ['Góc giữa tiếp tuyến và dây cung bằng nửa cung bị chắn', 'Cung $AB = 2 \\cdot \\angle xAB$'],
    solution: {
      method: 'Định lý góc tạo bởi tiếp tuyến và dây',
      steps: [
        'Theo định lý: góc giữa tiếp tuyến và dây cung $= \\dfrac{1}{2}$ cung bị chắn',
        '$\\angle xAB = \\dfrac{1}{2} \\cdot \\overset{\\frown}{AB}$',
        '$40° = \\dfrac{1}{2} \\cdot \\overset{\\frown}{AB}$',
        '$\\overset{\\frown}{AB} = 80°$',
      ],
      answer: 'Cung $AB = 80°$',
    },
  },

  // === HỆ THỨC LƯỢNG - BỔ SUNG ===
  {
    id: 'htl-4',
    title: 'Tính các tỉ số lượng giác từ một giá trị cho trước',
    content: 'Cho $\\sin\\alpha = \\dfrac{3}{5}$ với $0° < \\alpha < 90°$. Tính $\\cos\\alpha$, $\\tan\\alpha$, $\\cot\\alpha$.',
    topicId: 'he-thuc-luong',
    difficulty: 'medium',
    hints: ['$\\cos^2\\alpha = 1 - \\sin^2\\alpha$', '$\\tan\\alpha = \\sin\\alpha/\\cos\\alpha$'],
    solution: {
      method: 'Dùng hệ thức cơ bản',
      steps: [
        '$\\cos^2\\alpha = 1 - \\sin^2\\alpha = 1 - \\dfrac{9}{25} = \\dfrac{16}{25}$',
        '$\\cos\\alpha = \\dfrac{4}{5}$ (vì $0° < \\alpha < 90°$)',
        '$\\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} = \\dfrac{3/5}{4/5} = \\dfrac{3}{4}$',
        '$\\cot\\alpha = \\dfrac{1}{\\tan\\alpha} = \\dfrac{4}{3}$',
      ],
      answer: '$\\cos\\alpha=4/5$, $\\tan\\alpha=3/4$, $\\cot\\alpha=4/3$',
    },
  },
  {
    id: 'htl-5',
    title: 'Bài toán đo chiều cao gián tiếp',
    content: 'Đứng tại điểm $A$ cách chân cột đèn $B$ là 20 m, góc ngẩng đến đỉnh cột $C$ là $60°$. Tính chiều cao cột đèn $BC$.',
    topicId: 'he-thuc-luong',
    difficulty: 'medium',
    hints: ['Tam giác $ABC$ vuông tại $B$', '$\\tan(60°) = BC/AB$'],
    solution: {
      method: 'Tỉ số lượng giác',
      steps: [
        '$\\tan 60° = \\dfrac{BC}{AB}$',
        '$\\sqrt{3} = \\dfrac{BC}{20}$',
        '$BC = 20\\sqrt{3} \\approx 34.64$ m',
      ],
      answer: '$BC = 20\\sqrt{3}$ m',
    },
  },
  {
    id: 'htl-6',
    title: 'Tính góc từ tỉ số lượng giác',
    content: 'Tam giác $ABC$ vuông tại $C$, $AB=13$, $BC=5$, $AC=12$. Tính các góc $A$ và $B$ (làm tròn đến phút).',
    topicId: 'he-thuc-luong',
    difficulty: 'hard',
    hints: ['$\\sin A = BC/AB = 5/13$', 'Tra bảng hoặc dùng máy tính'],
    solution: {
      method: 'Tính góc từ bảng lượng giác',
      steps: [
        '$\\sin A = \\dfrac{BC}{AB} = \\dfrac{5}{13} \\approx 0{,}3846$',
        '$A \\approx 22°37\'$',
        '$B = 90° - A \\approx 67°23\'$',
        'Kiểm tra: $\\sin B = 12/13 \\approx 0{,}9231$ → $B \\approx 67°23\'$ ✓',
      ],
      answer: '$\\angle A \\approx 22°37\'$, $\\angle B \\approx 67°23\'$',
    },
  },

  // === THỐNG KÊ - BỔ SUNG ===
  {
    id: 'tk-4',
    title: 'Tính phương sai và độ lệch chuẩn',
    content: 'Số điểm trong 5 trận bóng: 2, 0, 3, 1, 4. Tính $\\bar{x}$, $s^2$ và $s$.',
    topicId: 'thong-ke',
    difficulty: 'medium',
    hints: ['Tính $\\bar{x}$ trước, rồi tính độ lệch bình phương'],
    solution: {
      method: 'Phương sai và độ lệch chuẩn',
      steps: [
        '$\\bar{x} = (2+0+3+1+4)/5 = 10/5 = 2$',
        '$s^2 = \\dfrac{(2-2)^2+(0-2)^2+(3-2)^2+(1-2)^2+(4-2)^2}{5}$',
        '$= \\dfrac{0+4+1+1+4}{5} = \\dfrac{10}{5} = 2$',
        '$s = \\sqrt{2} \\approx 1.41$',
      ],
      answer: '$\\bar{x}=2$, $s^2=2$, $s=\\sqrt{2}$',
    },
  },
  {
    id: 'tk-5',
    title: 'Bài toán khoảng biến thiên',
    content: 'Dãy số liệu: 12, 15, 18, 10, 14, 16, 20, 11. Tìm giá trị lớn nhất, nhỏ nhất và khoảng biến thiên.',
    topicId: 'thong-ke',
    difficulty: 'easy',
    hints: ['Sắp xếp dãy số tăng dần', 'Khoảng biến thiên = Max - Min'],
    solution: {
      method: 'Thống kê cơ bản',
      steps: [
        'Sắp xếp: 10, 11, 12, 14, 15, 16, 18, 20',
        'Min = 10, Max = 20',
        'Khoảng biến thiên $R = 20 - 10 = 10$',
      ],
      answer: 'Min = 10, Max = 20, R = 10',
    },
  },
  {
    id: 'tk-6',
    title: 'Vẽ và đọc biểu đồ tần suất',
    content: 'Điểm kiểm tra của 30 HS: loại Giỏi (9 HS), Khá (12 HS), TB (7 HS), Yếu (2 HS). Tính tần suất và điểm trung bình ước tính (Giỏi=9, Khá=7, TB=5, Yếu=3).',
    topicId: 'thong-ke',
    difficulty: 'medium',
    hints: ['Tần suất = số học sinh / tổng', 'Điểm TB ước tính = tổng (điểm × HS) / tổng HS'],
    solution: {
      method: 'Tần suất và trung bình ước tính',
      steps: [
        'Tần suất: Giỏi 30%, Khá 40%, TB 23.3%, Yếu 6.7%',
        '$\\bar{x} = \\dfrac{9 \\cdot 9+7 \\cdot 12+5 \\cdot 7+3 \\cdot 2}{30} = \\dfrac{81+84+35+6}{30} = \\dfrac{206}{30} \\approx 6{,}87$',
      ],
      answer: 'Điểm trung bình ước tính $\\approx 6{,}87$',
    },
  },

  // === XÁC SUẤT - BỔ SUNG ===
  {
    id: 'xs-4',
    title: 'Xác suất rút thẻ từ bộ bài',
    content: 'Rút ngẫu nhiên 1 thẻ từ bộ 52 thẻ. Tính xác suất nhận được thẻ có số từ 2 đến 10 (không tính J, Q, K, A).',
    topicId: 'xac-suat',
    difficulty: 'easy',
    hints: ['Mỗi chất có 9 thẻ số (2→10), 4 chất → 36 thẻ số'],
    solution: {
      method: 'Xác suất cổ điển',
      steps: [
        'Số thẻ từ 2→10 mỗi chất: 9 thẻ',
        'Tổng: $4 \\times 9 = 36$ thẻ',
        '$P = \\dfrac{36}{52} = \\dfrac{9}{13}$',
      ],
      answer: '$P = 9/13$',
    },
  },
  {
    id: 'xs-5',
    title: 'Xác suất hộp sản phẩm',
    content: 'Hộp có 10 bóng đèn, trong đó 3 bóng bị lỗi. Lấy ngẫu nhiên 2 bóng. Tính xác suất lấy được ít nhất 1 bóng tốt.',
    topicId: 'xac-suat',
    difficulty: 'hard',
    hints: ['Dùng xác suất bù: $P(\\geq 1$ tốt) $= 1 - P($toàn lỗi$)$', 'Tổng số cách chọn 2 từ 10: $C_{10}^2$'],
    solution: {
      method: 'Dùng biến cố bù',
      steps: [
        'Tổng cách chọn 2 bóng từ 10: $C_{10}^2 = 45$',
        'Cách chọn 2 bóng lỗi từ 3: $C_3^2 = 3$',
        '$P(\\text{toàn lỗi}) = 3/45 = 1/15$',
        '$P(\\geq 1 \\text{ tốt}) = 1 - 1/15 = 14/15$',
      ],
      answer: '$P = 14/15$',
    },
  },
  {
    id: 'xs-6',
    title: 'Xác suất có điều kiện cơ bản',
    content: 'Lớp có 15 HS giỏi, trong đó 6 em giỏi cả Toán lẫn Văn. Biết một HS được chọn ngẫu nhiên giỏi Toán. Xác suất để HS đó cũng giỏi Văn là bao nhiêu? (Biết có 9 HS giỏi Toán)',
    topicId: 'xac-suat',
    difficulty: 'medium',
    hints: ['$P(V|T) = P(V \\cap T)/P(T)$'],
    solution: {
      method: 'Xác suất có điều kiện',
      steps: [
        '$P(T) = 9/15 = 3/5$',
        '$P(T \\cap V) = 6/15 = 2/5$',
        '$P(V|T) = \\dfrac{P(T \\cap V)}{P(T)} = \\dfrac{2/5}{3/5} = \\dfrac{2}{3}$',
      ],
      answer: '$P(V|T) = 2/3$',
    },
  },
  {
    id: 'xs-7',
    title: 'Xác suất trong thực nghiệm',
    content: 'Gieo đồng xu 100 lần, kết quả ngửa xuất hiện 43 lần. Tính xác suất thực nghiệm của mặt ngửa. Xác suất lý thuyết là bao nhiêu?',
    topicId: 'xac-suat',
    difficulty: 'easy',
    hints: ['Xác suất thực nghiệm = số lần xuất hiện / tổng số thử nghiệm'],
    solution: {
      method: 'Xác suất thực nghiệm',
      steps: [
        'Xác suất thực nghiệm: $f = 43/100 = 0.43$',
        'Xác suất lý thuyết: $P = 1/2 = 0.5$',
        'Khi số lần thử lớn, xác suất thực nghiệm tiến dần đến xác suất lý thuyết',
      ],
      answer: 'Thực nghiệm: 0,43; Lý thuyết: 0,5',
    },
  },

  // === BÀI TOÁN THỰC TẾ - BỔ SUNG ===
  {
    id: 'btt-4',
    title: 'Bài toán tuổi',
    content: 'Hiện nay tuổi cha gấp 4 lần tuổi con. Sau 10 năm, tuổi cha gấp $\\dfrac{5}{2}$ lần tuổi con. Tính tuổi mỗi người hiện nay.',
    topicId: 'bai-toan-thuc-te',
    difficulty: 'medium',
    hints: ['Gọi tuổi con hiện nay là $x$', 'Tuổi cha: $4x$'],
    solution: {
      method: 'Lập phương trình',
      steps: [
        'Gọi tuổi con hiện nay là $x$ (tuổi)',
        'Tuổi cha hiện nay: $4x$',
        'Sau 10 năm: $(4x+10) = \\dfrac{5}{2}(x+10)$',
        '$8x+20 = 5x+50 \\Rightarrow 3x = 30 \\Rightarrow x = 10$',
        'Tuổi con: 10, tuổi cha: 40',
      ],
      answer: 'Con 10 tuổi, cha 40 tuổi',
    },
  },
  {
    id: 'btt-5',
    title: 'Bài toán dạng phần trăm giảm giá',
    content: 'Một cửa hàng giảm giá 20% cho một sản phẩm. Sau khi giảm, giá sản phẩm là 480.000 đồng. Hỏi giá gốc là bao nhiêu?',
    topicId: 'bai-toan-thuc-te',
    difficulty: 'easy',
    hints: ['Giá sau giảm $= 80\\%$ giá gốc'],
    solution: {
      method: 'Tính giá gốc',
      steps: [
        'Gọi giá gốc là $x$ (đồng)',
        'Sau giảm 20%: $x \\cdot 80\\% = 480000$',
        '$x = \\dfrac{480000}{0.8} = 600000$ đồng',
      ],
      answer: 'Giá gốc: 600.000 đồng',
    },
  },
  {
    id: 'btt-6',
    title: 'Bài toán công việc hai tổ',
    content: 'Tổ A làm xong công việc trong 8 ngày, tổ B trong 12 ngày. Hai tổ cùng làm thì xong sau bao nhiêu ngày?',
    topicId: 'bai-toan-thuc-te',
    difficulty: 'medium',
    hints: ['1 ngày tổ A làm $1/8$, tổ B làm $1/12$', 'Cộng phân số năng suất'],
    solution: {
      method: 'Cộng năng suất',
      steps: [
        'Mỗi ngày hai tổ làm: $\\dfrac{1}{8}+\\dfrac{1}{12} = \\dfrac{3}{24}+\\dfrac{2}{24} = \\dfrac{5}{24}$ công việc',
        'Số ngày hoàn thành: $\\dfrac{1}{5/24} = \\dfrac{24}{5} = 4{,}8$ ngày',
      ],
      answer: '$4{,}8$ ngày (4 ngày 19 giờ 12 phút)',
    },
  },
  {
    id: 'btt-7',
    title: 'Bài toán hình học thực tế',
    content: 'Mảnh đất hình thang, đáy lớn 30 m, đáy nhỏ 20 m, chiều cao 15 m. Tính diện tích và giá trị mảnh đất nếu 1 m² = 5 triệu đồng.',
    topicId: 'bai-toan-thuc-te',
    difficulty: 'medium',
    hints: ['Diện tích hình thang: $S = \\dfrac{(a+b)}{2} \\cdot h$'],
    solution: {
      method: 'Tính diện tích và giá trị',
      steps: [
        '$S = \\dfrac{30+20}{2} \\cdot 15 = 25 \\cdot 15 = 375$ m²',
        'Giá trị: $375 \\times 5 = 1875$ triệu đồng',
      ],
      answer: '$S = 375$ m², giá trị $= 1875$ triệu đồng',
    },
  },

  // === ĐỀ TỔNG HỢP - BỔ SUNG ===
  {
    id: 'dth-4',
    title: 'Rút gọn biểu thức chứa căn (đề thi dạng chuẩn)',
    content: 'Cho $A = \\left(\\dfrac{\\sqrt{x}+1}{\\sqrt{x}-1} + \\dfrac{\\sqrt{x}-1}{\\sqrt{x}+1}\\right) : \\dfrac{\\sqrt{x}}{\\sqrt{x}-1}$ với $x>0, x\\neq 1$. Rút gọn A, rồi tính A khi $x=9$.',
    topicId: 'de-tong-hop',
    difficulty: 'advanced',
    hints: ['Quy đồng biểu thức trong ngoặc', 'Đổi ÷ thành ×'],
    solution: {
      method: 'Rút gọn phân thức chứa căn',
      steps: [
        'Biểu thức trong ngoặc: $\\dfrac{(\\sqrt{x}+1)^2+(\\sqrt{x}-1)^2}{(\\sqrt{x}-1)(\\sqrt{x}+1)} = \\dfrac{2x+2}{x-1} = \\dfrac{2(x+1)}{x-1}$',
        '$A = \\dfrac{2(x+1)}{x-1} \\cdot \\dfrac{\\sqrt{x}-1}{\\sqrt{x}} = \\dfrac{2(x+1)(\\sqrt{x}-1)}{(\\sqrt{x}-1)(\\sqrt{x}+1)\\sqrt{x}}$',
        '$= \\dfrac{2(x+1)}{(\\sqrt{x}+1)\\sqrt{x}}$',
        'Khi $x=9$: $A = \\dfrac{2 \\cdot 10}{4 \\cdot 3} = \\dfrac{20}{12} = \\dfrac{5}{3}$',
      ],
      answer: '$A = \\dfrac{2(x+1)}{\\sqrt{x}(\\sqrt{x}+1)}$; khi $x=9$: $A=\\dfrac{5}{3}$',
    },
  },
  {
    id: 'dth-5',
    title: 'Bài toán thực tế dạng thi (chuyển động ngược chiều)',
    content: 'Hai người đi xe đạp khởi hành cùng lúc từ hai điểm A và B cách nhau 60 km, đi ngược chiều nhau. Sau 2 giờ họ gặp nhau. Vận tốc người thứ nhất nhanh hơn người thứ hai 5 km/h. Tính vận tốc mỗi người.',
    topicId: 'de-tong-hop',
    difficulty: 'medium',
    hints: ['Tổng quãng đường hai người đi = 60 km', 'Gọi vận tốc người 2 là $v$'],
    solution: {
      method: 'Lập hệ phương trình',
      steps: [
        'Gọi vận tốc người 2 là $v$ (km/h), người 1 là $v+5$',
        'Sau 2 giờ: $2(v+5)+2v = 60$',
        '$2v+10+2v=60 \\Rightarrow 4v=50 \\Rightarrow v=12{,}5$',
        'Người 2: 12,5 km/h; người 1: 17,5 km/h',
      ],
      answer: 'Người 1: 17,5 km/h; người 2: 12,5 km/h',
    },
  },
  {
    id: 'dth-6',
    title: 'Hệ thức lượng đề thi tổng hợp',
    content: 'Cho tam giác $ABC$ vuông tại $A$, đường cao $AH$. Biết $AB=6$, $AC=8$. Tính $AH$, $BH$, $HC$ và chứng minh $\\dfrac{1}{AH^2} = \\dfrac{1}{AB^2}+\\dfrac{1}{AC^2}$.',
    topicId: 'de-tong-hop',
    difficulty: 'advanced',
    hints: ['Tính $BC$ trước bằng Pythagoras', '$AH = AB \\cdot AC/BC$'],
    solution: {
      method: 'Hệ thức lượng và chứng minh',
      steps: [
        '$BC = \\sqrt{36+64} = 10$',
        '$AH = \\dfrac{AB \\cdot AC}{BC} = \\dfrac{6 \\cdot 8}{10} = \\dfrac{48}{10} = \\dfrac{24}{5}$',
        '$BH = \\dfrac{AB^2}{BC} = \\dfrac{36}{10} = \\dfrac{18}{5}$; $HC = \\dfrac{AC^2}{BC} = \\dfrac{64}{10} = \\dfrac{32}{5}$',
        'CM: $\\dfrac{1}{AH^2} = \\dfrac{BC^2}{AB^2 \\cdot AC^2} = \\dfrac{AB^2+AC^2}{AB^2 \\cdot AC^2} = \\dfrac{1}{AC^2}+\\dfrac{1}{AB^2}$ (đpcm)',
      ],
      answer: '$AH=24/5$, $BH=18/5$, $HC=32/5$; đã CM hệ thức',
    },
  },
]
