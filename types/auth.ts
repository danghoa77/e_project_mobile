// src/types/auth.ts

// --- Gửi yêu cầu (Payloads) ---

/**
 * Payload để đăng nhập.
 * Giữ nguyên vì đã khớp với LoginUserDto (chỉ cần email và password).
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Payload để đăng ký người dùng mới.
 * Cập nhật để khớp hoàn toàn với RegisterUserDto.
 */
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "customer" | "admin"; // Role là bắt buộc khi đăng ký
}

/**
 * Payload để cập nhật thông tin người dùng.
 * Được tạo mới dựa trên UpdateUserDto, tất cả các trường đều là tùy chọn.
 * Interface này sẽ rất hữu ích cho màn hình "Chỉnh sửa thông tin cá nhân".
 */
export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  addresses?: Address[];
}

// --- Nhận dữ liệu (Data Models) ---

/**
 * Cấu trúc cho một địa chỉ.
 * Dựa trên AddressDto được định nghĩa trong UpdateUserDto.
 */
export interface Address {
  street: string;
  city: string;
  isDefault?: boolean;
}

/**
 * Cấu trúc hoàn chỉnh cho đối tượng User.
 * Cập nhật để khớp với GetUserDto mà backend sẽ trả về.
 * Đây là model dữ liệu chính cho người dùng đã đăng nhập.
 */
export interface User {
  _id: string; // Thêm _id vì đây là khóa chính, rất quan trọng
  email: string;
  name: string;
  phone: string;
  role: "customer" | "admin";
  addresses: Address[]; // Sử dụng interface Address đã định nghĩa ở trên
  createdAt: string; // API JSON thường trả về Date dưới dạng chuỗi ISO 8601
  updatedAt: string;
}
