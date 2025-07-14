// src/screens/RegisterScreen.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';
// Import useAuth để lấy context
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigations/AuthStackNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    // Lấy hàm registerAndSignIn từ context
    const { registerAndSignIn } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password || !phone) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ tất cả các trường.");
            return;
        }

        try {
            // Gọi hàm từ context
            await registerAndSignIn({
                name,
                email,
                password,
                phone,
                role: 'customer'
            });
            // Khi thành công, app sẽ tự động chuyển màn hình
            // Không cần Alert hay navigation.navigate ở đây nữa
        } catch (error: any) {
            // Hiển thị lỗi chi tiết hơn từ server nếu có
            const errorMessage = (error as any)?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            Alert.alert("Lỗi", Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng Ký</Text>
            <TextInput style={styles.input} placeholder="Họ và tên" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Đăng ký" onPress={handleRegister} />
            <Button title="Đã có tài khoản? Đăng nhập" onPress={() => navigation.goBack()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});