# 🚀 Hướng dẫn cài Ollama và chạy Qwen2.5:3B

## 1. Tải Ollama

Truy cập:

[Ollama Download](https://ollama.com/download?utm_source=chatgpt.com)

Chọn đúng hệ điều hành:
- Windows
- macOS
- Linux

Sau khi tải xong:
- Chạy file cài đặt
- Next → Install → Finish

---

# 🖥 Kiểm tra Ollama đã cài thành công chưa

Mở:
- CMD
- PowerShell
- Terminal

Chạy:

```bash
ollama --version
```

Nếu hiện version nghĩa là cài thành công.

Ví dụ:

```bash
ollama version is 0.6.8
```

---

# 📥 Tải model Qwen2.5:3B

Sau khi cài Ollama thành công, chạy lệnh:

```bash
ollama pull qwen2.5:3b
```

Hệ thống sẽ tự động:
- Download model
- Giải nén
- Lưu model vào máy

⏳ Quá trình có thể mất vài phút tùy tốc độ mạng.

---

# ▶ Sử dụng model sau khi Pull

Sau khi tải xong model, chạy:

```bash
ollama run qwen2.5:3b
```

Nếu thành công sẽ hiện:

```bash
>>> Send a message
```

Bây giờ bạn có thể chat trực tiếp với AI trong terminal.

Ví dụ:

```bash
>>> viết api spring boot
>>> giải thích kafka
>>> tạo database mysql
```

AI sẽ phản hồi trực tiếp ngay bên dưới.

---

# 🛑 Dừng model

Nhấn:

```bash
Ctrl + C
```

---

# 📋 Kiểm tra model đã tải

```bash
ollama list
```

Ví dụ:

```bash
NAME              SIZE
qwen2.5:3b        2.0 GB
```

---

# 🔍 Kiểm tra model đang chạy

```bash
ollama ps
```

Ví dụ:

```bash
NAME            PROCESSOR
qwen2.5:3b      100% GPU
```

---

# 🌐 Dùng AI bằng giao diện web (Khuyên dùng)

## Chạy Open WebUI bằng Docker

```bash
docker run -d -p 3000:8080 \
--add-host=host.docker.internal:host-gateway \
-v open-webui:/app/backend/data \
--name open-webui \
ghcr.io/open-webui/open-webui:main
```

---

# 🌍 Mở giao diện

Truy cập:

```text
http://localhost:3000
```

Open WebUI sẽ tự động nhận:

```text
qwen2.5:3b
```

Bạn có thể sử dụng AI như ChatGPT ngay trên trình duyệt.

---

# ⚠ Nếu bị lỗi "ollama not recognized"

## Cách sửa

- Restart máy
- Hoặc mở terminal mới

Kiểm tra lại:

```bash
ollama --version
```

---

# 📌 Các lệnh thường dùng

| Chức năng | Lệnh |
|---|---|
| Kiểm tra version | `ollama --version` |
| Tải model | `ollama pull qwen2.5:3b` |
| Chạy model | `ollama run qwen2.5:3b` |
| Xem model đã tải | `ollama list` |
| Xem model đang chạy | `ollama ps` |
| Dừng model | `Ctrl + C` |

---

# ✅ Kết quả cuối cùng

Sau khi hoàn tất:

- Ollama đã cài trên máy
- Qwen2.5:3B đã được tải
- Có thể chat AI local ngay trên terminal hoặc web
