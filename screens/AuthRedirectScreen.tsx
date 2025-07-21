// src/screens/AuthRedirectScreen.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthRedirectScreen({ route, navigation }: any) {
    const { signInWithToken } = useAuth();

    useEffect(() => {
        const handleAuthRedirect = async () => {
            const { params } = route;

            if (params?.token) {
                try {
                    await signInWithToken(params.token);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }] // hoặc ProductList nếu đó là màn đầu
                    });
                } catch (error) {
                    console.error("Redirect sign-in failed", error);
                    navigation.navigate('Login');
                }
            } else {
                navigation.navigate('Login');
            }
        };

        handleAuthRedirect();
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
