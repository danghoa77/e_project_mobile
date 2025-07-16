import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView, Image, TouchableOpacity, Modal, TextInput, Alert, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as cartService from '../services/cartService';
import * as orderService from '../services/orderService';
import * as productService from '../services/productService';
import { Cart, CartItem } from '../types/cart';
import Ionicons from 'react-native-vector-icons/Ionicons';
import debounce from 'lodash.debounce';

export default function CartScreen() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();
    const [modalVisible, setModalVisible] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const cartTotal = useMemo(() => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    }, [cart?.items]);

    useFocusEffect(
        useCallback(() => {
            const fetchCartAndDetails = async () => {
                setLoading(true);
                try {
                    const cartResponse = await cartService.getCart();
                    const basicCart = cartResponse.data;

                    if (!basicCart || basicCart.items.length === 0) {
                        setCart(basicCart);
                        return;
                    }

                    const populatedItemsPromises = basicCart.items.map(async (item) => {
                        try {
                            const productResponse = await productService.getProductById(item.productId);
                            const productDetails = productResponse.data;
                            const variantDetails = productDetails.variants.find(v => v._id === item.variantId);

                            if (productDetails && variantDetails) {
                                return {
                                    ...item,
                                    name: productDetails.name,
                                    image: productDetails.images[0]?.url,
                                    size: variantDetails.size,
                                    color: variantDetails.color,
                                    price: variantDetails.price,
                                };
                            }
                        } catch (e) {
                            console.error(`Failed to fetch details for product ${item.productId}`, e);
                        }
                        return { ...item, name: 'Sản phẩm không tồn tại', price: 0 };
                    });

                    const populatedItems = await Promise.all(populatedItemsPromises);
                    setCart({ ...basicCart, items: populatedItems as CartItem[] });

                } catch (error) {
                    console.error("Failed to fetch cart details:", error);
                    setCart(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchCartAndDetails();
        }, [])
    );

    const debouncedUpdate = useMemo(
        () => debounce((productId: string, variantId: string, newQuantity: number) => {
            cartService.updateItemQuantity(productId, variantId, newQuantity)
                .catch(err => {
                    console.error("Failed to update quantity on server:", err.response?.data);
                    Alert.alert("Lỗi", "Không thể cập nhật giỏ hàng.");
                });
        }, 500),
        []
    );

    const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveItem(item.productId, item.variantId);
            return;
        }

        setCart(prevCart => {
            if (!prevCart) return null;
            const updatedItems = prevCart.items.map(i =>
                i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i
            );
            return { ...prevCart, items: updatedItems };
        });

        debouncedUpdate(item.productId, item.variantId, newQuantity);
    };

    const handleRemoveItem = (productId: string, variantId: string) => {
        setCart(prevCart => {
            if (!prevCart) return null;
            const updatedItems = prevCart.items.filter(i => i.variantId !== variantId);
            return { ...prevCart, items: updatedItems };
        });

        cartService.removeItemFromCart(productId, variantId).catch(err => {
            console.error("Failed to remove item", err);
        });
    };

    const handlePlaceOrder = () => {
        if (!street || !city) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ địa chỉ giao hàng.");
            return;
        }
        if (!cart || cart.items.length === 0) {
            Alert.alert("Lỗi", "Giỏ hàng của bạn đang trống.");
            return;
        }

        setIsPlacingOrder(true);
        orderService.createOrder({
            items: cart.items,
            shippingAddress: { street, city }
        })
            .then(() => {
                Alert.alert("Thành công", "Đơn hàng của bạn đã được đặt thành công!");
                setCart(null);
                setModalVisible(false);
                navigation.navigate('Profile', { screen: 'OrderScreen' });
            })
            .catch(error => {
                console.error("Failed to create order:", error.response?.data);
                Alert.alert("Lỗi", "Đặt hàng thất bại, vui lòng thử lại.");
            })
            .finally(() => {
                setIsPlacingOrder(false);
            });
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemVariant}>{item.size} - {item.color}</Text>
                {typeof item.price === 'number' && (
                    <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} VNĐ</Text>
                )}
            </View>
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => handleUpdateQuantity(item, item.quantity - 1)}>
                    <Ionicons name="remove-circle-outline" size={28} color="gray" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => handleUpdateQuantity(item, item.quantity + 1)}>
                    <Ionicons name="add-circle-outline" size={28} color="tomato" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Địa chỉ giao hàng</Text>
                        <TextInput style={styles.input} placeholder="Số nhà, tên đường" value={street} onChangeText={setStreet} />
                        <TextInput style={styles.input} placeholder="Thành phố / Tỉnh" value={city} onChangeText={setCity} />
                        <TouchableOpacity style={styles.confirmButton} onPress={handlePlaceOrder} disabled={isPlacingOrder}>
                            <Text style={styles.checkoutButtonText}>{isPlacingOrder ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <FlatList
                data={cart?.items || []}
                keyExtractor={(item) => item.variantId}
                renderItem={renderCartItem}
                // ListHeaderComponent={<Text style={styles.header}>Giỏ hàng của bạn</Text>}
                ListEmptyComponent={() => (
                    <View style={styles.centeredEmpty}>
                        <Text>Giỏ hàng của bạn đang trống.</Text>
                    </View>
                )}
                contentContainerStyle={{ flexGrow: 1 }}
            />

            {cart && cart.items.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Tổng cộng:</Text>
                        <Text style={styles.totalAmount}>{cartTotal.toLocaleString('vi-VN')} VNĐ</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.checkoutButtonText}>Tiến hành đặt hàng</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8', paddingTop: StatusBar.currentHeight },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centeredEmpty: { paddingTop: '50%', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', padding: 20, textAlign: 'center' },
    itemContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginHorizontal: 10, marginBottom: 10, borderRadius: 8, elevation: 2, alignItems: 'center' },
    itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
    itemDetails: { flex: 1, justifyContent: 'center' },
    itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    itemVariant: { color: 'gray', marginBottom: 5 },
    itemPrice: { fontSize: 16, color: 'tomato' },
    quantityContainer: { flexDirection: 'row', alignItems: 'center' },
    quantityText: { fontSize: 18, marginHorizontal: 15, fontWeight: 'bold' },
    footer: { borderTopWidth: 1, borderColor: '#e0e0e0', padding: 20, backgroundColor: '#fff', paddingBottom: 30 },
    totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    totalText: { fontSize: 18, color: 'gray' },
    totalAmount: { fontSize: 20, fontWeight: 'bold' },
    checkoutButton: { backgroundColor: 'tomato', padding: 15, borderRadius: 8, alignItems: 'center' },
    checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { height: 45, borderColor: '#ccc', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, width: '100%', borderRadius: 5 },
    confirmButton: { backgroundColor: 'tomato', paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
    cancelButton: { marginTop: 15 },
});