import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CartScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giỏ Hàng</Text>
            <Text>Chức năng giỏ hàng sẽ được phát triển ở đây.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold' }
});