# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)
**Mini-Project Title:** Mini-Project 1 - VKU Campus Facilities Audit
**Student Name:** Pham Thi Xuan Hang
**Submission Date:** 11/09/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Pham Thi Xuan Hang — Student ID: [Nhập Mã SV của bạn vào đây] — Role: Fullstack Developer — Contribution: 100%
* **🔗 Live Demo URL:** [https://vku-campus-audit.vercel.app](https://vku-campus-audit.vercel.app) *(Có thể cài đặt trực tiếp thành PWA từ trình duyệt)*
* **💻 GitHub Repository:** [https://github.com/XuanHang910/vku-campus-audit](https://github.com/XuanHang910/vku-campus-audit)
* **📦 Native APK:** Đã build thành công file `VKU_Campus_Audit.apk` qua Capacitor.
* **🎥 Video Demo (Optional):** [Nhập link video demo của bạn nếu có]

---

## 2. FEATURE IMPLEMENTATION CHECKLIST
| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | Responsive Mobile-First Viewport & UI | ✅ Complete | Giao diện chuẩn Mobile-first, phong cách Glassmorphism với tone màu VKU Pastel. |
| 2 | Local Offline Persistence (Zero Data Loss) | ✅ Complete | Sử dụng thư viện `idb` (IndexedDB) với mô hình 3 lớp: `drafts`, `sync_queue`, `synced_items`. |
| 3 | Automatic Background Sync | ✅ Complete | Tự động đồng bộ hóa hàng đợi (Queue) lên Server ngay khi có mạng (dùng `SyncEngine` + Capacitor Network). |
| 4 | Native Hardware Capabilities (Capacitor) | ✅ Complete | Tích hợp thành công `@capacitor/camera` và `@capacitor/geolocation` để thu thập bằng chứng. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE
- **Framework & Libraries:** Dự án xây dựng bằng React 19, TypeScript, Vite, Tailwind CSS 3 và Capacitor 6.
- **Directory Structure:**
  - `src/components/`: Chứa các UI thành phần như `MultiStepForm.tsx`, `AuditHistoryModal.tsx`, và `NetworkStatusBar.tsx` (có tích hợp Simulator).
  - `src/db/indexedDb.ts`: Lớp tương tác CSDL cục bộ (Local Database Layer), xử lý transaction ACID.
  - `src/services/syncEngine.ts`: Logic lắng nghe trạng thái mạng (Network status) và đồng bộ hàng đợi FIFO (First-in, First-out).
- **State Management & Exception Handling:** Quản lý trạng thái bằng React Hooks (`useState`, `useEffect`). Các giao dịch chuyển form từ bản nháp (Draft) sang Hàng đợi (Queue) sử dụng Two-Phase Commit (`readwrite` transaction trong IndexedDB) để đảm bảo không thất thoát dữ liệu ngay cả khi ứng dụng bị tắt đột ngột (Crash).

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

*(Gợi ý: Bạn hãy chụp 3-4 ảnh màn hình ứng dụng đang chạy trên điện thoại hoặc máy ảo và chèn thay thế vào các dòng dưới đây)*

1. **Hình 1:** Giao diện Form nhập liệu các bước (Glassmorphism UI).
2. **Hình 2:** Thanh thông báo mất mạng (Offline) và hàng đợi chờ đồng bộ.
3. **Hình 3:** Bảng dữ liệu Data Inspector hiển thị các bản ghi đã lưu tại Local IndexedDB.
4. **Hình 4:** Tính năng bật Camera chụp ảnh và lấy tọa độ GPS.

*(Chèn ảnh bằng cú pháp: `![Tên ảnh](đường_dẫn_ảnh)`)*

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS
* **Challenge 1: Đảm bảo Type-Safety khi làm việc với IndexedDB và Vite.**
  - *Vấn đề:* Quá trình build PWA ban đầu gặp lỗi `SyntaxError` do Vite nhầm lẫn giữa Type (DBSchema) và Value thực tế khi import từ thư viện `idb`.
  - *Cách giải quyết:* Chuẩn hóa toàn bộ mã nguồn sử dụng `import type` cho các Interface (`AuditRecord`, `DBSchema`) giúp quá trình Tree-shaking và Bundle diễn ra thành công.
* **Challenge 2: Xung đột Gradle Toolchain và AndroidX khi Build APK Native.**
  - *Vấn đề:* Khi dùng Capacitor biên dịch ra APK, Gradle báo lỗi không tìm thấy JDK 21 và xung đột phiên bản `androidx.core`.
  - *Cách giải quyết:* Cấu hình `org.gradle.toolchains.foojay-resolver-convention` vào `settings.gradle` để tự tải JDK, đồng thời ghi đè (force resolution) các thư viện androidx ở file `build.gradle` cấp ứng dụng. Quá trình biên dịch APK thành công mỹ mãn.
