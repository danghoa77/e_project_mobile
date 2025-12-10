import apiClient from "./axios";

const cartApi = {
    getCart: async () => {
        try {
            const res = await apiClient.get("/carts/");
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },
    addItemToCart: async (payload: any) => {
        try {
            const res = await apiClient.post("/carts/", payload);
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },


    removeItemFromCart: async (pid: string, vid: string, sid: string) => {
        try {
            const res = await apiClient.delete(`/carts/${pid}/${vid}/${sid}/`);
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },

    updateQuantity: async (pid: string, vid: string, sid: string, quantity: number) => {
        try {
            const res = await apiClient.put(`/carts/${pid}/${vid}/${sid}/`, { quantity });
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },

    deleteCart: async () => {
        try {
            const res = await apiClient.delete("/carts/");
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },

    decreaseStock: async (items: { productId: string; variantId: string; quantity: number }[]) => {
        try {
            const res = await apiClient.patch("/products/stock/decrease/", {
                items: items,
            });
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw error;
        }
    },

};
export { cartApi };

