# Hướng Dẫn Trình Bày & Demo Ứng Dụng CropWise

Tài liệu này hướng dẫn chi tiết kịch bản thuyết trình và demo thực tế ứng dụng **CropWise** - Trợ lý Nông nghiệp Thông minh ứng dụng Trí tuệ Nhân tạo.

---

## 1. Tổng Quan Về Ứng Dụng (Giới Thiệu Chung)
* **Tên ứng dụng**: **CropWise**
* **Thông điệp cốt lõi**: Đồng hành cùng người nông dân tối ưu năng suất cây trồng bằng AI và Kết nối cộng đồng chia sẻ dịch bệnh.
* **Ngôn ngữ thiết kế**: Giao diện tối mờ cao cấp (**Dark Glassmorphism**) lấy cảm hứng từ các thiết bị thông minh hiện đại, giúp hiển thị trực quan và giảm mỏi mắt cho nông dân khi sử dụng ngoài đồng ruộng.

---

## 2. Các Công Nghệ Sử Dụng (Tech Stack)
* **Frontend**: React Native, Expo SDK, Expo Router, Expo-Speech (Đọc giọng nói), Expo-Location (Định vị GPS).
* **Backend & AI**: Python FastAPI (Server AI), PyTorch CNN (Mô hình phân loại bệnh và phát hiện vùng lá nhiễm bệnh qua Bounding Box).
* **Cơ sở dữ liệu & Dịch vụ**: Firebase Firestore (Realtime Database), Firebase Authentication, OpenWeatherMap API (Dữ liệu thời tiết).

---

## 3. Kịch Bản Demo Chi Tiết (Step-by-Step Demo Flow)

Kịch bản demo được chia làm **5 bước** tương ứng với các chức năng nổi bật nhất của ứng dụng:

### 🚀 Bước 1: Trang Cây Trồng & Chẩn Đoán Bệnh Bằng AI (Crops Tab)
* **Kịch bản thực hiện**:
  1. Mở ứng dụng, giới thiệu màn hình **Cây Trồng** nổi trên nền gradient huyền ảo.
  2. Chỉ ra **Thẻ thời tiết địa phương**: Lấy dữ liệu GPS thời gian thực từ vị trí của người dùng để đưa ra khuyến cáo nhiệt độ/mưa hôm nay.
  3. Nhấp vào nút **Chụp ảnh bệnh** (hoặc chọn ảnh từ thư viện):
     - Tải lên một chiếc lá ngô bị nhiễm bệnh (VD: Bệnh Đốm lá lớn - *Large Leaf Spot*).
     - Màn hình hiển thị trạng thái loading phân tích ảnh động mượt mà.
     - Hiển thị hộp thoại kết quả chẩn đoán với độ tin cậy phần trăm (%) sắc nét.
  4. **Điểm nhấn đặc biệt (AI Bounding Box)**:
     - Nhấp vào hình ảnh kết quả phân tích để phóng to.
     - Show khung chữ nhật màu xanh lá bao quanh chuẩn xác vùng lá ngô bị tổn thương (tính toán tỉ lệ xích hình ảnh thời gian thực).
  5. **Demo Quét hàng loạt (Batch Scan)**:
     - Nhấp nút **Chọn nhiều ảnh** và chọn 3-5 ảnh lá ngô bệnh cùng lúc.
     - Show tiến trình AI phân tích song song và hiển thị bảng tổng hợp kết quả của từng ảnh cùng độ tin cậy tương ứng.

### 🧪 Bước 2: Tính Toán Phân Bón Gợi Ý (Fertilizer Calculator)
* **Kịch bản thực hiện**:
  1. Từ màn hình chính, nhấp vào thẻ **Tính toán phân bón**.
  2. Chọn triệu chứng thiếu chất của lá (VD: *Lá vàng thiếu Đạm/N*, *Lá tím thiếu Lân/P*).
  3. Nhập diện tích thửa ruộng (VD: `5000 m²`) và mức độ nhiễm bệnh của lá (VD: `45%`).
  4. Nhấp nút **Tính toán**:
     - Ứng dụng tính toán số kg N, P, K nguyên chất cần bổ sung dựa trên diện tích.
     - Đề xuất loại phân bón thương mại phù hợp nhất (VD: *NPK Đầu trâu*, *Phân URE Cà Mau*), tính toán chính xác số kg cần mua và dự toán chi phí.
  5. Nhấp nút mũi tên quay lại ở góc trái tiêu đề để trở về trang chính.

