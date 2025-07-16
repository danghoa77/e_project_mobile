// Định nghĩa kiểu cho một ảnh
export interface Image {
  url: string;
  cloudinaryId: string;
}

// Định nghĩa kiểu cho một phiên bản sản phẩm (size, màu sắc, giá...)
export interface Variant {
  _id: string; // _id của riêng variant này
  size: string;
  color: string;
  price: number;
  salePrice?: number;
  stock: number;
}

// Định nghĩa kiểu hoàn chỉnh cho một sản phẩm
export interface Product {
  _id: string; // _id của sản phẩm
  name: string;
  category: string;
  images: Image[];
  variants: Variant[];
  createdAt?: string; // Thêm từ timestamps
  updatedAt?: string; // Thêm từ timestamps
}