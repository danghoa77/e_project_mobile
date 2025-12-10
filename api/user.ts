import apiClient from "./axios";

const userApi = {
    getAddresses: async () => {
        try {
            const res = await apiClient.get("/users/me/");
            return res.data.addresses = res.data.addresses || [];

        } catch (error: any) {
            console.error("API error:", error.response?.data || error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    },
}
export default userApi;