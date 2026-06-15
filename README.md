# HQ88.FUN Admin

Bảng quản trị HQ88.FUN với các module:
- 📊 Dashboard
- 🤖 Quản lý Bot Telegram (kết nối token, gửi tin, broadcast)
- 💰 Quản lý Nạp / Rút (tạo, duyệt, từ chối giao dịch)

Dark mode, responsive, sidebar dạng HQ88.FUN. Dữ liệu lưu bằng **localStorage** trên trình duyệt — không cần sửa code khi thêm bot hoặc giao dịch.

## Cài đặt local
```bash
bun install        # hoặc: npm install
bun run dev        # hoặc: npm run dev
```
Mở http://localhost:3000

## Build production
```bash
bun run build
bun run start
```

## Deploy lên Railway

1. Tạo project mới trên [Railway](https://railway.app) → **Deploy from GitHub repo** (hoặc kéo thả thư mục).
2. Railway tự nhận diện Nixpacks và dùng `nixpacks.toml` đã có sẵn:
   - Build: `bun install && bun run build`
   - Start: `bun run start`
3. Trong tab **Variables**, thêm (tuỳ chọn):
   ```
   PORT=3000
   ```
4. Bấm **Deploy**. Sau khi deploy xong, vào **Settings → Networking → Generate Domain** để có URL public.

## Deploy lên Render / VPS
- **Render**: New Web Service → Build `bun install && bun run build` → Start `bun run start`.
- **VPS (Node 20+)**: `git clone` → `bun install` → `bun run build` → `pm2 start "bun run start"`.

## Sử dụng
1. Mở admin → menu **🤖 Quản lý Bot Telegram**.
2. Dán Bot Token (lấy từ [@BotFather](https://t.me/BotFather)) → bấm **Kết nối Bot**. Bot xuất hiện trong danh sách (tên/username/ID/avatar/online tự lấy qua `getMe`).
3. Menu **💰 Nạp / Rút** để tạo & duyệt giao dịch của user.
