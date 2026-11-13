# English App

Web app cài được (PWA) để học tiếng Anh: từ vựng với lặp lại ngắt quãng (FSRS), luyện viết câu, viết bài, và đồng bộ giữa các thiết bị bằng một mã — không cần tài khoản.

## Có gì trong bản đầu tiên

- **Bài xếp lớp** 20 câu, cho ra A2 / B1 / B2.
- **Phiên học 5, 15 hoặc 30 phút**: xen kẽ từ vựng từ bộ thẻ bạn nhập (gõ lại từ) và viết câu Việt → Anh. Lịch ôn do thuật toán FSRS tính; nghỉ không bị phạt.
- **Luyện viết bài**: đoạn văn, email, IELTS Task 2, có nút sao chép để dán vào Claude chấm.
- **Nhập bộ thẻ Anki (.apkg)**: từ, nghĩa, hình và âm thanh được lưu trên thiết bị và đưa vào lịch ôn.
- **Đồng bộ bằng mã** và **sao lưu ra tệp**.
- Chạy offline sau lần mở đầu tiên; giao diện song ngữ Việt – Anh.

Nội dung có sẵn: 40 câu viết, 8 đề viết. Từ vựng do bạn tự nhập từ bộ thẻ Anki trong mục **Bộ từ của tôi**.

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