### 📚 Bước 3: Tra Cứu Cẩm Nang Sâu Bệnh & Trợ Lý Giọng Nói (Pests & Diseases)
* **Kịch bản thực hiện**:
  1. Nhấp chọn thẻ **Sâu hại và Bệnh cây trồng**.
  2. Sử dụng thanh tìm kiếm để lọc nhanh bệnh (VD: gõ "Đốm lá" hoặc "Rỉ sắt").
  3. Chọn một bệnh cụ thể để xem chi tiết:
     - Thẻ thông tin chia rõ các Tab: *Mô tả*, *Triệu chứng*, *Điều trị*, *Phòng ngừa*.
  4. **Tính năng Hỗ trợ Nông dân**: Nhấp nút **Nghe** (Volume) ở góc phải phía trên:
     - Hệ thống kích hoạt giọng nói nhân tạo chuẩn tiếng Việt để đọc chi tiết phác đồ xử lý, giúp bà con nông dân lớn tuổi dễ dàng nghe hướng dẫn trực tiếp tại đồng ruộng mà không cần đọc chữ nhỏ.

### 🗺️ Bước 4: Quản Lý Ruộng Của Tôi & Bản Đồ Cảnh Báo Ổ Dịch (My Fields Tab)
* **Kịch bản thực hiện**:
  1. Chuyển sang tab **Ruộng của tôi**.
  2. Giới thiệu thẻ thông tin thửa ruộng hiện tại (diện tích, giống cây trồng, số ngày tuổi sau khi gieo sạ).
  3. **Bản đồ khoanh vùng dịch**: Hiển thị vòng tròn cảnh báo có bán kính đỏ/vàng trên bản đồ vệ tinh quanh thửa ruộng của bạn nếu khu vực lân cận xuất hiện ổ dịch.
  4. **Mô phỏng Drone quét sức khỏe**:
     - Nhấp nút **Quét sức khỏe** ở góc phải bên dưới.
     - Kênh truyền tin với Drone CropWise được thiết lập, Drone bay tự động trên thực địa để chụp phổ ảnh NDVI.
     - Show **Lưới ô sức khỏe đa phổ** thời gian thực (Xanh: Khỏe mạnh, Vàng: Thiếu đạm, Đỏ: Phát hiện ổ nấm lá). Điểm số sức khỏe của ruộng tự động được cập nhật lên Firestore.
  5. **Báo cáo ổ dịch mới**:
     - Nhấp nút **Cảnh báo ổ dịch** (nút màu đỏ bên trái).
     - Nhập tiêu đề, mô tả và bán kính phát tán ổ dịch nguy hiểm (VD: *Ổ dịch rỉ sắt ngô lan nhanh*, bán kính *1000m*).
     - Khi lưu, bản đồ cảnh báo chung sẽ lập tức cập nhật vùng đỏ để cảnh báo các thửa ruộng khác ở xung quanh.

### 💬 Bước 5: Diễn Đàn Cộng Đồng & Tương Tác Chuyên Gia (Community Tab)
* **Kịch bản thực hiện**:
  1. Chuyển sang tab **Cộng đồng**.
  2. Show các bài đăng thảo luận giữa nông dân và các chuyên gia nông nghiệp (đã đổi tên chân thực: *Anh Sáu Trồng Ngô*, *Bác Năm Trại Giống*, *Chuyên Gia Khuyến Nông*...).
  3. **Hệ thống đánh giá điểm tin cậy**:
     - Nhấp nút **Like** (Thích) hoặc **Dislike** (Không thích) trên các bài viết.
     - Giải thích cơ chế chấm điểm: Nếu tài khoản Chuyên gia nhấn Thích, điểm độ tin cậy của bài viết tăng ngay 2 điểm (`+2`), tài khoản nông dân tăng (`+1`), giúp bộ lọc bài viết chính xác đẩy các phác đồ uy tín lên đầu.
  4. Thử bình luận dưới bài đăng để kiểm tra phản hồi tức thì.
  5. Mở danh sách **Thông báo** (chuông thông báo) để kiểm tra các cập nhật bình luận mới hoặc cảnh báo dịch bệnh vừa được gửi.

---

## 4. Các Điểm Cộng Đắt Giá Khi Trình Bày (Key Pitching Points)
1. **Thiết thực cho nông nghiệp**: Giải quyết đúng bài toán thiếu kiến thức chẩn đoán sâu bệnh và tính toán phân bón tự phát của nông dân Việt Nam.
2. **AI Bounding Box**: Không chỉ phân loại bệnh chung chung, AI chỉ ra được chính xác vùng lá bệnh giúp nông dân dễ dàng nhận biết vị trí cắt tỉa hoặc phun thuốc.
3. **Speech Assistant**: Tính năng đọc bằng giọng nói thiết thực, nhân văn với nông dân lớn tuổi hoặc mắt kém.
4. **Cơ chế Đồng thuận cộng đồng**: Điểm tin cậy bài đăng dựa trên vai trò tài khoản (Chuyên gia/Nông dân) ngăn ngừa tin đồn thất thiệt về dịch hại.
5. **Đồng bộ đám mây thời gian thực (Firebase Realtime)**: Cập nhật cảnh báo dịch bệnh ngay lập tức cho các hộ nông dân xung quanh khu vực.
