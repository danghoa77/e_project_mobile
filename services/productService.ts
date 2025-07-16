import apiClient from "./apiClient";
import { Product } from "../types/product"; // Import type Product

interface ProductQuery {
  page?: number;
  limit?: number;
}

export const getAllProducts = (query: ProductQuery) =>
  apiClient.get("/products/", { params: query });

// Thêm <Product> để định nghĩa kiểu dữ liệu trả về cho response.data
export const getProductById = (productId: string) =>
  apiClient.get<Product>(`/products/${productId}/`);