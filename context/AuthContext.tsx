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
    signInWithToken: (token: string) => Promise<void>;
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

    const handleSignInWithToken = async (token: string) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            setUserToken(token);

            const userResponse = await authService.getMe();
            setUserInfo(userResponse.data);
        } catch (e) {
            console.error("Failed to sign in with token", e);
            await handleSignOut();
        }
    };

    const handleSignIn = async (payload: LoginPayload) => {
        try {
            const response = await authService.login(payload);
            const { access_token } = response.data;
            await AsyncStorage.setItem('userToken', access_token);
            setUserToken(access_token);

            const userResponse = await authService.getMe();
            setUserInfo(userResponse.data);
        } catch (e: any) {
            console.error("Login failed");
            if (e.response) {
                console.error("Error from Server:", e.response.data);
            }
            throw new Error("Login failed.");
        }
    };

    const handleSignOut = async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
        setUserInfo(null);
    };

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                setUserToken(token);
                const userResponse = await authService.getMe();
                setUserInfo(userResponse.data);
            }
        } catch (e: any) {
            console.error("--- TOKEN CHECK FAILED ---");

            if (e.response) {
                console.error("(Response Error):");
                console.log("-> Status:", e.response.status);
                console.log("-> Data:", e.response.data);
            } else if (e.request) {
                console.error("(Request Error)");
            } else {
                console.error("(General Error):", e.message);
            }

            console.log("--- Request Config ---");
            console.log("URL:", e.config.url);
            console.log("Method:", e.config.method);

            await handleSignOut();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{
            signIn: handleSignIn,
            signInWithToken: handleSignInWithToken,
            registerAndSignIn: handleRegisterAndSignIn,
            signOut: handleSignOut,
            userToken,
            userInfo,
            isLoading
        }}>
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
