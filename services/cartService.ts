import apiClient from './apiClient';
import { Cart } from '../types/cart';

// POST /carts - Thêm một sản phẩm mới vào giỏ hàng
// src/services/cartService.ts

export const addItemToCart = (productId: string, variantId: string, quantity: number) => {
    return apiClient.post<Cart>('/carts/', { productId, variantId, quantity });
};
// GET /carts - Lấy giỏ hàng hiện tại của người dùng
export const getCart = () => {
    return apiClient.get<Cart>('/carts/');
};

// PUT /carts/:productId/:variantId - Cập nhật số lượng
export const updateItemQuantity = (productId: string, variantId: string, quantity: number) => {
    return apiClient.put(`/carts/${productId}/${variantId}`, { quantity });
};

// DELETE /carts/:productId/:variantId - Xóa một sản phẩm khỏi giỏ hàng
export const removeItemFromCart = (productId: string, variantId: string) => {
    return apiClient.delete(`/carts/${productId}/${variantId}`);
};

// DELETE /carts - Xóa toàn bộ giỏ hàng
export const clearCart = () => {
    return apiClient.delete('/carts/');
};