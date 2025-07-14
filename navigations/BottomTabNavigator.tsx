// BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductListScreen from '../screens/ProductListScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabParamList = {
    Home: undefined;
    Cart: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const iconName = route.name === 'Home'
                        ? (focused ? 'home' : 'home-outline')
                        : route.name === 'Cart'
                            ? (focused ? 'cart' : 'cart-outline')
                            : (focused ? 'person' : 'person-outline');
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Home" component={ProductListScreen} options={{ title: 'Trang chủ' }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
        </Tab.Navigator>
    );
}
