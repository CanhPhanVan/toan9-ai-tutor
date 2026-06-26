# Hướng dẫn đưa Toán 9 AI Tutor lên web (miễn phí)

Dùng 3 dịch vụ miễn phí: **GitHub** (lưu code) + **Neon** (database) + **Vercel** (hosting).

---

## Bước 1 — Tạo database trên Neon

1. Vào https://neon.tech → **Sign up** (dùng Google cho nhanh)
2. **Create project** → đặt tên `toan9` → chọn region **Singapore** (gần VN nhất)
3. Sau khi tạo xong, vào **Dashboard → Connection string**
4. Chọn **Prisma** trong dropdown → copy 2 dòng:
   - `DATABASE_URL="postgresql://..."`
   - `DIRECT_URL="postgresql://..."`
5. Lưu lại 2 dòng này, dùng ở Bước 3

---

## Bước 2 — Đưa code lên GitHub

1. Vào https://github.com → **New repository**
   - Tên: `toan9-ai-tutor`
   - Chọn **Private** (để bảo vệ code)
   - Nhấn **Create repository**

2. Mở **PowerShell** trong thư mục `D:\Toan9Web`, chạy lần lượt:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TEN_BAN/toan9-ai-tutor.git
git push -u origin main
```
> Thay `TEN_BAN` bằng username GitHub của bạn

---

## Bước 3 — Deploy lên Vercel

1. Vào https://vercel.com → **Sign up with GitHub**
2. Nhấn **Add New → Project** → chọn repo `toan9-ai-tutor`
3. Vercel tự nhận Next.js, nhấn **Deploy** — nhưng **CHƯA xong**, cần thêm env vars

4. Sau khi deploy (dù lỗi hay thành công), vào **Project Settings → Environment Variables**

5. Thêm từng biến sau:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Dòng DATABASE_URL từ Neon (Bước 1) |
| `DIRECT_URL` | Dòng DIRECT_URL từ Neon (Bước 1) |
| `GROQ_API_KEY` | API key từ https://console.groq.com |
| `GEMINI_API_KEY` | API key Gemini (nếu muốn dùng OCR) |

6. Vào **Deployments → chọn deployment mới nhất → Redeploy**

---

## Bước 4 — Khởi tạo database

Sau khi Vercel deploy thành công, mở **PowerShell** trong `D:\Toan9Web`:

```bash
# Cài dependencies nếu chưa có
npm install

# Tạo bảng trong Neon database
npx prisma db push
```

> Lệnh này kết nối vào Neon và tạo các bảng. Chỉ cần chạy 1 lần.

---

## Kết quả

Web sẽ chạy tại: `https://toan9-ai-tutor.vercel.app`

Mỗi khi sửa code trên máy và chạy `git push`, Vercel tự động cập nhật web trong ~1 phút.

---

## Cập nhật code sau này

```bash
# Sửa code xong, chạy 3 lệnh này để cập nhật web
git add .
git commit -m "Mô tả thay đổi"
git push
```

---

## Tạo tài khoản phụ huynh / admin

Sau khi deploy, gọi API một lần để tạo tài khoản phụ huynh:

```bash
curl -X POST https://toan9-ai-tutor.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Phụ huynh","email":"admin@email.com","password":"matkhau123","role":"parent","adminCode":"toan9admin2024"}'
```

Hoặc dùng Postman/Thunder Client với:
- URL: `POST https://your-domain.vercel.app/api/auth/register`
- Body JSON: `{"name":"Tên","email":"email","password":"password","role":"parent","adminCode":"toan9admin2024"}`

> **Đổi `ADMIN_CODE`** trong Vercel Environment Variables để bảo mật

---

## Gỡ lỗi thường gặp

| Lỗi | Cách sửa |
|-----|----------|
| `Error: DATABASE_URL not found` | Kiểm tra lại env vars trên Vercel |
| `PrismaClientInitializationError` | Chạy lại `npx prisma db push` |
| Trang trắng sau deploy | Xem **Vercel → Deployments → Logs** để tìm lỗi |
| AI không trả lời | Kiểm tra `GROQ_API_KEY` đã đúng chưa |
