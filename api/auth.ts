import apiClient from "./axios";

export const authApi = {
    login: async (email: string, password: string) => {
        const res = await apiClient.post('/auth/login', { email, password });
        console.log(res);
        return res.data;
    },
    register: async (name: string, email: string, phone: string, password: string, role: string) => {
        const res = await apiClient.post('/auth/register', {
            name,
            email,
            phone,
            password,
            role
        });

        return res.data;
    },

    logOut: async () => {
        const res = await apiClient.post('/auth/logout');
        return res.data;
    },

    getUserProfile: () => {
        return apiClient.get('/users/me');
    },

    getGoogleUrl: () => {
        return `${"http://localhost:80"}/auth/google/`;
    }
};