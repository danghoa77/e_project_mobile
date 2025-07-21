// src/navigations/MainStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import BottomTabNavigator, { TabParamList } from './BottomTabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';

export type MainStackParamList = {
    MainTabs: NavigatorScreenParams<TabParamList>;
    ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
        </Stack.Navigator>
    );
};