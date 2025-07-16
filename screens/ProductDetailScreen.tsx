// src/screens/ProductDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigations/MainStackNavigator';
import * as productService from '../services/productService';
import { Product, Variant } from '../types/product';
import * as cartService from '../services/cartService';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons

type Props = NativeStackScreenProps<MainStackParamList, 'ProductDetail'>;

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: Props) {
    const { productId } = route.params;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    // 1. State mới để quản lý số lượng
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        productService.getProductById(productId)
            .then(response => {
                const fetchedProduct = response.data;
                setProduct(fetchedProduct);
                if (fetchedProduct && fetchedProduct.variants.length > 0) {
                    setSelectedVariant(fetchedProduct.variants[0]);
                    setQuantity(1); // Luôn reset số lượng về 1 khi tải sản phẩm mới
                }
            })
            .catch(error => console.error(error))
            .finally(() => setLoading(false));
    }, [productId]);

    // 2. Các hàm để tăng/giảm số lượng
    const increaseQuantity = () => {
        // Chỉ cho phép tăng nếu số lượng hiện tại < số lượng tồn kho
        if (selectedVariant && quantity < selectedVariant.stock) {
            setQuantity(prevQuantity => prevQuantity + 1);
        }
    };

    const decreaseQuantity = () => {
        // Chỉ cho phép giảm nếu số lượng > 1
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    // 3. Hàm chọn variant, reset số lượng về 1
    const handleSelectVariant = (variant: Variant) => {
        setSelectedVariant(variant);
        setQuantity(1);
    };


    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            Alert.alert("Lỗi", "Vui lòng chọn một phiên bản sản phẩm.");
            return;
        }

        // 5. Cập nhật lại hàm thêm vào giỏ hàng để dùng số lượng đã chọn
        cartService.addItemToCart(product._id, selectedVariant._id, quantity)
            .then(() => {
                Alert.alert(
                    "Thành công",
                    `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`
                );
            })
            .catch(error => {
                console.error("Failed to add to cart", error.response?.data || error.message);
                Alert.alert("Lỗi", "Thêm vào giỏ hàng thất bại.");
            });
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (!product) {
        return <Text style={styles.centered}>Không tìm thấy sản phẩm.</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            {product.images && product.images.length > 0 && (
                <Image source={{ uri: product.images[0].url }} style={styles.image} />
            )}

            <View style={styles.detailsContainer}>
                <Text style={styles.name}>{product.name}</Text>

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
                            onPress={() => handleSelectVariant(variant)} // Dùng hàm mới ở đây
                        >
                            <Text style={[styles.variantText, selectedVariant?._id === variant._id && styles.selectedVariantText]}>
                                {variant.size} - {variant.color}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 4. Giao diện cho bộ chọn số lượng */}
                {selectedVariant && selectedVariant.stock > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Số lượng:</Text>
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
                                <Ionicons name="remove" size={20} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{quantity}</Text>
                            <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
                                <Ionicons name="add" size={20} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.stock}>Tồn kho: {selectedVariant.stock}</Text>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.addToCartButton, selectedVariant?.stock === 0 && styles.disabledButton]}
                    onPress={handleAddToCart}
                    disabled={selectedVariant?.stock === 0}
                >
                    <Text style={styles.addToCartText}>
                        {selectedVariant?.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: screenWidth, height: screenWidth },
    detailsContainer: { padding: 20 },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    price: { fontSize: 22, color: 'tomato', fontWeight: 'bold', marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    variantsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    variantButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', marginRight: 10, marginBottom: 10 },
    selectedVariantButton: { borderColor: 'tomato', backgroundColor: 'tomato' },
    variantText: { color: '#333' },
    selectedVariantText: { color: '#fff' },
    quantitySelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    quantityButton: { width: 40, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    quantityValue: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20 },
    stock: { fontSize: 14, color: 'gray', marginLeft: 'auto' },
    addToCartButton: { backgroundColor: '#000', padding: 15, borderRadius: 5, alignItems: 'center' },
    addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#a1a1a1' },
});