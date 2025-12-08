import apiClient from "./axios";

export const authApi = {
    login: async (email: string, password: string) => {
        const res = await apiClient.post('/auth/login', { email, password });
        console.log(res);
        return res.data;
    },
    register: async (payload: any) => {
        const res = await apiClient.post('/auth/register', { payload });
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