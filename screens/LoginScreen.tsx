import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, TextInput, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import axios from 'axios';
import { API_BASE_URL, GOOGLE_CLIENT_ID } from '@env';
import { useAuth } from '../context/AuthContext';
import * as AuthSession from 'expo-auth-session';


WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
    const { signIn, signInWithToken } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [request, response, promptAsync] = Google.useAuthRequest({
        // Sử dụng expoClientId và đảm bảo GOOGLE_CLIENT_ID là của Web application
        clientId: GOOGLE_CLIENT_ID,
    });
    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (response?.type === 'success') {
                const { authentication } = response;
                if (authentication?.accessToken) {
                    try {
                        // Dùng accessToken của Google để lấy thông tin người dùng
                        const { data: googleUser } = await axios.get(
                            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${authentication.accessToken}`
                        );

                        const { id: googleId, email, given_name: firstName, family_name: lastName, picture } = googleUser;

                        // Gửi thông tin về backend để lấy token của hệ thống
                        const res = await axios.post(`${API_BASE_URL}/auth/google`, {
                            googleId, email, firstName, lastName, picture,
                        });

                        const { access_token } = res.data;
                        if (access_token) {
                            await signInWithToken(access_token);
                        } else {
                            throw new Error('Không nhận được token từ server');
                        }
                    } catch (error) {
                        console.error('Google login error:', error);
                        Alert.alert('Đăng nhập thất bại', 'Không thể đăng nhập với Google');
                    }
                }
            }
        };

        handleGoogleResponse();
    }, [response]);
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        try {
            await signIn({ email, password });
        } catch (error: any) {
            Alert.alert('Đăng nhập thất bại', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng Nhập</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Đăng nhập" onPress={handleLogin} />
            <Button title="Chưa có tài khoản? Đăng ký" onPress={() => navigation.navigate('Register')} />
            <View style={{ marginVertical: 10 }} />
            <Button
                disabled={!request}
                title="Đăng nhập với Google"
                onPress={() => promptAsync()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});