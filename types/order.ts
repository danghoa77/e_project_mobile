// Định nghĩa địa chỉ giao hàng
export interface ShippingAddress {
    street: string;
    city: string;
}

// Định nghĩa cho một sản phẩm trong đơn hàng
export interface OrderItem {
    productId: string;
    variantId: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
}

// Định nghĩa cho toàn bộ đơn hàng (khớp với schema mới nhất)
export interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: ShippingAddress;
    createdAt: string;
    updatedAt: string;
}