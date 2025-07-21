// src/screens/LoginScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, Platform, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri, ResponseType } from 'expo-auth-session';

// 1. Import API_BASE_URL và GOOGLE_CLIENT_ID
import { API_BASE_URL, GOOGLE_CLIENT_ID } from '@env';
console.log('API_BASE_URL =', API_BASE_URL);
WebBrowser.maybeCompleteAuthSession();

const discovery = {
    authorizationEndpoint: `${API_BASE_URL}/auth/google`,
};

export default function LoginScreen({ navigation }: any) {
    const { signIn, signInWithToken } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [request, response, promptAsync] = useAuthRequest(
        {
            // 2. Thêm clientId vào đây
            clientId: GOOGLE_CLIENT_ID,
            responseType: ResponseType.Code,
            redirectUri: makeRedirectUri({
                scheme: 'e_project_mobile',
                path: 'auth/success',
            }),
        },
        discovery
    );

    useEffect(() => {
        const handleGoogleLogin = async () => {
            if (response?.type === 'success') {
                const { url } = response;
                const params = new URL(url).searchParams;
                const token = params.get('token');

                if (token) {
                    try {
                        await signInWithToken(token);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTabs' }],
                        });
                    } catch (err) {
                        Alert.alert('Đăng nhập thất bại', 'Không thể đăng nhập với Google');
                    }
                }
            }
        };

        handleGoogleLogin();
    }, [response]);


    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu.");
            return;
        }
        try {
            await signIn({ email, password });
        } catch (error: any) {
            Alert.alert("Đăng nhập thất bại", error.message);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng Nhập</Text>

            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Đăng nhập" onPress={handleLogin} />
            <Button title="Chưa có tài khoản? Đăng ký" onPress={() => navigation.navigate('Register')} />

            <View style={{ marginVertical: 10 }} />

            <Button
                disabled={!request}
                title="Đăng nhập với Google"
                onPress={() => {
                    promptAsync();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});