import { GetProductsResponse } from "@/types/product";
import apiClient from "./axios";

const productApi = {
    fetchProducts: async (payload?: any): Promise<GetProductsResponse> => {
        try {
            const query = new URLSearchParams();

            if (payload?.category) query.append("category", payload.category);
            if (payload?.sortBy) query.append("sortBy", payload.sortBy);
            if (payload?.page) query.append("page", String(payload.page));
            if (payload?.limit) query.append("limit", String(payload.limit));

            if (payload?.price) {
                if (payload.price.min !== undefined) {
                    query.append("priceMin", String(payload.price.min));
                }
                if (payload.price.max !== undefined) {
                    query.append("priceMax", String(payload.price.max));
                }
            }
            if (payload?.size && Array.isArray(payload.size) && payload.size.length > 0) {
                query.append("size", payload.size[0]);
            } else if (payload?.size && typeof payload.size === "string") {
                query.append("size", payload.size);
            }

            if (payload?.search && payload.search.trim() !== "") {
                query.append("search", payload.search.trim());
            }

            if (payload?.color) query.append("color", payload.color);

            const res = await apiClient.get<GetProductsResponse>(
                `/products/?${query.toString()}`
            );
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },

    findOneProduct: async (id: string) => {
        try {
            const res = await apiClient.get(`/products/${id}/`);
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },
    topProducts: async () => {
        try {
            const res = await apiClient.get("/orders/top-products/");
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },
    getAllCategory: async () => {
        const response = await apiClient.get('/products/categories/all');
        return response.data;
    },
    createRating: async (payload: any) => {
        const response = await apiClient.post('/products/rating/', payload);
        return response.data;
    },
    deleteRating: async (pId: string) => {
        const response = await apiClient.delete(`/products/${pId}/rating/`);
        return response.data;
    },
}
export default productApi;