import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
    const { userInfo, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tài Khoản Của Tôi</Text>
            {userInfo && (
                <>
                    <Text style={styles.text}>Tên: {userInfo.name}</Text>
                    <Text style={styles.text}>Email: {userInfo.email}</Text>
                </>
            )}
            <View style={{ marginTop: 20 }}>
                <Button title="Đăng Xuất" onPress={signOut} color="tomato" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    text: { fontSize: 18, marginBottom: 10 }
});