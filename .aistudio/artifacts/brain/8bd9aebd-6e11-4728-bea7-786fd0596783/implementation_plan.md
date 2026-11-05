# Loại Bỏ Nút Đăng Nhập & Ảnh Đại Diện Trên Thanh Tiêu Đề Chính

Kế hoạch này loại bỏ nút ảnh đại diện và khối tài khoản người dùng trên thanh tiêu đề trên cùng (TopBar) theo yêu cầu xác nhận của người dùng, mang lại giao diện tinh giản, thoáng đãng và chuẩn trải nghiệm nghe đọc hiện đại.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Các quyết định đã xác nhận trực tiếp từ người dùng:**
> - **Vị trí loại bỏ:** Bỏ hoàn toàn ảnh đại diện và nút đăng nhập/tài khoản trên thanh tiêu đề trên cùng (`SpotifyTopBar.tsx`) ở cả giao diện di động lẫn máy tính để bàn.
> - **Cơ chế truy cập cài đặt & tài khoản:** Bỏ nút kích hoạt menu cài đặt trên thanh tiêu đề chính; hệ thống tự động duy trì phiên đăng nhập và quyền hạn hiện tại (tài khoản `xuanduy.cn@gmail.com` vẫn giữ nguyên quyền Admin tối cao để xóa sách, xóa bài hát trong thư viện) mà không hiển thị khối avatar gây vướng mắt.
> - **Bảo toàn bố cục:** Giữ nguyên thanh tìm kiếm trung tâm, nút điều hướng Trang trước / Trang sau trên máy tính và nút quay lại trên di động.

---

### 1. Overview & Core Concept

- **Mục tiêu**: Tối ưu hóa không gian hiển thị trên thanh tiêu đề chính (`TopBar`), loại bỏ các nút đại diện người dùng, mang lại cảm giác tập trung 100% vào nội dung sách nói, âm nhạc và xưởng sáng tạo AI.
- **Đối tượng sử dụng**: Người nghe sách nói, người sáng tạo âm nhạc AI và tác giả sách muốn trải nghiệm giao diện tối giản, không bị phân tâm bởi các nút tài khoản lặp lại.
- **Giá trị cốt lõi**: Không gian hiển thị thanh lịch, gọn gàng, giảm thiểu chi tiết thừa theo triết lý thiết kế hiện đại.

---

### 2. User Experience & Visual Design

#### Giao diện di động (Mobile TopBar < 768px):
- **Bên trái**: Khi ở trang chi tiết (`book-detail`), hiển thị nút "Quay lại" gọn gàng. Khi ở trang chính, hiển thị tiêu đề thương hiệu chữ trang nhã **DiNo** hoặc để trống thoáng đãng thay vì nút đại diện người dùng cồng kềnh.
- **Bên phải**: Giữ lại biểu tượng Tìm kiếm và nút Thêm nhanh với vùng chạm đạt chuẩn tối thiểu 44px.

#### Giao diện máy tính (Desktop TopBar ≥ 768px):
- **Bên trái**: Giữ nút điều hướng lùi/tiến (History Navigation Arrows).
- **Ở giữa**: Ô tìm kiếm toàn diện cho sách nói và bài hát AI với phím tắt xóa nhanh.
- **Bên phải**: Giữ nút "Thêm mới" vàng hổ phách nổi bật; gỡ bỏ khối ảnh đại diện người dùng, vương miện Admin và biểu tượng mây đồng bộ dư thừa.

---

### 3. Key Product Decisions & Trade-Offs

- **Quyết định 1: Gỡ bỏ ảnh đại diện khỏi TopBar mà không làm mất trạng thái người dùng**
  - *Phương án thực hiện*: Xóa bỏ phần tử `<button onClick={onOpenUserAccount}>` và khối avatar 12 con giáp khỏi `SpotifyTopBar.tsx`.
  - *Lý do*: Đáp ứng chính xác mong muốn của người dùng ("bỏ luôn"). Dữ liệu tài khoản (`userSync.user`, vai trò Admin của `xuanduy.cn@gmail.com`) vẫn được duy trì trong state của ứng dụng để đảm bảo quyền hạn xóa/sửa không bị ảnh hưởng.
  - *Giải pháp thay thế*: Giữ nút cài đặt thu nhỏ ở góc — bị loại bỏ vì người dùng đã chọn "bỏ luôn".

- **Quyết định 2: Tối ưu thanh tiêu đề đạt chuẩn Top Bar Contract**
  - *Phương án thực hiện*: Đảm bảo cấu trúc 3 vùng (Zone 1: Navigation / Brand, Zone 2: Search input, Zone 3: Primary Action `Thêm mới`) với khoảng cách cân đối, không wrap dòng.

---

### 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                               App.tsx                                  │
│             (Quản lý trạng thái Sách, Nhạc & Quyền Admin)              │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│      SpotifySidebar.tsx      │          │      SpotifyTopBar.tsx       │
│  - Thanh điều hướng bên trái │          │  - Gỡ bỏ avatar người dùng   │
│  - Kho lưu trữ & Xưởng AI    │          │  - Tìm kiếm & Thêm mới       │
│  - Logo DiNo ở chân trang    │          │  - Điều hướng mượt mà        │
└──────────────────────────────┘          └──────────────────────────────┘
```

#### Các tác vụ triển khai cụ thể:
1. **Chỉnh sửa `src/components/SpotifyTopBar.tsx`**:
   - Loại bỏ khối nút avatar người dùng trên giao diện mobile (thay bằng thương hiệu DiNo tối giản hoặc nút điều hướng).
   - Loại bỏ khối avatar người dùng và nút kích hoạt tài khoản trên giao diện desktop.
   - Giữ nguyên các handler tìm kiếm và thêm mới sách.
2. **Kiểm tra và xác thực**:
   - Kiểm tra tương thích kiểu dữ liệu bằng `lint_applet` (`tsc --noEmit`).
   - Kiểm tra biên dịch ứng dụng qua `compile_applet`.
   - Khởi động lại dev server và kiểm tra trực quan trên trình duyệt.
