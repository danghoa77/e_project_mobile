// Định nghĩa cho một sản phẩm trong giỏ hàng (dữ liệu đã được populate từ backend)
export interface CartItem {
    productId: string;
    variantId: string;
    quantity: number;
    name: string;
    image: string; // URL ảnh đại diện của sản phẩm
    size: string;
    color: string;
    price?: number;
}

// Định nghĩa cho toàn bộ giỏ hàng
export interface Cart {
    _id: string;
    userId: string;
    items: CartItem[];
}