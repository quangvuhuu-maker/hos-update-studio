# HOS Monthly Update Studio — Concordia International School Hanoi

Công cụ thiết kế và sắp xếp bản tin **Head of School (HOS) Monthly Update** theo thứ tự ưu tiên chuẩn học đường, hỗ trợ dán trực tiếp từ Google Docs hoặc tải lên file `.docx`.

## Cách chạy trên máy Mac

Dự án đã được khởi chạy sẵn tại:
- **URL**: `http://localhost:8080`

Nếu muốn khởi động lại server bất kỳ lúc nào:
```bash
cd /Users/quangvu/.gemini/antigravity/scratch/hos-update-studio
python3 server.py 8080
```

## Tính năng chính
1. **Dán trực tiếp từ Google Docs (`Cmd + V`) hoặc Upload `.docx`**:
   - Giữ nguyên chữ in đậm/nghiêng, đường link Google Forms/Sheets/Docs, và bảng biểu (như bảng *Regional PD Opportunities*).
2. **Tự động phân loại & sắp xếp theo Thứ Tự Ưu Tiên (Configurable Priority Rules)**:
   - **Priority #1**: Major Calendar & Events (với Date Badges & phân loại sự kiện tự động).
   - **Priority #2**: Key Events, PD & Spotlights (tự động nhận diện khung *Who / What / Where / When / Attire*, lịch trình *Program Schedule*, và bảng *PD Opportunities*).
   - **Priority #3**: Personnel & Admin Updates (Contract dates, EARCOS Rep, Contact Forms, Admin Travel).
   - **Priority #4**: Bus Duty & Campus Operations.
   - **Priority #5**: Faculty & Staff Birthdays (hiển thị dạng lưới 2 cột trang trọng, hỗ trợ đổi `Last, First` sang `First Last`).
   - **Priority #6**: Questions, Comments, Concerns & Prayer Requests (tách bạch phần Form ẩn danh và khung trả lời chính thức `Question` / `HOS Response`).
   - **Priority #7**: Devotions Sign-ups.
   - **Priority #8**: HOS Update Archive (luôn ghim ở cuối bản tin dưới dạng các thẻ tài liệu gọn gàng).
3. **Smart CTA Synthesizer**:
   - Tự động chuyển các link ẩn trong chữ `"here"`, `"form"`, `"RSVP"` thành nút bấm Call-To-Action rõ nghĩa (ví dụ: *Update Hanoi Contact Info*, *Local Emergency Contact Form*, *Sign Up to Lead Devotions*, *RSVP (by Nov. 13th)*).
4. **Bộ 6 Themes Học Đường & Lễ Hội**:
   - **Concordia Signature** (Xanh lá Concordia `#005a34`, Trắng & Vàng kim, kèm Banner chính thức của trường).
   - **Christmas & Advent** (Giáng Sinh).
   - **Tết Nguyên Đán** (Lunar New Year).
   - **Easter & Spring Renewal** (Lễ Phục Sinh).
   - **Autumn & Thanksgiving** (Mùa Thu / Lễ Tạ Ơn).
   - **Mid-Autumn & International** (Tết Trung Thu).
5. **Xuất bản 1-Click**:
   - **Copy for Email (Gmail/Outlook)**: Tự động đóng gói HTML kèm Inline CSS tương thích 100% khi dán (`Cmd + V`) vào Gmail hoặc Outlook.
   - **Copy HTML**: Lấy mã nguồn HTML.
   - **Print / PDF**: Giao diện in và lưu file PDF sạch đẹp.

