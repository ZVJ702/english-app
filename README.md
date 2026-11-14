# English App

Web app cài được (PWA) để học từ vựng và ngữ pháp tiếng Anh với lặp lại ngắt quãng (FSRS), và đồng bộ giữa các thiết bị bằng một mã — không cần tài khoản.

## Có gì trong app

- **Từ vựng từ bộ thẻ Anki (.apkg)**: nhập trong mục **Bộ từ của tôi**; từ, nghĩa, hình và âm thanh lưu trên thiết bị.
- **Ngữ pháp**: 49 chủ đề (A1–B2) có bài đọc chi tiết (so sánh với tiếng Việt, lỗi hay gặp, ghi chú phát âm) và 3 dạng bài: trắc nghiệm, điền từ, sắp xếp câu. Sửa hoặc thêm trong `src/data/grammar.ts`; danh sách chủ đề chưa viết nằm trong `PLANNED`.
- **Phiên học 5, 15 hoặc 30 phút**, tách riêng: phiên Từ vựng và phiên Ngữ pháp không trộn lẫn. Lịch ôn do thuật toán FSRS tính.
- **Đồng bộ bằng mã** và **sao lưu ra tệp**.
- Chạy offline sau lần mở đầu tiên; giao diện song ngữ Việt – Anh.

## Chạy trên máy

```bash
npm install
```

```bash
npm run dev
```

## Đưa lên mạng (GitHub Pages)

1. Đẩy code lên nhánh `main` của một repo GitHub.
2. Trong repo: **Settings → Pages → Source** chọn **GitHub Actions**.
3. Mỗi lần đẩy code, app tự được dựng và đăng tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.
4. Trên Android (Chrome): mở địa chỉ đó → menu ⋮ → **Thêm vào màn hình chính**. Trên Windows (Chrome/Edge): bấm biểu tượng cài đặt ở thanh địa chỉ.

## Bật đồng bộ (Cloudflare Workers, miễn phí)

1. Tạo tài khoản tại dash.cloudflare.com.
2. **Storage & Databases → KV → Create**: đặt tên `english-app-sync`.
3. **Workers & Pages → Create → Worker**: dán nội dung `sync-server/worker.js` rồi Deploy.
4. Trong Worker: **Settings → Bindings → Add → KV namespace**, tên biến `SYNC`, chọn namespace vừa tạo.
5. Sao chép địa chỉ Worker (dạng `https://….workers.dev`) vào **Cài đặt → Địa chỉ máy chủ đồng bộ** trong app.
6. Bấm **Tạo mã mới** trên thiết bị đầu tiên, rồi nhập đúng mã đó trên các thiết bị còn lại.

Để khỏi nhập địa chỉ máy chủ trên từng thiết bị: trong repo GitHub, **Settings → Secrets and variables → Actions → Variables**, thêm `VITE_SYNC_URL` bằng địa chỉ Worker.

Mã đồng bộ chính là chìa khóa: ai có mã sẽ đọc và ghi được dữ liệu học của bạn. Bạn bè dùng chung máy chủ nhưng mỗi người tạo một mã riêng.
