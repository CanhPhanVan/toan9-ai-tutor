export interface TheoryFormula {
  name: string
  formula: string
  note: string
}

export interface TheoryExample {
  problem: string
  solution: {
    steps: string[]
    answer: string
  }
}

export interface TopicTheory {
  topicId: string
  summary: string[]
  formulas: TheoryFormula[]
  examples: TheoryExample[]
  commonMistakes: string[]
}

export const THEORY: TopicTheory[] = [
  {
    topicId: 'can-bac-hai',
    summary: [
      'Căn bậc hai của số $a \\geq 0$ là số $x \\geq 0$ sao cho $x^2 = a$, ký hiệu $\\sqrt{a}$.',
      'Hằng đẳng thức: $\\sqrt{a^2} = |a|$ (không phải $a$).',
      'Có thể đưa thừa số ra ngoài/vào trong dấu căn: $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$ (với $a, b \\geq 0$).',
      'Trục căn thức ở mẫu: nhân tử và mẫu với biểu thức liên hợp.',
      'Căn bậc ba $\\sqrt[3]{a}$ xác định với mọi số thực $a$.',
    ],
    formulas: [
      { name: 'Định nghĩa căn bậc hai', formula: '$\\sqrt{a} = x \\geq 0$ khi $x^2 = a\\ (a \\geq 0)$', note: 'a phải không âm' },
      { name: 'Hằng đẳng thức căn', formula: '$\\sqrt{a^2} = |a|$', note: 'Kết quả luôn không âm' },
      { name: 'Tích dưới dấu căn', formula: '$\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$', note: 'a, b ≥ 0' },
      { name: 'Thương dưới dấu căn', formula: '$\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$', note: 'a ≥ 0, b > 0' },
      { name: 'Đưa thừa số ra ngoài', formula: '$\\sqrt{a^2 \\cdot b} = a\\sqrt{b}$', note: 'a ≥ 0, b ≥ 0' },
      { name: 'Trục căn thức đơn giản', formula: '$\\dfrac{a}{\\sqrt{b}} = \\dfrac{a\\sqrt{b}}{b}$', note: 'b > 0' },
      { name: 'Trục căn thức liên hợp', formula: '$\\dfrac{a}{\\sqrt{b}+\\sqrt{c}} = \\dfrac{a(\\sqrt{b}-\\sqrt{c})}{b-c}$', note: 'b ≠ c' },
      { name: 'Căn bậc ba', formula: '$\\sqrt[3]{a} = x$ khi $x^3 = a$', note: 'Xác định với mọi a thực' },
    ],
    examples: [
      {
        problem: 'Rút gọn biểu thức: $A = \\sqrt{75} - \\sqrt{12} + \\sqrt{27}$',
        solution: {
          steps: [
            '$\\sqrt{75} = \\sqrt{25 \\cdot 3} = 5\\sqrt{3}$',
            '$\\sqrt{12} = \\sqrt{4 \\cdot 3} = 2\\sqrt{3}$',
            '$\\sqrt{27} = \\sqrt{9 \\cdot 3} = 3\\sqrt{3}$',
            '$A = 5\\sqrt{3} - 2\\sqrt{3} + 3\\sqrt{3} = 6\\sqrt{3}$',
          ],
          answer: '$A = 6\\sqrt{3}$',
        },
      },
      {
        problem: 'Trục căn thức ở mẫu: $B = \\dfrac{5}{\\sqrt{3}-1}$',
        solution: {
          steps: [
            'Nhân tử và mẫu với biểu thức liên hợp $\\sqrt{3}+1$:',
            '$B = \\dfrac{5(\\sqrt{3}+1)}{(\\sqrt{3}-1)(\\sqrt{3}+1)} = \\dfrac{5(\\sqrt{3}+1)}{3-1}$',
            '$B = \\dfrac{5(\\sqrt{3}+1)}{2}$',
          ],
          answer: '$B = \\dfrac{5\\sqrt{3}+5}{2}$',
        },
      },
      {
        problem: 'Giải phương trình: $\\sqrt{2x+1} = 5$',
        solution: {
          steps: [
            'Điều kiện: $2x+1 \\geq 0 \\Rightarrow x \\geq -\\dfrac{1}{2}$',
            'Bình phương hai vế: $2x+1 = 25$',
            '$2x = 24 \\Rightarrow x = 12$',
            'Kiểm tra: $\\sqrt{2(12)+1} = \\sqrt{25} = 5$ ✓',
          ],
          answer: '$x = 12$',
        },
      },
    ],
    commonMistakes: [
      'Viết $\\sqrt{a^2} = a$ thay vì $|a|$ — sai khi $a < 0$.',
      'Nhầm $\\sqrt{a+b} = \\sqrt{a}+\\sqrt{b}$ — KHÔNG đúng, ví dụ $\\sqrt{9+16} \\neq 3+4$.',
      'Quên điều kiện xác định khi giải phương trình chứa căn.',
    ],
  },

  {
    topicId: 'bieu-thuc-dai-so',
    summary: [
      'Bảy hằng đẳng thức đáng nhớ là công cụ cơ bản để khai triển và phân tích.',
      'Phân tích đa thức thành nhân tử bằng: đặt nhân tử chung, dùng HĐT, nhóm hạng tử, tách.',
      'Rút gọn phân thức: phân tích tử và mẫu rồi rút nhân tử chung.',
      'Các phép tính phân thức tương tự phân số (quy đồng, cộng, trừ, nhân, chia).',
      'Điều kiện xác định của phân thức là mẫu thức khác 0.',
    ],
    formulas: [
      { name: '$(a+b)^2$', formula: '$(a+b)^2 = a^2 + 2ab + b^2$', note: 'HĐT bình phương tổng' },
      { name: '$(a-b)^2$', formula: '$(a-b)^2 = a^2 - 2ab + b^2$', note: 'HĐT bình phương hiệu' },
      { name: '$(a+b)(a-b)$', formula: '$(a+b)(a-b) = a^2 - b^2$', note: 'HĐT hiệu hai bình phương' },
      { name: '$(a+b)^3$', formula: '$(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$', note: 'HĐT lập phương tổng' },
      { name: '$(a-b)^3$', formula: '$(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3$', note: 'HĐT lập phương hiệu' },
      { name: '$a^3+b^3$', formula: '$a^3+b^3 = (a+b)(a^2-ab+b^2)$', note: 'Tổng hai lập phương' },
      { name: '$a^3-b^3$', formula: '$a^3-b^3 = (a-b)(a^2+ab+b^2)$', note: 'Hiệu hai lập phương' },
    ],
    examples: [
      {
        problem: 'Phân tích thành nhân tử: $2x^3 - 8x$',
        solution: {
          steps: [
            'Đặt nhân tử chung $2x$: $2x^3 - 8x = 2x(x^2 - 4)$',
            'Dùng HĐT hiệu hai bình phương: $x^2 - 4 = (x-2)(x+2)$',
            'Kết quả: $2x(x-2)(x+2)$',
          ],
          answer: '$2x(x-2)(x+2)$',
        },
      },
      {
        problem: 'Rút gọn phân thức: $\\dfrac{x^2-9}{x^2+5x+6}$',
        solution: {
          steps: [
            'Tử số: $x^2-9 = (x-3)(x+3)$',
            'Mẫu số: $x^2+5x+6 = (x+2)(x+3)$',
            '$\\dfrac{(x-3)(x+3)}{(x+2)(x+3)} = \\dfrac{x-3}{x+2}$ (với $x \\neq -3$)',
          ],
          answer: '$\\dfrac{x-3}{x+2}$, điều kiện $x \\neq -3, x \\neq -2$',
        },
      },
      {
        problem: 'Tính: $\\dfrac{x}{x-2} + \\dfrac{4}{x+2} - \\dfrac{8}{x^2-4}$',
        solution: {
          steps: [
            'MTC $= (x-2)(x+2)$',
            '$= \\dfrac{x(x+2) + 4(x-2) - 8}{(x-2)(x+2)}$',
            '$= \\dfrac{x^2+2x+4x-8-8}{(x-2)(x+2)} = \\dfrac{x^2+6x-16}{(x-2)(x+2)}$',
            '$= \\dfrac{(x+8)(x-2)}{(x-2)(x+2)} = \\dfrac{x+8}{x+2}$',
          ],
          answer: '$\\dfrac{x+8}{x+2}$ (với $x \\neq \\pm 2$)',
        },
      },
    ],
    commonMistakes: [
      'Nhầm dấu: $(a-b)^2 = a^2 - 2ab + b^2$, không phải $a^2 - b^2$.',
      'Rút gọn sai: $\\dfrac{a+b}{a} \\neq b$ — chỉ rút được nhân tử chung, không phải hạng tử cộng.',
      'Quên điều kiện xác định của phân thức khi mẫu có thể bằng 0.',
    ],
  },

  {
    topicId: 'phuong-trinh',
    summary: [
      'Phương trình bậc nhất $ax + b = 0$ ($a \\neq 0$) có nghiệm duy nhất $x = -b/a$.',
      'Giải hệ 2 phương trình 2 ẩn bằng phương pháp thế hoặc cộng đại số.',
      'Phương trình chứa ẩn ở mẫu: phải tìm điều kiện xác định trước.',
      'Phương trình tích $A \\cdot B = 0 \\Leftrightarrow A = 0$ hoặc $B = 0$.',
      'Hệ phương trình có thể vô nghiệm, nghiệm duy nhất, hoặc vô số nghiệm.',
    ],
    formulas: [
      { name: 'PT bậc nhất', formula: '$ax + b = 0 \\Rightarrow x = -\\dfrac{b}{a}\\ (a \\neq 0)$', note: 'Nghiệm duy nhất' },
      { name: 'Phương pháp thế', formula: 'Từ PT(1) biểu diễn $y$ theo $x$, thế vào PT(2)', note: 'Hệ 2 ẩn' },
      { name: 'Phương pháp cộng', formula: 'Nhân hệ số rồi cộng/trừ 2 PT để khử 1 ẩn', note: 'Hệ 2 ẩn' },
      { name: 'PT tích', formula: '$A \\cdot B = 0 \\Leftrightarrow A=0$ hoặc $B=0$', note: 'Phân tích nhân tử trước' },
    ],
    examples: [
      {
        problem: 'Giải hệ phương trình: $\\begin{cases} 2x + 3y = 7 \\\\ x - y = 1 \\end{cases}$',
        solution: {
          steps: [
            'Từ PT(2): $x = 1 + y$',
            'Thế vào PT(1): $2(1+y)+3y = 7$',
            '$2 + 2y + 3y = 7 \\Rightarrow 5y = 5 \\Rightarrow y = 1$',
            '$x = 1 + 1 = 2$',
          ],
          answer: '$(x; y) = (2; 1)$',
        },
      },
      {
        problem: 'Giải phương trình: $\\dfrac{x+2}{x-1} - \\dfrac{x-2}{x+1} = \\dfrac{4}{x^2-1}$',
        solution: {
          steps: [
            'ĐK: $x \\neq \\pm 1$. MTC $= (x-1)(x+1)$',
            '$(x+2)(x+1) - (x-2)(x-1) = 4$',
            '$(x^2+3x+2) - (x^2-3x+2) = 4$',
            '$6x = 4 \\Rightarrow x = \\dfrac{2}{3}$ (thoả ĐK)',
          ],
          answer: '$x = \\dfrac{2}{3}$',
        },
      },
      {
        problem: 'Giải phương trình tích: $(2x-3)(x+1) = 0$',
        solution: {
          steps: [
            '$2x - 3 = 0$ hoặc $x + 1 = 0$',
            '$x = \\dfrac{3}{2}$ hoặc $x = -1$',
          ],
          answer: '$x = \\dfrac{3}{2}$ hoặc $x = -1$',
        },
      },
    ],
    commonMistakes: [
      'Nhân hai vế phương trình chứa ẩn ở mẫu với MTC mà quên kiểm tra điều kiện xác định.',
      'Giải hệ bằng phương pháp cộng nhưng không nhân đúng hệ số để triệt tiêu ẩn.',
      'Chuyển vế không đổi dấu hạng tử.',
    ],
  },

  {
    topicId: 'ham-so-do-thi',
    summary: [
      'Hàm số bậc nhất $y = ax + b$ ($a \\neq 0$): đồ thị là đường thẳng, $a$ là hệ số góc.',
      'Hàm số bậc hai $y = ax^2 + bx + c$ ($a \\neq 0$): đồ thị là parabol.',
      'Đỉnh parabol: $x_0 = -b/(2a)$, $y_0 = f(x_0)$; trục đối xứng $x = x_0$.',
      'Hai đường thẳng song song khi $a_1 = a_2$, $b_1 \\neq b_2$; cắt nhau khi $a_1 \\neq a_2$.',
      'Parabol có $a > 0$ quay lên trên, $a < 0$ quay xuống dưới.',
    ],
    formulas: [
      { name: 'Hàm bậc nhất', formula: '$y = ax + b\\ (a \\neq 0)$', note: 'Đường thẳng, a là hệ số góc' },
      { name: 'Đỉnh parabol', formula: '$x_0 = -\\dfrac{b}{2a},\\quad y_0 = -\\dfrac{b^2-4ac}{4a}$', note: 'Đỉnh I(x₀; y₀)' },
      { name: 'Trục đối xứng', formula: '$x = -\\dfrac{b}{2a}$', note: 'Parabol đối xứng qua trục này' },
      { name: 'Giao với trục Ox', formula: 'Giải $ax^2+bx+c=0$', note: 'Δ ≥ 0 mới có giao' },
      { name: 'Giao với trục Oy', formula: '$x=0 \\Rightarrow y=c$', note: 'Điểm (0; c)' },
    ],
    examples: [
      {
        problem: 'Tìm hàm số $y = ax + b$ đi qua $A(1; 3)$ và $B(-2; -3)$.',
        solution: {
          steps: [
            'Thế $A(1;3)$: $a + b = 3$ ...(1)',
            'Thế $B(-2;-3)$: $-2a + b = -3$ ...(2)',
            'Trừ (1)-(2): $3a = 6 \\Rightarrow a = 2$',
            'Thế lại: $b = 3 - 2 = 1$',
          ],
          answer: '$y = 2x + 1$',
        },
      },
      {
        problem: 'Với $y = -x^2 + 4x - 3$, tìm đỉnh, trục đối xứng và giao điểm với trục tọa độ.',
        solution: {
          steps: [
            '$a=-1, b=4, c=-3$',
            'Đỉnh: $x_0 = -4/(2 \\cdot (-1)) = 2$; $y_0 = -4+8-3 = 1$ → $I(2;1)$',
            'Trục đối xứng: $x = 2$',
            'Giao Oy: $x=0 \\Rightarrow y=-3$, điểm $(0;-3)$',
            'Giao Ox: $-x^2+4x-3=0 \\Rightarrow x^2-4x+3=0 \\Rightarrow (x-1)(x-3)=0$, điểm $(1;0)$ và $(3;0)$',
          ],
          answer: 'Đỉnh $I(2;1)$, trục $x=2$, giao Oy tại $(0;-3)$, giao Ox tại $(1;0)$ và $(3;0)$',
        },
      },
      {
        problem: 'Tìm điểm giao nhau của $y = 2x+1$ và $y = -x+4$.',
        solution: {
          steps: [
            'Cho $2x+1 = -x+4$',
            '$3x = 3 \\Rightarrow x = 1$',
            '$y = 2(1)+1 = 3$',
          ],
          answer: 'Giao điểm $(1; 3)$',
        },
      },
    ],
    commonMistakes: [
      'Nhầm hệ số góc âm với đường thẳng đồng biến — đường thẳng $y = -2x+1$ nghịch biến.',
      'Tính sai tọa độ đỉnh parabol, đặc biệt khi $a$ âm.',
      'Quên rằng giao với Ox cần $\\Delta \\geq 0$, nếu $\\Delta < 0$ parabol không cắt Ox.',
    ],
  },

  {
    topicId: 'phuong-trinh-bac-hai',
    summary: [
      'Phương trình bậc hai $ax^2 + bx + c = 0$ ($a \\neq 0$) giải bằng công thức nghiệm.',
      '$\\Delta = b^2 - 4ac$: $\\Delta > 0$ có 2 nghiệm, $\\Delta = 0$ nghiệm kép, $\\Delta < 0$ vô nghiệm.',
      'Hệ thức Viète: $x_1 + x_2 = -b/a$ và $x_1 \\cdot x_2 = c/a$.',
      'Nhận dạng nhanh: nếu $a+b+c=0$ thì $x_1=1$; nếu $a-b+c=0$ thì $x_1=-1$.',
      'Dùng hệ thức Viète lập phương trình khi biết tổng và tích các nghiệm.',
    ],
    formulas: [
      { name: 'Công thức nghiệm', formula: '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$', note: 'Δ = b² - 4ac' },
      { name: 'Công thức nghiệm thu gọn', formula: "$x = \\dfrac{-b' \\pm \\sqrt{\\Delta'}}{a}$", note: "b = 2b', Δ' = b'²- ac" },
      { name: 'Viète 1', formula: '$x_1 + x_2 = -\\dfrac{b}{a}$', note: 'Tổng hai nghiệm' },
      { name: 'Viète 2', formula: '$x_1 \\cdot x_2 = \\dfrac{c}{a}$', note: 'Tích hai nghiệm' },
      { name: 'Lập PT từ nghiệm', formula: '$x^2 - Sx + P = 0$', note: 'S = x₁+x₂, P = x₁·x₂' },
    ],
    examples: [
      {
        problem: 'Giải phương trình: $2x^2 - 7x + 3 = 0$',
        solution: {
          steps: [
            '$a=2, b=-7, c=3$',
            "$\\Delta = 49 - 24 = 25 > 0 \\Rightarrow \\sqrt{\\Delta}=5$",
            '$x_1 = \\dfrac{7+5}{4} = 3$; $x_2 = \\dfrac{7-5}{4} = \\dfrac{1}{2}$',
          ],
          answer: '$x_1 = 3$, $x_2 = \\dfrac{1}{2}$',
        },
      },
      {
        problem: 'Cho $x^2 - 5x + k = 0$ có hai nghiệm $x_1, x_2$ thoả $x_1^2 + x_2^2 = 13$. Tìm $k$.',
        solution: {
          steps: [
            'Theo Viète: $x_1+x_2 = 5$, $x_1 x_2 = k$',
            '$x_1^2+x_2^2 = (x_1+x_2)^2 - 2x_1 x_2 = 25 - 2k = 13$',
            '$2k = 12 \\Rightarrow k = 6$',
            'Kiểm tra: $\\Delta = 25-24 = 1 > 0$ ✓',
          ],
          answer: '$k = 6$',
        },
      },
      {
        problem: 'Lập phương trình bậc hai có hai nghiệm là $x_1 = 2+\\sqrt{3}$, $x_2 = 2-\\sqrt{3}$.',
        solution: {
          steps: [
            '$S = x_1+x_2 = 4$',
            '$P = x_1 x_2 = (2+\\sqrt{3})(2-\\sqrt{3}) = 4-3 = 1$',
            'Phương trình: $x^2 - 4x + 1 = 0$',
          ],
          answer: '$x^2 - 4x + 1 = 0$',
        },
      },
    ],
    commonMistakes: [
      'Tính $\\Delta = b^2 + 4ac$ thay vì $b^2 - 4ac$.',
      'Dùng công thức thu gọn khi $b$ lẻ (không phải $b = 2b\'$).',
      'Khi dùng Viète để tìm thêm điều kiện, quên kiểm tra $\\Delta \\geq 0$ để đảm bảo PT thực sự có nghiệm.',
    ],
  },

  {
    topicId: 'hinh-hoc-phang',
    summary: [
      'Hai tam giác đồng dạng (AA, SSS, SAS): tỉ số các cạnh tương ứng bằng nhau.',
      'Định lý Thales: $DE \\parallel BC \\Leftrightarrow \\dfrac{AD}{DB} = \\dfrac{AE}{EC}$.',
      'Đường trung bình tam giác song song với cạnh thứ ba và bằng nửa cạnh đó.',
      'Diện tích tam giác: $S = \\dfrac{1}{2} \\cdot a \\cdot h_a$; tứ giác: cần phân tách.',
      'Định lý Pythagoras: $BC^2 = AB^2 + AC^2$ trong tam giác vuông tại $A$.',
    ],
    formulas: [
      { name: 'Định lý Thales', formula: '$\\dfrac{AD}{DB} = \\dfrac{AE}{EC}$ khi $DE \\parallel BC$', note: 'D thuộc AB, E thuộc AC' },
      { name: 'Đồng dạng AA', formula: 'Hai tam giác có hai góc bằng nhau → đồng dạng', note: 'Tỉ số k = cạnh tương ứng' },
      { name: 'Diện tích tam giác', formula: '$S = \\dfrac{1}{2} \\cdot a \\cdot h$', note: 'a là cạnh đáy, h là chiều cao' },
      { name: 'Pythagoras', formula: '$c^2 = a^2 + b^2$', note: 'Tam giác vuông, c là cạnh huyền' },
      { name: 'Đường trung bình', formula: '$MN \\parallel BC,\\quad MN = \\dfrac{BC}{2}$', note: 'M, N là trung điểm AB, AC' },
    ],
    examples: [
      {
        problem: 'Cho $\\triangle ABC$ có $DE \\parallel BC$, $AD=3$, $DB=2$, $BC=10$. Tính $DE$.',
        solution: {
          steps: [
            '$\\triangle ADE \\sim \\triangle ABC$ (góc $A$ chung, $DE \\parallel BC$ nên góc $ADE$ = góc $ABC$)',
            'Tỉ số đồng dạng: $k = \\dfrac{AD}{AB} = \\dfrac{3}{5}$',
            '$DE = k \\cdot BC = \\dfrac{3}{5} \\cdot 10 = 6$',
          ],
          answer: '$DE = 6$',
        },
      },
      {
        problem: 'Tam giác $ABC$ có $AB=6$, $AC=8$, $\\angle A=90°$. Tính $BC$ và diện tích.',
        solution: {
          steps: [
            '$BC^2 = AB^2+AC^2 = 36+64 = 100 \\Rightarrow BC=10$',
            '$S = \\dfrac{1}{2} \\cdot AB \\cdot AC = \\dfrac{1}{2} \\cdot 6 \\cdot 8 = 24$ cm²',
          ],
          answer: '$BC = 10$ cm, $S = 24$ cm²',
        },
      },
      {
        problem: 'Hình thang $ABCD$ có $AB \\parallel CD$, $AB=12$, $CD=6$, $h=5$. Tính diện tích.',
        solution: {
          steps: [
            'Diện tích hình thang: $S = \\dfrac{(AB+CD)}{2} \\cdot h$',
            '$S = \\dfrac{(12+6)}{2} \\cdot 5 = 9 \\cdot 5 = 45$ cm²',
          ],
          answer: '$S = 45$ cm²',
        },
      },
    ],
    commonMistakes: [
      'Nhầm thứ tự đỉnh khi viết tam giác đồng dạng — $\\triangle ABC \\sim \\triangle DEF$ nghĩa là $A\\leftrightarrow D$, $B\\leftrightarrow E$, $C\\leftrightarrow F$.',
      'Áp dụng định lý Thales sai chiều: $\\dfrac{AD}{AB}$ chứ không phải $\\dfrac{AD}{DB}$ khi tìm tỉ lệ với cạnh tương ứng bên kia.',
      'Tính diện tích hình thang dùng $AB+CD$ thay vì $\\dfrac{AB+CD}{2}$.',
    ],
  },

  {
    topicId: 'duong-tron',
    summary: [
      'Đường tròn $(O; R)$: tập điểm cách $O$ đúng $R$; tiếp điểm là điểm chung với tiếp tuyến.',
      'Tiếp tuyến vuông góc với bán kính tại tiếp điểm.',
      'Góc nội tiếp bằng nửa góc ở tâm cùng chắn một cung.',
      'Tứ giác nội tiếp có tổng hai góc đối bằng $180°$.',
      'Hai tiếp tuyến từ ngoài bằng nhau và tâm nằm trên đường phân giác góc giữa chúng.',
    ],
    formulas: [
      { name: 'Tiếp tuyến và bán kính', formula: '$OA \\perp MA$ (MA là tiếp tuyến tại A)', note: 'Tạo tam giác vuông' },
      { name: 'Độ dài tiếp tuyến', formula: '$MA^2 = MO^2 - R^2$', note: 'M ngoài đường tròn' },
      { name: 'Góc nội tiếp', formula: 'Góc nội tiếp $= \\dfrac{1}{2}$ cung bị chắn', note: 'Cung tính bằng độ' },
      { name: 'Góc tâm', formula: 'Góc tâm $=$ số đo cung bị chắn', note: 'Bằng số đo cung' },
      { name: 'Tứ giác nội tiếp', formula: '$\\angle A + \\angle C = 180°$', note: 'Hai góc đối bù nhau' },
      { name: 'Dây và khoảng cách', formula: '$OH^2 + AH^2 = R^2$', note: 'H là trung điểm dây AB, OH ⊥ AB' },
    ],
    examples: [
      {
        problem: 'Từ điểm $M$ ngoài đường tròn $(O; 6)$, kẻ tiếp tuyến $MA$. Biết $OM=10$. Tính $MA$.',
        solution: {
          steps: [
            '$OA \\perp MA$ nên tam giác $OAM$ vuông tại $A$',
            '$MA^2 = OM^2 - OA^2 = 100 - 36 = 64$',
            '$MA = 8$',
          ],
          answer: '$MA = 8$',
        },
      },
      {
        problem: 'Cho đường tròn $(O)$, dây $AB$ có $AB=14$, $OH \\perp AB$ ($H$ trung điểm $AB$). Biết $R=\\ 25/2$. Tính $OH$.',
        solution: {
          steps: [
            '$AH = AB/2 = 7$',
            '$OH^2 = R^2 - AH^2 = 625/4 - 49 = 429/4$',
            '$OH = \\dfrac{\\sqrt{429}}{2} \\approx 10.4$',
          ],
          answer: '$OH = \\dfrac{\\sqrt{429}}{2}$',
        },
      },
      {
        problem: 'Tứ giác $ABCD$ nội tiếp đường tròn, $\\angle A = 110°$, $\\angle B = 80°$. Tính $\\angle C$ và $\\angle D$.',
        solution: {
          steps: [
            '$\\angle A + \\angle C = 180° \\Rightarrow \\angle C = 70°$',
            '$\\angle B + \\angle D = 180° \\Rightarrow \\angle D = 100°$',
          ],
          answer: '$\\angle C = 70°$, $\\angle D = 100°$',
        },
      },
    ],
    commonMistakes: [
      'Nhầm góc nội tiếp với góc tâm — góc nội tiếp chỉ bằng nửa cung, không bằng cung.',
      'Nhầm điều kiện tứ giác nội tiếp: hai góc đối bù nhau, không phải tổng bằng $90°$.',
      'Quên rằng khoảng cách từ tâm đến dây cung dùng nửa dây (trung điểm), không phải cả dây.',
    ],
  },

  {
    topicId: 'he-thuc-luong',
    summary: [
      'Trong tam giác vuông tại $A$ với đường cao $AH$: $AH^2 = BH \\cdot HC$.',
      'Tỉ số lượng giác: $\\sin$, $\\cos$, $\\tan$, $\\cot$ trong tam giác vuông.',
      'Quan hệ: $\\sin^2\\alpha + \\cos^2\\alpha = 1$; $\\tan\\alpha = \\sin\\alpha/\\cos\\alpha$.',
      'Góc bù: $\\sin(90°-\\alpha) = \\cos\\alpha$; $\\cos(90°-\\alpha) = \\sin\\alpha$.',
      'Ứng dụng: tính chiều cao, khoảng cách trong thực tế.',
    ],
    formulas: [
      { name: '$AH^2$', formula: '$AH^2 = BH \\cdot HC$', note: 'AH là đường cao từ góc vuông' },
      { name: '$AB^2$', formula: '$AB^2 = BH \\cdot BC$', note: 'Hình chiếu của AB lên BC' },
      { name: '$AC^2$', formula: '$AC^2 = HC \\cdot BC$', note: 'Hình chiếu của AC lên BC' },
      { name: '$\\sin\\alpha$', formula: '$\\sin\\alpha = \\dfrac{\\text{cạnh đối}}{\\text{cạnh huyền}}$', note: 'Trong tam giác vuông' },
      { name: '$\\cos\\alpha$', formula: '$\\cos\\alpha = \\dfrac{\\text{cạnh kề}}{\\text{cạnh huyền}}$', note: 'Trong tam giác vuông' },
      { name: '$\\tan\\alpha$', formula: '$\\tan\\alpha = \\dfrac{\\text{cạnh đối}}{\\text{cạnh kề}}$', note: 'Trong tam giác vuông' },
      { name: 'Hệ thức cơ bản', formula: '$\\sin^2\\alpha + \\cos^2\\alpha = 1$', note: 'Với mọi góc α' },
    ],
    examples: [
      {
        problem: 'Tam giác $ABC$ vuông tại $A$, $AH \\perp BC$, $BH=3$, $HC=12$. Tính $AH$, $AB$, $AC$.',
        solution: {
          steps: [
            '$BC = BH+HC = 15$',
            '$AH^2 = BH \\cdot HC = 3 \\cdot 12 = 36 \\Rightarrow AH=6$',
            '$AB^2 = BH \\cdot BC = 3 \\cdot 15 = 45 \\Rightarrow AB=3\\sqrt{5}$',
            '$AC^2 = HC \\cdot BC = 12 \\cdot 15 = 180 \\Rightarrow AC=6\\sqrt{5}$',
          ],
          answer: '$AH=6$, $AB=3\\sqrt{5}$, $AC=6\\sqrt{5}$',
        },
      },
      {
        problem: 'Tam giác $ABC$ vuông tại $C$, $\\angle B=35°$, $AB=20$. Tính $BC$ và $AC$ (làm tròn đến 0,01).',
        solution: {
          steps: [
            '$\\cos B = \\dfrac{BC}{AB} \\Rightarrow BC = AB \\cdot \\cos 35° = 20 \\cdot 0{,}8192 \\approx 16{,}38$',
            '$\\sin B = \\dfrac{AC}{AB} \\Rightarrow AC = AB \\cdot \\sin 35° = 20 \\cdot 0{,}5736 \\approx 11{,}47$',
          ],
          answer: '$BC \\approx 16{,}38$, $AC \\approx 11{,}47$',
        },
      },
      {
        problem: 'Chứng minh: $\\tan\\alpha + \\cot\\alpha = \\dfrac{1}{\\sin\\alpha \\cdot \\cos\\alpha}$',
        solution: {
          steps: [
            '$\\tan\\alpha + \\cot\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} + \\dfrac{\\cos\\alpha}{\\sin\\alpha}$',
            '$= \\dfrac{\\sin^2\\alpha + \\cos^2\\alpha}{\\sin\\alpha \\cdot \\cos\\alpha} = \\dfrac{1}{\\sin\\alpha \\cdot \\cos\\alpha}$ (đpcm)',
          ],
          answer: 'Đã chứng minh',
        },
      },
    ],
    commonMistakes: [
      'Nhầm cạnh đối và cạnh kề — cạnh đối là cạnh không tạo thành góc đó.',
      'Áp dụng công thức $AH^2 = BH \\cdot HC$ cho tam giác không vuông.',
      'Tính $\\sin$ và $\\cos$ của cùng một góc nhưng đặt cạnh sai vào tử/mẫu.',
    ],
  },

  {
    topicId: 'thong-ke',
    summary: [
      'Số trung bình cộng $\\bar{x}$: tổng chia cho số phần tử.',
      'Trung vị (Me): giá trị giữa dãy đã sắp xếp; mốt (Mo): giá trị xuất hiện nhiều nhất.',
      'Phương sai $s^2$: trung bình bình phương các độ lệch so với $\\bar{x}$.',
      'Độ lệch chuẩn $s = \\sqrt{s^2}$: đo mức độ phân tán của dữ liệu.',
      'Biểu đồ cột, biểu đồ tần số, bảng phân phối tần số — trình bày dữ liệu.',
    ],
    formulas: [
      { name: 'Số trung bình', formula: '$\\bar{x} = \\dfrac{x_1+x_2+\\cdots+x_n}{n}$', note: 'n là số phần tử' },
      { name: 'Số trung bình có tần số', formula: '$\\bar{x} = \\dfrac{\\sum x_i f_i}{\\sum f_i}$', note: 'fᵢ là tần số' },
      { name: 'Phương sai', formula: '$s^2 = \\dfrac{1}{n}\\sum(x_i - \\bar{x})^2$', note: 'Đo độ phân tán' },
      { name: 'Độ lệch chuẩn', formula: '$s = \\sqrt{s^2}$', note: 'Cùng đơn vị với dữ liệu' },
      { name: 'Tần suất', formula: '$f_i(\\%) = \\dfrac{n_i}{n} \\cdot 100\\%$', note: 'nᵢ là tần số, n là tổng' },
    ],
    examples: [
      {
        problem: 'Điểm thi: 6, 7, 8, 7, 9, 8, 7, 10, 6, 8. Tính $\\bar{x}$, tìm Mo và Me.',
        solution: {
          steps: [
            'Sắp xếp: 6, 6, 7, 7, 7, 8, 8, 8, 9, 10',
            '$\\bar{x} = (6+6+7+7+7+8+8+8+9+10)/10 = 76/10 = 7{,}6$',
            'Mo = 7 và 8 (cùng xuất hiện 3 lần)',
            'Me = trung bình phần tử thứ 5 và 6 = $(7+8)/2 = 7{,}5$',
          ],
          answer: '$\\bar{x}=7{,}6$, Mo $=7$ và $8$, Me $=7{,}5$',
        },
      },
      {
        problem: 'Tính phương sai và độ lệch chuẩn của: 2, 4, 4, 4, 5, 5, 7, 9.',
        solution: {
          steps: [
            '$n=8$, $\\bar{x} = (2+4+4+4+5+5+7+9)/8 = 40/8 = 5$',
            '$s^2 = \\dfrac{(2-5)^2+(4-5)^2+(4-5)^2+(4-5)^2+(5-5)^2+(5-5)^2+(7-5)^2+(9-5)^2}{8}$',
            '$= \\dfrac{9+1+1+1+0+0+4+16}{8} = \\dfrac{32}{8} = 4$',
            '$s = \\sqrt{4} = 2$',
          ],
          answer: '$s^2=4$, $s=2$',
        },
      },
      {
        problem: 'Bảng phân phối: điểm 5 (5 HS), 6 (8 HS), 7 (12 HS), 8 (10 HS), 9 (5 HS). Tính $\\bar{x}$.',
        solution: {
          steps: [
            'Tổng HS: $n = 5+8+12+10+5 = 40$',
            '$\\bar{x} = \\dfrac{5 \\cdot 5+6 \\cdot 8+7 \\cdot 12+8 \\cdot 10+9 \\cdot 5}{40}$',
            '$= \\dfrac{25+48+84+80+45}{40} = \\dfrac{282}{40} = 7{,}05$',
          ],
          answer: '$\\bar{x} = 7{,}05$',
        },
      },
    ],
    commonMistakes: [
      'Quên sắp xếp dãy số trước khi tìm trung vị.',
      'Khi số phần tử chẵn, trung vị là trung bình của hai phần tử giữa, không phải một phần tử.',
      'Tính phương sai dùng độ lệch chứ không bình phương độ lệch.',
    ],
  },

  {
    topicId: 'xac-suat',
    summary: [
      'Xác suất của biến cố $A$: $P(A) = m/n$ ($m$ kết quả thuận lợi, $n$ tổng kết quả).',
      '$0 \\leq P(A) \\leq 1$; $P(\\Omega) = 1$; $P(\\emptyset) = 0$.',
      'Biến cố đối: $P(\\bar{A}) = 1 - P(A)$.',
      'Quy tắc cộng: $P(A \\cup B) = P(A)+P(B)-P(A \\cap B)$.',
      'Biến cố độc lập: $P(A \\cap B) = P(A) \\cdot P(B)$.',
    ],
    formulas: [
      { name: 'Xác suất cổ điển', formula: '$P(A) = \\dfrac{m}{n}$', note: 'm kết quả thuận lợi, n tổng' },
      { name: 'Biến cố đối', formula: '$P(\\bar{A}) = 1 - P(A)$', note: 'Ā là biến cố đối của A' },
      { name: 'Cộng xác suất', formula: '$P(A \\cup B) = P(A)+P(B)-P(A \\cap B)$', note: 'Tổng quát' },
      { name: 'Cộng loại trừ', formula: '$P(A \\cup B) = P(A)+P(B)$', note: 'Khi A, B xung khắc' },
      { name: 'Nhân xác suất', formula: '$P(A \\cap B) = P(A) \\cdot P(B)$', note: 'Khi A, B độc lập' },
    ],
    examples: [
      {
        problem: 'Hộp có 4 bi đỏ, 3 bi xanh, 2 bi vàng. Lấy 1 bi. Tính xác suất không lấy được bi đỏ.',
        solution: {
          steps: [
            'Tổng số bi: $n = 9$',
            '$P(\\text{đỏ}) = 4/9$',
            '$P(\\text{không đỏ}) = 1 - 4/9 = 5/9$',
          ],
          answer: '$P = 5/9$',
        },
      },
      {
        problem: 'Gieo xúc xắc 2 lần. Tính xác suất cả hai lần đều ra số lẻ.',
        solution: {
          steps: [
            '$P(\\text{lẻ lần 1}) = 3/6 = 1/2$',
            '$P(\\text{lẻ lần 2}) = 1/2$',
            'Hai lần độc lập: $P = \\dfrac{1}{2} \\cdot \\dfrac{1}{2} = \\dfrac{1}{4}$',
          ],
          answer: '$P = 1/4$',
        },
      },
      {
        problem: 'Rút ngẫu nhiên 1 thẻ từ 52 thẻ bài. Tính xác suất thẻ là Át (A) hoặc thẻ đỏ.',
        solution: {
          steps: [
            '$P(\\text{Át}) = 4/52 = 1/13$',
            '$P(\\text{đỏ}) = 26/52 = 1/2$',
            '$P(\\text{Át đỏ}) = 2/52 = 1/26$',
            '$P(\\text{Át hoặc đỏ}) = \\dfrac{1}{13}+\\dfrac{1}{2}-\\dfrac{1}{26} = \\dfrac{2+13-1}{26} = \\dfrac{14}{26} = \\dfrac{7}{13}$',
          ],
          answer: '$P = 7/13$',
        },
      },
    ],
    commonMistakes: [
      'Dùng quy tắc nhân cho hai biến cố không độc lập.',
      'Quên trừ phần giao khi dùng quy tắc cộng cho hai biến cố không xung khắc.',
      'Tính nhầm không gian mẫu khi có thứ tự (hoán vị) hay không có thứ tự (tổ hợp).',
    ],
  },

  {
    topicId: 'bai-toan-thuc-te',
    summary: [
      'Xác định ẩn, lập phương trình/hệ PT từ dữ liệu đề bài, giải và kiểm tra thực tế.',
      'Bài toán chuyển động: $S = v \\cdot t$; cùng quãng đường, lập phương trình về thời gian/vận tốc.',
      'Bài toán năng suất: trong 1 đơn vị thời gian làm được $1/T$ công việc.',
      'Bài toán hỗn hợp/nồng độ: $m_{ct} = C\\% \\cdot m_{dd}$.',
      'Luôn đặt điều kiện cho ẩn và kiểm tra nghiệm với ngữ cảnh thực tế.',
    ],
    formulas: [
      { name: 'Quãng đường', formula: '$S = v \\cdot t$', note: 'v: vận tốc, t: thời gian' },
      { name: 'Năng suất', formula: '1 giờ làm được $\\dfrac{1}{T}$', note: 'T: thời gian hoàn thành, cộng phân số năng suất' },
      { name: 'Nồng độ', formula: '$m_{ct} = C\\% \\cdot m_{dd}$', note: 'Chất tan = nồng độ × dung dịch' },
      { name: 'Lãi suất', formula: '$A_n = A_0 \\cdot (1+r)^n$', note: 'Lãi kép sau n kỳ' },
    ],
    examples: [
      {
        problem: 'Hai người đi xe đạp từ A đến B cách nhau 60 km. Người thứ nhất đi nhanh hơn người thứ hai 5 km/h và đến trước 1 giờ. Tính vận tốc mỗi người.',
        solution: {
          steps: [
            'Gọi vận tốc người hai là $v$ (km/h), điều kiện $v > 0$',
            'Vận tốc người một: $v+5$',
            'Thời gian người một: $60/(v+5)$; người hai: $60/v$',
            '$\\dfrac{60}{v} - \\dfrac{60}{v+5} = 1$',
            '$60(v+5) - 60v = v(v+5)$',
            '$300 = v^2+5v \\Rightarrow v^2+5v-300=0$',
            '$\\Delta = 25+1200 = 1225 \\Rightarrow v = (-5+35)/2 = 15$',
          ],
          answer: 'Người hai: 15 km/h, người một: 20 km/h',
        },
      },
      {
        problem: 'Có 20 lít dung dịch muối nồng độ 10%. Cần thêm bao nhiêu lít nước để được dung dịch 8%?',
        solution: {
          steps: [
            'Lượng muối ban đầu: $20 \\cdot 10\\% = 2$ kg',
            'Gọi lượng nước thêm vào là $x$ lít',
            'Tổng dung dịch mới: $20+x$ lít; muối vẫn là 2 kg',
            '$\\dfrac{2}{20+x} = 8\\% = 0.08$',
            '$2 = 0.08(20+x) \\Rightarrow 20+x = 25 \\Rightarrow x = 5$',
          ],
          answer: 'Cần thêm 5 lít nước',
        },
      },
      {
        problem: 'Một người gửi 50 triệu đồng với lãi suất 6%/năm (lãi kép). Sau 2 năm nhận được bao nhiêu?',
        solution: {
          steps: [
            '$A_2 = 50 \\cdot (1+0.06)^2 = 50 \\cdot 1.1236 = 56.18$ triệu đồng',
          ],
          answer: '56,18 triệu đồng',
        },
      },
    ],
    commonMistakes: [
      'Gọi ẩn không rõ ràng về đơn vị (km/h hay m/s?).',
      'Lập phương trình sai khi hai đối tượng đi ngược chiều hay đuổi nhau.',
      'Không kiểm tra điều kiện thực tế của nghiệm (thời gian âm, số người âm, v.v.).',
    ],
  },

  {
    topicId: 'de-tong-hop',
    summary: [
      'Đề thi vào lớp 10 thường gồm: 1 bài rút gọn căn/phân thức, 1 bài phương trình/hệ, 1 bài hình học, 1 bài toán thực tế.',
      'Điểm tối đa thường là 10 điểm với 4-5 câu hỏi.',
      'Kỹ năng trình bày rõ ràng, lập luận logic được chú trọng.',
      'Bài hình học thường có cả phần tính toán và chứng minh.',
      'Luyện đề thực tế giúp quen dạng và quản lý thời gian thi.',
    ],
    formulas: [
      { name: 'Rút gọn căn', formula: 'Phân tích => rút nhân tử => đơn giản hóa', note: 'Kết hợp nhiều bước' },
      { name: 'Bài hình học', formula: 'Vẽ hình, chú thích => chứng minh từng bước', note: 'Trình bày logic' },
      { name: 'Bài thực tế', formula: 'Đặt ẩn => lập PT => giải => đối chiếu thực tế', note: 'Không bỏ bước kiểm tra' },
    ],
    examples: [
      {
        problem: 'Rút gọn: $P = \\left(\\dfrac{1}{\\sqrt{x}-1} - \\dfrac{\\sqrt{x}}{x-1}\\right) \\cdot (x-1)$, với $x>0, x \\neq 1$.',
        solution: {
          steps: [
            '$x-1 = (\\sqrt{x}-1)(\\sqrt{x}+1)$, MTC của biểu thức trong ngoặc là $(\\sqrt{x}-1)(\\sqrt{x}+1)$',
            '$\\dfrac{1}{\\sqrt{x}-1} - \\dfrac{\\sqrt{x}}{(\\sqrt{x}-1)(\\sqrt{x}+1)} = \\dfrac{\\sqrt{x}+1 - \\sqrt{x}}{(\\sqrt{x}-1)(\\sqrt{x}+1)} = \\dfrac{1}{x-1}$',
            '$P = \\dfrac{1}{x-1} \\cdot (x-1) = 1$',
          ],
          answer: '$P = 1$',
        },
      },
      {
        problem: 'Cho $\\triangle ABC$ nội tiếp $(O)$, $BC$ là đường kính. $M$ là điểm trên cung $AC$ ($M \\neq A, C$). Chứng minh $MB^2 = MA \\cdot MC + MA^2 \\cdot \\dfrac{BC^2}{MC^2}$ ... (Dạng đơn giản hơn): Chứng minh $\\angle BAC = 90°$.',
        solution: {
          steps: [
            'Vì $BC$ là đường kính nên cung $BC$ (lớn) = $180°$',
            'Góc nội tiếp $\\angle BAC$ chắn cung $BC$ (không chứa $A$)',
            '$\\angle BAC = \\dfrac{1}{2} \\cdot 180° = 90°$ (đpcm)',
          ],
          answer: '$\\angle BAC = 90°$ vì là góc nội tiếp chắn nửa đường tròn',
        },
      },
      {
        problem: 'Một đội thợ dự định làm xong công trình trong 20 ngày. Sau 6 ngày làm việc, tăng thêm 2 người nữa và hoàn thành trước 2 ngày so với dự định. Hỏi lúc đầu đội có bao nhiêu người?',
        solution: {
          steps: [
            'Gọi số người ban đầu là $n$',
            'Năng suất mỗi người trong 1 ngày: $\\dfrac{1}{20n}$ công việc',
            '6 ngày đầu hoàn thành: $\\dfrac{6n}{20n} = \\dfrac{6}{20}$ công việc',
            'Còn lại $\\dfrac{14}{20}$ công việc, làm trong $20-6-2=12$ ngày với $n+2$ người',
            '$\\dfrac{12(n+2)}{20n} = \\dfrac{14}{20} \\Rightarrow 12(n+2) = 14n \\Rightarrow 12n+24=14n \\Rightarrow n=12$',
          ],
          answer: 'Đội ban đầu có 12 người',
        },
      },
    ],
    commonMistakes: [
      'Bỏ qua điều kiện xác định trong bài rút gọn có căn hoặc phân thức.',
      'Không ghi rõ từng bước lập luận trong bài hình học — mất điểm dù kết quả đúng.',
      'Trong bài toán thực tế, không kiểm tra lại nghiệm có phù hợp với điều kiện đề.',
    ],
  },
]
