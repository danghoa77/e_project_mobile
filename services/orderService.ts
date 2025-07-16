import apiClient from './apiClient';
import { Order, ShippingAddress } from '../types/order';
import { CartItem } from '../types/cart';

// Định nghĩa payload để tạo order
interface CreateOrderPayload {
    items: CartItem[];
    shippingAddress: ShippingAddress;
}

// GET /orders - Lấy các đơn hàng của người dùng hiện tại
export const getMyOrders = () => {
    return apiClient.get<Order[]>('/orders/');
};

// POST /orders - Tạo một đơn hàng mới
export const createOrder = (payload: CreateOrderPayload) => {
    return apiClient.post('/orders/', payload);
};