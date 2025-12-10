import { cartApi } from "@/api/cart";
import { withAuth } from "@/components/auth/withAuth";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Cart } from "@/types/cart";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CartPage() {
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const normalizeCart = (data: any): Cart => {
    if (Array.isArray(data)) return { items: data };
    if (data && Array.isArray(data.items)) return { items: data.items };
    if (data && data.success) return { items: [] };
    return { items: [] };
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      console.log("Fetched cart:", res);
      setCart(normalizeCart(res));
    } catch (err) {
      console.error("Error fetching cart:", err);
      Alert.alert("Error", "Could not load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    productId: string,
    variantId: string,
    sizeId: string,
    quantity: number
  ) => {
    if (quantity < 1) {
      removeItem(productId, variantId, sizeId);
      return;
    }

    const prevCart = { ...cart, items: [...cart.items] };
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      ),
    }));

    try {
      await cartApi.updateQuantity(productId, variantId, sizeId, quantity);
    } catch (err) {
      console.error("Error updating quantity:", err);
      setCart(prevCart);
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const removeItem = async (
    productId: string,
    variantId: string,
    sizeId: string
  ) => {
    const prevCart = { ...cart, items: [...cart.items] };
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.variantId !== variantId),
    }));

    try {
      await cartApi.removeItemFromCart(productId, variantId, sizeId);
    } catch (err) {
      console.error("Error removing item:", err);
      setCart(prevCart);
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const handleCheckout = () => {
    router.push("/(tabs)/order");
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  return (
    <View className="flex-1 bg-white">
      <View
        className="bg-white z-20 px-6 border-b border-neutral-100"
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
      >
        <View className="items-center relative">
          <Text className="text-xl font-serif text-neutral-900 uppercase tracking-[0.2em]">
            Shopping Bag
          </Text>
          {loading && (
            <View className="absolute right-0 top-1">
              <ActivityIndicator size="small" color="#000" />
            </View>
          )}
        </View>
      </View>

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#fff", dark: "#000" }}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        {loading && cart.items.length === 0 ? (
          <View className="items-center justify-center mt-32">
            <ActivityIndicator size="large" color="#000" />
            <Text className="text-neutral-400 font-sans mt-6 uppercase tracking-widest text-xs">
              Updating Bag...
            </Text>
          </View>
        ) : cart.items.length > 0 ? (
          <View className="px-6">
            {cart.items.map((item, index) => (
              <View
                key={item.variantId}
                className={`flex-row py-8 ${
                  index !== cart.items.length - 1
                    ? "border-b border-neutral-100"
                    : ""
                }`}
              >
                <View className="w-28 h-36 bg-neutral-50 mr-6 border border-neutral-100">
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1 justify-between">
                  <View>
                    <View className="flex-row justify-between items-start mb-2">
                      <Text
                        className="text-neutral-900 font-bold text-xs uppercase tracking-widest flex-1 mr-4 leading-5"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          removeItem(
                            item.productId,
                            item.variantId,
                            item.sizeId
                          )
                        }
                        hitSlop={20}
                      >
                        <Ionicons name="close" size={18} color="#999" />
                      </TouchableOpacity>
                    </View>

                    <Text className="text-neutral-500 text-[10px] uppercase tracking-wider mb-1">
                      {item.color}
                    </Text>
                    <Text className="text-neutral-500 text-[10px] uppercase tracking-wider">
                      Size: {item.size}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-end">
                    <View className="flex-row items-center border border-neutral-200">
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.sizeId,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 items-center justify-center active:bg-neutral-100"
                      >
                        <Text className="text-neutral-600 font-sans text-sm">
                          -
                        </Text>
                      </TouchableOpacity>

                      <View className="w-8 h-8 items-center justify-center border-x border-neutral-100">
                        <Text className="text-xs font-sans text-neutral-900">
                          {item.quantity}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.sizeId,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 items-center justify-center active:bg-neutral-100"
                      >
                        <Text className="text-neutral-600 font-sans text-sm">
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text className="text-neutral-900 text-sm font-serif">
                      ${(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-24 px-8">
            <Text className="text-xl font-serif text-neutral-900 tracking-widest mb-4 uppercase">
              Your Bag is Empty
            </Text>
            <Text className="text-neutral-500 text-center mb-10 text-xs uppercase tracking-wide leading-6">
              Discover our latest collections.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/product")}
              className="bg-neutral-900 px-8 py-4"
            >
              <Text className="text-white font-bold uppercase tracking-[0.2em] text-[10px]">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ParallaxScrollView>

      {cart.items.length > 0 && (
        <View
          className="bg-white border-t border-neutral-100 px-6 py-6"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="flex-row justify-between items-end mb-8">
            <Text className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              Total
            </Text>
            <Text className="text-2xl text-neutral-900 font-serif">
              ${subtotal.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            className="bg-neutral-900 w-full py-5 items-center justify-center active:opacity-90"
          >
            <Text className="text-white font-bold uppercase tracking-[0.25em] text-xs">
              Proceed to Checkout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default withAuth(CartPage);
