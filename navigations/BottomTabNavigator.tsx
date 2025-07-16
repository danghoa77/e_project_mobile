import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductListScreen from '../screens/ProductListScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatListScreen';
import OrderScreen from '../screens/OrderScreen';

export type TabParamList = {
    Home: undefined;
    Cart: undefined;
    Profile: undefined;
    Chat: undefined;
    Order: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    }
                    else if (route.name === 'Cart') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    }
                    else if (route.name === 'Order') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    }
                    else {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Home" component={ProductListScreen} options={{ title: 'Trang chủ' }} />
            <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'Trò chuyện' }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
            <Tab.Screen name="Order" component={OrderScreen} options={{ title: 'Đơn hàng' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
        </Tab.Navigator>
    );
}
