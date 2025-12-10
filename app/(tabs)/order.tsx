import { cartApi } from "@/api/cart";
import { orderApi } from "@/api/order";
import paymentApi from "@/api/payment";
import userApi from "@/api/user";
import { CartItem } from "@/types/cart";
import { ShippingAddress } from "@/types/user";
import { router, useFocusEffect } from "expo-router";
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Smartphone,
  X,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type PaymentMethod = "cash" | "vnpay" | "momo";

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [allAddresses, setAllAddresses] = useState<ShippingAddress[]>([]);
  const [shippingAddress, setShippingAddress] = useState<
    ShippingAddress | undefined
  >(undefined);

  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [tempSelectedIndex, setTempSelectedIndex] = useState<number | null>(
    null
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isOrderExpanded, setIsOrderExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      fetchCheckoutData();
    }, [])
  );

  const fetchCheckoutData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        cartApi.getCart(),
        userApi.getAddresses(),
      ]);

      setCartItems(cartRes || []);
      setAllAddresses(addressRes || []);

      if (addressRes?.length) {
        const defaultAddress =
          addressRes.find((a: ShippingAddress) => a.isDefault) || addressRes[0];
        setShippingAddress(defaultAddress);
      }
    } catch (err) {
      console.error("Error fetching checkout data:", err);
      Alert.alert("Error", "Could not load checkout data.");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const openAddressModal = () => {
    if (shippingAddress && allAddresses.length > 0) {
      const idx = allAddresses.findIndex(
        (addr) => addr._id === shippingAddress._id
      );
      setTempSelectedIndex(idx !== -1 ? idx : null);
    } else {
      setTempSelectedIndex(null);
    }

    setAddressModalVisible(true);
    setError(null);
  };

  const confirmAddressSelection = () => {
    if (tempSelectedIndex !== null && allAddresses[tempSelectedIndex]) {
      setShippingAddress(allAddresses[tempSelectedIndex]);
      setAddressModalVisible(false);
    }
  };
  const handelMomo = async (orderId: string, amount: number) => {
    try {
      const res = await paymentApi.createMomoUrl(orderId, amount);
      if (res) {
        Linking.openURL(res);
      } else {
        toast.error("Could not get MOMO link.");
      }
    } catch (err) {
      toast.error("MOMO payment failed.");
      console.error(err);
    }
  };

  const handelVnpay = async (orderId: string, amount: number) => {
    try {
      const res = await paymentApi.createVnpayUrl(orderId, amount);
      if (res) {
        Linking.openURL(res);
      } else {
        toast.error("Could not get VNPay link.");
      }
    } catch (err) {
      toast.error("VNPay payment failed.");
      console.error(err);
    }
  };
  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      setError("Please select a shipping address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          categoryId: item.categoryId,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
        },
        totalPrice: subtotal,
      };

      if (paymentMethod === "cash") {
        try {
          console.log("Creating order with payload:", orderPayload);
          await orderApi.createOrder(orderPayload);
          const stockPayload = orderPayload.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            sizeId: item.sizeId,
          }));
          console.log("Decreasing stock with payload:", stockPayload);
          await cartApi.decreaseStock(stockPayload);
          await cartApi.deleteCart();
          router.replace("/(tabs)");
          toast.success("Order placed successfully!");
        } catch (err: any) {
          const message = err?.response?.data?.message || "Failed to order.";
          toast.error(message);

          console.error(" API Error caught:", {
            message: err?.message,
            response: err?.response?.data,
            stack: err?.stack,
          });
        }
      }

      if (paymentMethod === "momo") {
        try {
          const stockPayload = orderPayload.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            sizeId: item.sizeId,
            quantity: item.quantity,
          }));
          await cartApi.decreaseStock(stockPayload);
          const order = await orderApi.createOrder(orderPayload);
          if (order && order._id && order.totalPrice != null) {
            await handelMomo(order._id, order.totalPrice);
          } else {
            throw new Error("Order data is incomplete.");
          }
        } catch (err: any) {
          const message = err?.response?.data?.message || "Failed to order.";
          toast.error(message);
          console.error("Order error:", err);
        }
      }
      if (paymentMethod === "vnpay") {
        try {
          const stockPayload = orderPayload.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            sizeId: item.sizeId,
            quantity: item.quantity,
          }));
          await cartApi.decreaseStock(stockPayload);
          const order = await orderApi.createOrder(orderPayload);
          if (order && order._id && order.totalPrice != null) {
            await handelVnpay(order._id, order.totalPrice);
          } else {
            throw new Error("Order data is incomplete.");
          }
        } catch (err: any) {
          const message = err?.response?.data?.message || "Failed to order.";
          toast.error(message);
          console.error("Order error:", err);
        }
      }

      toast.success("Your order has been placed.");
    } catch (e) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentOption = (
    value: PaymentMethod,
    label: string,
    subLabel: string,
    IconComponent: any
  ) => {
    const selected = paymentMethod === value;
    return (
      <TouchableOpacity
        onPress={() => setPaymentMethod(value)}
        className={`flex-row items-center justify-between border px-4 py-4 ${
          selected ? "border-black bg-neutral-50" : "border-neutral-200"
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-5 h-5 rounded-full border border-black items-center justify-center">
            {selected && <View className="w-3 h-3 rounded-full bg-black" />}
          </View>
          <View>
            <Text className="text-[13px] font-bold text-black">{label}</Text>
            <Text className="text-[11px] text-neutral-500 mt-0.5">
              {subLabel}
            </Text>
          </View>
        </View>
        <IconComponent size={24} color="#000" strokeWidth={1.5} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View
        className="bg-white z-20 px-6 border-b border-neutral-100"
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
      >
        <View className="items-center relative">
          <Text className="text-xl font-serif text-neutral-900 uppercase tracking-[0.2em]">
            Checkout
          </Text>
          {loading && (
            <View className="absolute right-0 top-1">
              <ActivityIndicator size="small" color="#000" />
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View className="flex-row items-center border border-red-300 bg-red-50 p-3 mb-5">
            <AlertCircle size={20} color="#DC2626" />
            <Text className="ml-2 text-red-600 font-medium">{error}</Text>
          </View>
        )}

        <View className="border-b border-neutral-200 pb-6 mb-6">
          <Text className="text-[14px] font-bold tracking-widest mb-4">
            SHIPPING ADDRESS
          </Text>

          <TouchableOpacity
            onPress={openAddressModal}
            className={`flex-row justify-between items-center border p-4 ${
              error
                ? "border-red-600 bg-red-50"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-9 h-9 rounded-full border border-black items-center justify-center bg-white">
                <MapPin size={20} color="#000" />
              </View>

              <View className="flex-1 pr-2">
                {shippingAddress ? (
                  <>
                    <Text
                      className="font-semibold text-black"
                      numberOfLines={1}
                    >
                      {shippingAddress.street}
                    </Text>
                    <Text className="text-xs text-neutral-500 uppercase mt-0.5">
                      {shippingAddress.city}
                    </Text>
                  </>
                ) : (
                  <Text className="italic text-neutral-400">
                    Tap to select address
                  </Text>
                )}
              </View>
            </View>

            <Text className="text-[11px] font-bold underline uppercase">
              {shippingAddress ? "CHANGE" : "SELECT"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="border-b border-neutral-200 pb-6 mb-6">
          <TouchableOpacity
            onPress={() => setIsOrderExpanded(!isOrderExpanded)}
            className="flex-row justify-between items-center mb-4"
          >
            <Text className="text-[14px] font-bold tracking-widest">
              ORDER SUMMARY ({cartItems.length})
            </Text>
            {isOrderExpanded ? (
              <ChevronUp size={20} color="#000" />
            ) : (
              <ChevronDown size={20} color="#000" />
            )}
          </TouchableOpacity>
          {isOrderExpanded &&
            cartItems.map((item) => (
              <View key={item.variantId} className="flex-row gap-4 mb-5">
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-[90px] h-[110px] bg-neutral-100"
                />
                <View className="flex-1 justify-between py-1">
                  <View>
                    <Text
                      numberOfLines={1}
                      className="text-base font-semibold text-black"
                    >
                      {item.name}
                    </Text>
                    <Text className="text-xs text-neutral-500 uppercase mt-1">
                      {item.color} / {item.size}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-500">
                      Qty: {item.quantity}
                    </Text>
                    <Text className="font-semibold text-black">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
        </View>

        <View className="pb-6">
          <Text className="text-[14px] font-bold tracking-widest mb-4">
            PAYMENT METHOD
          </Text>
          <View className="gap-3">
            {renderPaymentOption(
              "cash",
              "CASH ON DELIVERY",
              "Pay when you receive",
              Banknote
            )}
            {renderPaymentOption(
              "vnpay",
              "VNPAY QR",
              "ATM Card / QR Code",
              CreditCard
            )}
            {renderPaymentOption(
              "momo",
              "MOMO WALLET",
              "Pay via MoMo app",
              Smartphone
            )}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-white px-5 pt-2 z-10"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
      >
        <View className="flex-row justify-between mb-4">
          <Text className="text-xs tracking-widest text-neutral-500">
            TOTAL AMOUNT
          </Text>
          <Text className="text-2xl font-bold text-black font-serif">
            ${subtotal.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading || cartItems.length === 0}
          className={`py-4 items-center ${
            loading || cartItems.length === 0 ? "bg-neutral-500" : "bg-black"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-bold tracking-[0.2em]">
              PLACE ORDER
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={isAddressModalVisible}
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white rounded-t-2xl p-6 h-[60%]">
            <View className="flex-row justify-between items-center border-b border-neutral-100 pb-4 mb-4">
              <Text className="font-bold tracking-widest text-base">
                SELECT ADDRESS
              </Text>
              <TouchableOpacity
                onPress={() => setAddressModalVisible(false)}
                className="p-1"
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4 pb-20">
                {allAddresses.map((addr, index) => {
                  const isSelected = tempSelectedIndex === index;

                  return (
                    <TouchableOpacity
                      key={addr._id}
                      onPress={() => setTempSelectedIndex(index)}
                      activeOpacity={0.7}
                      className={`border p-4 ${
                        isSelected
                          ? "border-black bg-neutral-50"
                          : "border-neutral-200"
                      }`}
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-4">
                          <View className="flex-row items-center mb-1 gap-2">
                            <Text className="font-bold text-black uppercase tracking-wide text-xs">
                              {addr.city}
                            </Text>
                            {addr.isDefault && (
                              <View className="bg-neutral-200 px-2 py-0.5 rounded-sm">
                                <Text className="text-[10px] font-bold text-neutral-600">
                                  DEFAULT
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-neutral-600 text-sm mt-1">
                            {addr.street}
                          </Text>
                        </View>

                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-black bg-black"
                              : "border-neutral-300"
                          }`}
                        >
                          {isSelected && (
                            <Check size={12} color="#FFF" strokeWidth={3} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View className="pt-4 border-t border-neutral-100">
              <TouchableOpacity
                onPress={confirmAddressSelection}
                disabled={tempSelectedIndex === null}
                className={`py-4 items-center justify-center ${
                  tempSelectedIndex === null ? "bg-neutral-300" : "bg-black"
                }`}
              >
                <Text className="text-white font-bold tracking-widest text-xs">
                  CONFIRM SELECTION
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
