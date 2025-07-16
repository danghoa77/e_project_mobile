import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as orderService from '../services/orderService';
import { Order } from '../types/order';
import { format } from 'date-fns';

export default function OrderScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            orderService.getMyOrders()
                .then(response => {
                    setOrders(response.data);
                })
                .catch(error => {
                    console.error("Failed to fetch orders:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, [])
    );

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Đơn hàng #{item._id.substring(18).toUpperCase()}</Text>
                <Text style={styles.orderDate}>
                    {format(new Date(item.createdAt), 'dd/MM/yyyy')}
                </Text>
            </View>
            <View style={styles.cardBody}>
                <Text>Địa chỉ: {`${item.shippingAddress.street}, ${item.shippingAddress.city}`}</Text>
                <Text style={{ textTransform: 'capitalize' }}>
                    Trạng thái: <Text style={styles.statusText}>{item.status}</Text>
                </Text>
            </View>
            {typeof item.totalPrice === 'number' && (
                <View style={styles.cardFooter}>
                    <Text style={styles.totalAmount}>
                        Tổng tiền: {item.totalPrice.toLocaleString('vi-VN')} VNĐ
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderItem}
                ListHeaderComponent={<Text style={styles.header}>Lịch sử đơn hàng</Text>}
                ListEmptyComponent={() => (
                    <View style={styles.centered}>
                        <Text>Bạn chưa có đơn hàng nào.</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 22, fontWeight: 'bold', paddingBottom: 20, textAlign: 'center' },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
    orderId: { fontWeight: 'bold', fontSize: 16 },
    orderDate: { color: 'gray' },
    cardBody: { marginBottom: 10, gap: 5 },
    statusText: { fontWeight: 'bold' },
    cardFooter: { alignItems: 'flex-end', marginTop: 5 },
    totalAmount: { fontSize: 16, fontWeight: 'bold', color: 'tomato' },
});