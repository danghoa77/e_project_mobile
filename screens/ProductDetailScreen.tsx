// src/screens/ProductDetailScreen.tsx

import React, { useState, useEffect } from 'react';
// Thêm ScrollView, Image và Dimensions để giao diện đẹp hơn
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigations/MainStackNavigator';
import * as productService from '../services/productService';
import { Product, Variant } from '../types/product'; // Import thêm Variant

type Props = NativeStackScreenProps<MainStackParamList, 'ProductDetail'>;

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen({ route }: Props) {
    const { productId } = route.params;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    // Thêm state để lưu trữ phiên bản sản phẩm đang được chọn
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

    useEffect(() => {
        productService.getProductById(productId)
            .then(response => {
                const fetchedProduct = response.data;
                setProduct(fetchedProduct);
                // Mặc định chọn phiên bản đầu tiên khi tải trang
                if (fetchedProduct && fetchedProduct.variants.length > 0) {
                    setSelectedVariant(fetchedProduct.variants[0]);
                }
            })
            .catch(error => console.error(error))
            .finally(() => setLoading(false));
    }, [productId]);

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (!product) {
        return <Text style={styles.centered}>Không tìm thấy sản phẩm.</Text>;
    }

    // --- SỬA LẠI TOÀN BỘ PHẦN RENDER ---
    return (
        <ScrollView style={styles.container}>
            {/* Hiển thị ảnh sản phẩm */}
            {product.images && product.images.length > 0 && (
                <Image source={{ uri: product.images[0].url }} style={styles.image} />
            )}

            <View style={styles.detailsContainer}>
                {/* Tên sản phẩm */}
                <Text style={styles.name}>{product.name}</Text>

                {/* Giá của phiên bản đang được chọn */}
                {selectedVariant && (
                    <Text style={styles.price}>
                        {selectedVariant.price.toLocaleString('vi-VN')} VNĐ
                    </Text>
                )}

                <Text style={styles.sectionTitle}>Chọn phiên bản:</Text>
                <View style={styles.variantsContainer}>
                    {product.variants.map((variant) => (
                        <TouchableOpacity
                            key={variant._id}
                            style={[
                                styles.variantButton,
                                selectedVariant?._id === variant._id && styles.selectedVariantButton
                            ]}
                            onPress={() => setSelectedVariant(variant)}
                        >
                            <Text style={[
                                styles.variantText,
                                selectedVariant?._id === variant._id && styles.selectedVariantText
                            ]}>
                                {variant.size} - {variant.color}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Hiển thị số lượng tồn kho */}
                {selectedVariant && (
                    <Text style={styles.stock}>Tồn kho: {selectedVariant.stock}</Text>
                )}

                <TouchableOpacity style={styles.addToCartButton}>
                    <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// --- BỔ SUNG STYLES ---
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#fff' },
    image: {
        width: screenWidth,
        height: screenWidth,
    },
    detailsContainer: {
        padding: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    price: {
        fontSize: 22,
        color: 'tomato',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    variantsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    variantButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
        marginBottom: 10,
    },
    selectedVariantButton: {
        borderColor: 'tomato',
        backgroundColor: 'tomato',
    },
    variantText: {
        color: '#333',
    },
    selectedVariantText: {
        color: '#fff',
    },
    stock: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 20,
    },
    addToCartButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});