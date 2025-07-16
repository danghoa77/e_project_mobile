import React, { useState, useEffect, useCallback } from 'react';
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

    // 1. Thêm các state mới cho phân trang
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    // 2. Tách logic fetch data ra một hàm riêng
    const fetchProducts = useCallback((currentPage: number) => {
        // Nếu là trang đầu tiên thì hiển thị loading chính, nếu không thì hiển thị loading ở footer
        currentPage === 1 ? setLoading(true) : setLoadingMore(true);

        productService.getAllProducts({ page: currentPage, limit: 10 })
            .then(response => {
                const newProducts = response.data.products;
                const totalProducts = response.data.total;

                // Nếu là trang 1, thay thế toàn bộ danh sách.
                // Nếu là các trang sau, nối vào danh sách hiện tại.
                setProducts(prevProducts =>
                    currentPage === 1 ? newProducts : [...prevProducts, ...newProducts]
                );
                setTotal(totalProducts);
            })
            .catch(error => console.error("Failed to fetch products:", error))
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    }, []);

    // Tải trang đầu tiên khi component được mở
    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    // 3. Hàm xử lý khi người dùng cuộn đến cuối danh sách
    const handleLoadMore = () => {
        // Chỉ tải thêm nếu danh sách hiện tại chưa đủ và không đang trong quá trình tải
        if (products.length < total && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage);
        }
    };

    // Component hiển thị ở cuối danh sách khi đang tải thêm
    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} />;
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.productItem} onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
                        <Text style={styles.productName}>{item.name}</Text>
                        {item.variants && item.variants.length > 0 && typeof item.variants[0].price === 'number' ? (
                            <Text>{item.variants[0].price.toLocaleString('vi-VN')} VNĐ</Text>
                        ) : (
                            <Text>Liên hệ</Text>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.centered}>
                        <Text>Không có sản phẩm nào.</Text>
                    </View>
                )}
                // 4. Thêm các thuộc tính để kích hoạt phân trang
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    productItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    productName: { fontSize: 18, fontWeight: 'bold' },
});