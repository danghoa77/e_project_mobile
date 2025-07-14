// src/screens/ProductListScreen.tsx

import React, { useState, useEffect } from 'react';
// Thêm SafeAreaView để giao diện không bị đè lên tai thỏ hoặc các thanh hệ thống
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import * as productService from '../services/productService';
import { Product } from '../types/product';

import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList } from '../navigations/BottomTabNavigator';
import { MainStackParamList } from '../navigations/MainStackNavigator';

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Home'>,
    NativeStackScreenProps<MainStackParamList>
>;

export default function ProductListScreen({ navigation }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productService.getAllProducts()
            .then(response => setProducts(response.data.products))
            .catch(error => console.error("Failed to fetch products:", error))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    // --- SỬA LẠI PHẦN RETURN ---
    return (
        // Bọc toàn bộ bằng SafeAreaView và View có style flex: 1
        <SafeAreaView style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.productItem} onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
                        <Text style={styles.productName}>{item.name}</Text>

                        {item.variants && item.variants.length > 0 ? (
                            <Text>{item.variants[0].price.toLocaleString('vi-VN')} VNĐ</Text>
                        ) : (
                            <Text>Liên hệ</Text>
                        )}
                    </TouchableOpacity>
                )}
                // Thêm component để xử lý khi không có dữ liệu
                ListEmptyComponent={() => (
                    <View style={styles.centered}>
                        <Text>Không có sản phẩm nào.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

// --- SỬA LẠI PHẦN STYLES ---
const styles = StyleSheet.create({
    // Style cho container chính
    container: {
        flex: 1,
        backgroundColor: '#fff', // Thêm màu nền để chắc chắn
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50, // Thêm khoảng cách để thông báo không bị dính sát lề
    },
    productItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold'
    },
});