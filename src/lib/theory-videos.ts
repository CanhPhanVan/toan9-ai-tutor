/**
 * Video hướng dẫn lý thuyết cho từng chủ đề.
 *
 * - videoId: ID video YouTube (phần sau `v=` trong URL). Để `null` nếu chưa có
 *   video xác thực phù hợp — khi đó UI sẽ hiển thị nút "Tìm video trên YouTube"
 *   thay vì nhúng video.
 * - keyPoints: kịch bản trọng tâm do AI biên soạn, tóm tắt đúng những gì cần
 *   nắm trước/trong khi xem video — không thay thế phần "Tóm tắt lý thuyết" đã
 *   có, mà đóng vai trò "xem gì trong video này".
 * - searchQuery: dùng để tạo link tìm kiếm YouTube dự phòng.
 */

export interface TopicVideo {
  topicId: string
  videoId: string | null
  title: string
  channel?: string
  keyPoints: string[]
  searchQuery: string
}

export const THEORY_VIDEOS: TopicVideo[] = [
  {
    topicId: 'can-bac-hai',
    videoId: '5ykgVSHPbIo',
    title: 'Căn bậc hai và căn thức bậc hai',
    channel: 'VietJack',
    keyPoints: [
      'Định nghĩa căn bậc hai số học và điều kiện xác định của $\\sqrt{A}$ (biểu thức dưới căn phải $\\geq 0$).',
      'Hằng đẳng thức quan trọng nhất: $\\sqrt{a^2} = |a|$ — sai lầm phổ biến nhất là quên dấu giá trị tuyệt đối.',
      'Cách đưa thừa số ra ngoài/vào trong dấu căn và nhân, chia hai căn bậc hai.',
      'Kỹ thuật trục căn thức ở mẫu, đặc biệt là dùng biểu thức liên hợp.',
      'Ví dụ mẫu: rút gọn $\\sqrt{75} - \\sqrt{12} + \\sqrt{27}$ bằng cách tách thành thừa số chính phương.',
    ],
    searchQuery: 'toán 9 căn bậc hai căn thức bậc hai bài giảng',
  },
  {
    topicId: 'bieu-thuc-dai-so',
    videoId: null,
    title: 'Hằng đẳng thức & phân tích đa thức thành nhân tử',
    keyPoints: [
      '7 hằng đẳng thức đáng nhớ (bình phương tổng/hiệu, hiệu hai bình phương, lập phương tổng/hiệu, tổng/hiệu hai lập phương) — cần thuộc lòng để nhận diện nhanh.',
      'Ba phương pháp phân tích nhân tử chính: đặt nhân tử chung, dùng hằng đẳng thức, nhóm hạng tử.',
      'Khi đề bài "lai" nhiều dạng, luôn nhóm hạng tử trước để lộ ra nhân tử chung hoặc hằng đẳng thức.',
      'Kiểm tra kết quả bằng cách nhân ngược lại — cách nhanh nhất để tự phát hiện sai sót.',
      'Ví dụ mẫu: phân tích $x^2 - 5x + 6$ bằng tách hạng tử giữa thành $-2x - 3x$.',
    ],
    searchQuery: 'toán 9 hằng đẳng thức phân tích đa thức thành nhân tử bài giảng',
  },
  {
    topicId: 'phuong-trinh',
    videoId: '11EXtByHKvU',
    title: 'Phương trình và hệ hai phương trình bậc nhất hai ẩn',
    channel: 'VietJack',
    keyPoints: [
      'Phương trình bậc nhất hai ẩn $ax + by = c$ luôn có vô số nghiệm, biểu diễn bởi một đường thẳng.',
      'Hai phương pháp giải hệ: phương pháp thế và phương pháp cộng đại số — chọn phương pháp theo hệ số đẹp.',
      'Biện luận số nghiệm của hệ dựa vào vị trí tương đối của hai đường thẳng (cắt nhau / song song / trùng nhau).',
      'Các bước giải bài toán bằng cách lập hệ phương trình: gọi ẩn — đặt điều kiện — lập hệ — giải — kiểm tra điều kiện — kết luận.',
      'Lỗi hay gặp: quên đặt điều kiện cho ẩn (số người, số sản phẩm phải nguyên dương) trước khi kết luận.',
    ],
    searchQuery: 'toán 9 hệ phương trình bậc nhất hai ẩn bài giảng',
  },
  {
    topicId: 'ham-so-do-thi',
    videoId: null,
    title: 'Hàm số bậc nhất và hàm số bậc hai',
    keyPoints: [
      'Hàm số bậc nhất $y = ax + b$: đồng biến khi $a > 0$, nghịch biến khi $a < 0$; đồ thị là đường thẳng.',
      'Cách vẽ nhanh: tìm giao điểm với Ox $(-b/a; 0)$ và Oy $(0; b)$.',
      'Điều kiện hai đường thẳng song song ($a = a\'$, $b \\neq b\'$), trùng nhau, cắt nhau ($a \\neq a\'$).',
      'Hàm số bậc hai $y = ax^2$: đồ thị là parabol, quay bề lõm lên khi $a > 0$, xuống khi $a < 0$.',
      'Tìm giao điểm của đường thẳng và parabol bằng cách lập phương trình hoành độ giao điểm.',
    ],
    searchQuery: 'toán 9 hàm số bậc nhất hàm số bậc hai đồ thị bài giảng',
  },
  {
    topicId: 'phuong-trinh-bac-hai',
    videoId: 'zOAlfGWAoMA',
    title: 'Công thức nghiệm của phương trình bậc hai',
    channel: 'OLM.VN',
    keyPoints: [
      'Công thức nghiệm tổng quát với $\\Delta = b^2 - 4ac$: xét dấu $\\Delta$ để biết phương trình có 2 nghiệm, nghiệm kép, hay vô nghiệm.',
      'Công thức nghiệm thu gọn dùng $b\'= b/2$ khi $b$ chẵn — giúp tính nhanh hơn.',
      'Hệ thức Viète: $x_1 + x_2 = -b/a$, $x_1 x_2 = c/a$ — dùng để tính tổng/tích nghiệm mà không cần giải phương trình.',
      'Nhẩm nghiệm nhanh: nếu $a + b + c = 0$ thì $x_1 = 1$; nếu $a - b + c = 0$ thì $x_1 = -1$.',
      'Ví dụ mẫu: dùng Viète để tìm hai số khi biết tổng và tích của chúng.',
    ],
    searchQuery: 'toán 9 công thức nghiệm phương trình bậc hai Viète bài giảng',
  },
  {
    topicId: 'hinh-hoc-phang',
    videoId: '9CPNB-J10R0',
    title: 'Tam giác đồng dạng - Tỉ số đồng dạng',
    channel: 'ToanLamToan',
    keyPoints: [
      'Ba trường hợp đồng dạng của tam giác: cạnh-cạnh-cạnh (c-c-c), cạnh-góc-cạnh (c-g-c), góc-góc (g-g).',
      'Tỉ số đồng dạng kéo theo tỉ số chu vi bằng k, tỉ số diện tích bằng $k^2$.',
      'Định lý Ta-lét và hệ quả: đường thẳng song song với một cạnh của tam giác chia hai cạnh còn lại theo cùng tỉ lệ.',
      'Dấu hiệu nhận biết các loại tứ giác đặc biệt (hình bình hành, hình chữ nhật, hình thoi, hình vuông).',
      'Kỹ năng dựng hình phụ: kẻ đường cao, đường trung bình để tạo ra tam giác đồng dạng cần chứng minh.',
    ],
    searchQuery: 'toán 9 tam giác đồng dạng tứ giác bài giảng',
  },
  {
    topicId: 'duong-tron',
    videoId: 'QHryJxSUbis',
    title: 'Một số dấu hiệu nhận biết tứ giác nội tiếp',
    channel: 'OLM.VN',
    keyPoints: [
      'Tính chất tiếp tuyến: tiếp tuyến vuông góc với bán kính tại tiếp điểm; hai tiếp tuyến cắt nhau tại một điểm thì đường nối điểm đó với tâm là phân giác góc tạo bởi hai tiếp tuyến.',
      'Góc nội tiếp bằng nửa số đo cung bị chắn; các góc nội tiếp cùng chắn một cung thì bằng nhau.',
      'Góc tạo bởi tiếp tuyến và dây cung cũng bằng nửa số đo cung bị chắn.',
      'Dấu hiệu nhận biết tứ giác nội tiếp: tổng hai góc đối bằng $180°$, hoặc hai đỉnh cùng nhìn một cạnh dưới góc bằng nhau.',
      'Chiến lược chứng minh phổ biến: tìm tứ giác nội tiếp trước để "mượn" các góc bằng nhau, từ đó suy ra đồng dạng hoặc song song.',
    ],
    searchQuery: 'toán 9 góc nội tiếp tứ giác nội tiếp tiếp tuyến đường tròn bài giảng',
  },
  {
    topicId: 'he-thuc-luong',
    videoId: 'eyxDgzLt5rw',
    title: 'Một số hệ thức về cạnh và đường cao trong tam giác vuông',
    channel: 'VietJack',
    keyPoints: [
      'Hệ thức giữa cạnh và đường cao: $h^2 = b\'c\'$, $b^2 = a \\cdot b\'$, $c^2 = a \\cdot c\'$ (định lý hình chiếu).',
      'Định lý Pythagoras: $a^2 = b^2 + c^2$ và hệ thức $\\dfrac{1}{h^2} = \\dfrac{1}{b^2} + \\dfrac{1}{c^2}$.',
      'Định nghĩa tỉ số lượng giác của góc nhọn: $\\sin, \\cos, \\tan, \\cot$ theo cạnh đối/kề/huyền.',
      'Hệ thức giữa cạnh và góc: $b = a \\sin B = a \\cos C$, dùng để giải tam giác vuông khi biết một cạnh và một góc.',
      'Mẹo nhớ: "sin đi học, cos không hư" (sin = đối/huyền, cos = kề/huyền) giúp nhớ nhanh định nghĩa.',
    ],
    searchQuery: 'toán 9 hệ thức lượng tam giác vuông tỉ số lượng giác bài giảng',
  },
  {
    topicId: 'thong-ke',
    videoId: null,
    title: 'Số trung bình, phương sai, độ lệch chuẩn',
    keyPoints: [
      'Số trung bình cộng $\\bar{x}$ đại diện cho xu hướng trung tâm của một mẫu số liệu.',
      'Phương sai $s^2$ đo mức độ phân tán của số liệu quanh giá trị trung bình — phương sai càng lớn, số liệu càng phân tán.',
      'Độ lệch chuẩn $s = \\sqrt{s^2}$ cùng đơn vị với số liệu gốc, nên dễ so sánh thực tế hơn phương sai.',
      'Quy trình tính: tính $\\bar{x}$ → tính độ lệch mỗi giá trị so với $\\bar{x}$ → bình phương → lấy trung bình → khai căn.',
      'Ứng dụng: so sánh độ ổn định giữa hai nhóm số liệu có cùng trung bình nhưng độ lệch chuẩn khác nhau.',
    ],
    searchQuery: 'toán 9 số trung bình phương sai độ lệch chuẩn bài giảng',
  },
  {
    topicId: 'xac-suat',
    videoId: 'noTQyvtl7rk',
    title: 'Phép thử ngẫu nhiên và không gian mẫu',
    keyPoints: [
      'Xác suất thực nghiệm = số lần biến cố xảy ra / tổng số lần thử — dựa trên dữ liệu quan sát thực tế.',
      'Xác suất lý thuyết (cổ điển) = số kết quả thuận lợi / số kết quả có thể, áp dụng khi các kết quả đồng khả năng.',
      'Không gian mẫu là tập hợp tất cả kết quả có thể xảy ra của một phép thử — cần liệt kê đầy đủ trước khi tính.',
      'Với phép thử phức tạp (gieo 2 xúc xắc, rút 2 lá bài...), dùng sơ đồ cây hoặc bảng để đếm kết quả thuận lợi không bị sót/trùng.',
      'Xác suất luôn nằm trong đoạn $[0; 1]$; biến cố chắc chắn có xác suất 1, biến cố không thể có xác suất 0.',
    ],
    searchQuery: 'toán 9 xác suất thực nghiệm xác suất lý thuyết bài giảng',
