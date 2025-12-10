import apiClient from "./axios";

const paymentApi = {
    createMomoUrl: async (orderId: string, amount: number) => {
        try {
            const res = await apiClient.post("/payments/momo/create/", { orderId, amount });
            console.log(res.data);
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },

    momoUrlReturn: async (orderId: string, resultCode: string) => {
        try {
            const res = await apiClient.post("/payments/momo/return/", { orderId, resultCode });
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },

    createVnpayUrl: async (orderId: string, amount: number) => {
        try {
            const res = await apiClient.post("/payments/vnpay/create/", { orderId, amount });
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },

    vnpayReturn: async (orderId: string, responseCode: string) => {
        try {
            const res = await apiClient.post("/payments/vnpay/return/", { orderId, responseCode });
            return res.data;
        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },
};
export default paymentApi;