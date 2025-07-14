import apiClient from "./apiClient";

export const getAllProducts = () => apiClient.get("/products/");
export const getProductById = (productId: string) =>
  apiClient.get(`/products/${productId}/`);
