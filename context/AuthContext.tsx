import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { LoginPayload, User, RegisterPayload } from '../types/auth';

interface AuthContextType {
    userToken: string | null;
    userInfo: User | null;
    isLoading: boolean;
    signIn: (payload: LoginPayload) => Promise<void>;
    registerAndSignIn: (payload: RegisterPayload) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<User | null>(null);

    const handleRegisterAndSignIn = async (payload: RegisterPayload) => {
        try {
            const response = await authService.register(payload);
            const { access_token } = response.data;
            await AsyncStorage.setItem('userToken', access_token);
            setUserToken(access_token);

            const userResponse = await authService.getMe();
            setUserInfo(userResponse.data);
        } catch (e) {
            console.error("Registration failed", e);
            throw e;
        }
    };

    const handleSignIn = async (payload: LoginPayload) => {
        try {
            const response = await authService.login(payload);
            const { access_token } = response.data;
            await AsyncStorage.setItem('userToken', access_token);
            setUserToken(access_token);

            // --- BỎ COMMENT CÁC DÒNG NÀY ---
            const userResponse = await authService.getMe();
            setUserInfo(userResponse.data);
            // ------------------------------------

        } catch (e: any) { // Thêm :any để bắt lỗi chi tiết
            console.error("Login failed");
            // Log lỗi chi tiết giống như ở checkLoginStatus để dễ debug
            if (e.response) {
                console.error("Lỗi từ Server:", e.response.data);
            }
            throw new Error("Đăng nhập thất bại.");
        }
    };

    const handleSignOut = async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
        setUserInfo(null);
    };

    // bên trong hàm AuthProvider của file AuthContext.tsx

    const checkLoginStatus = async () => {
        try {
            // ... code trong khối try không đổi ...
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                setUserToken(token);
                const userResponse = await authService.getMe();
                setUserInfo(userResponse.data);
            }
        } catch (e: any) { // <-- Thêm : any ở đây để TypeScript không báo lỗi

            // --- BẮT ĐẦU THAY ĐỔI ---
            console.error("--- TOKEN CHECK FAILED ---");

            if (e.response) {
                // Trường hợp server phản hồi lại với một mã lỗi (4xx, 5xx)
                // Đây là trường hợp của bạn (404)
                console.error("Lỗi từ Server (Response Error):");
                console.log("-> Status:", e.response.status); // Ví dụ: 404
                console.log("-> Data:", e.response.data); // Nội dung lỗi mà backend trả về, quan trọng nhất!

            } else if (e.request) {
                // Trường hợp request đã được gửi đi nhưng không nhận được phản hồi
                // (Thường do sai địa chỉ IP, server backend bị sập, hoặc mất mạng)
                console.error("Không nhận được phản hồi (Request Error)");

            } else {
                // Lỗi khác xảy ra khi thiết lập request
                console.error("Lỗi không xác định (General Error):", e.message);
            }

            console.log("--- Request Config ---");
            console.log("URL:", e.config.url); // Kiểm tra xem URL có đúng là /users/me không
            console.log("Method:", e.config.method); // Kiểm tra phương thức
            // --- KẾT THÚC THAY ĐỔI ---

            await handleSignOut(); // Vẫn đăng xuất người dùng nếu token lỗi
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ signIn: handleSignIn, registerAndSignIn: handleRegisterAndSignIn, signOut: handleSignOut, userToken, userInfo, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};