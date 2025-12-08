
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { router } from "expo-router";
import { toast } from 'sonner-native';


// const extra = Constants.expoConfig?.extra ?? {};
export const API_BASE_URL = "https://1266da291f3f.ngrok-free.app";
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    }
});
apiClient.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

//interceptor token in request
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// interceptor token in response    
apiClient.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response?.status === 401) {
            const authStore = useAuthStore.getState();
            authStore.logout();
            toast.error("Please login.");
            router.replace("/(auth)/login");

            return;
        }

        return Promise.reject(error);
    }
);



export default apiClient;