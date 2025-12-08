import { orderApi } from "@/api/order";
import { withAuth } from "@/components/auth/withAuth";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const { width } = Dimensions.get("window");

interface CartItem {
  productId: string;
  variantId: string;
  sizeId: string;
  categoryId: string;
  quantity: number;
  name: string;
  price: number;
  size: string;
  color: string;
  imageUrl: string;
}

interface ShippingAddress {
  _id: string;
  street: string;
  city: string;
  isDefault?: boolean;
}

const AddressSelectionModal = ({
  visible,
  onClose,
  addresses,
  selectedId,
  onSelect,
}: any) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <View className="flex-1 bg-[#FCF7F1] p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-sans font-bold uppercase tracking-widest">
            Select Address
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {addresses.map((addr: ShippingAddress) => {
            const isSelected = selectedId === addr._id;
            return (
              <TouchableOpacity
                key={addr._id}
                onPress={() => {
                  onSelect(addr);
                  onClose();
                }}
                className={clsx(
                  "p-4 mb-3 border rounded-sm bg-white",
                  isSelected ? "border-[#FA5800]" : "border-neutral-200"
                )}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-bold text-neutral-900 mb-1">
                      {addr.street}
                    </Text>
                    <Text className="text-neutral-500 text-sm">
                      {addr.city}
                    </Text>
                    {addr.isDefault && (
                      <Text className="text-[10px] text-[#FA5800] mt-1 font-bold uppercase">
                        Default
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FA5800"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          {addresses.length === 0 && (
            <Text className="text-center text-neutral-500 mt-10">
              No addresses found.
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

function OrderPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [allAddresses, setAllAddresses] = useState<ShippingAddress[]>([]);
  const [shippingAddress, setShippingAddress] = useState<
    ShippingAddress | undefined
  >(undefined);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "vnpay">(
    "cash"
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [cartRes, addressRes] = await Promise.all([
          orderApi.getCart(),
          orderApi.getAddresses(),
        ]);

        let items: CartItem[] = [];
        if (Array.isArray(cartRes)) {
          items = cartRes;
        } else if (cartRes?.items && Array.isArray(cartRes.items)) {
          items = cartRes.items;
        }

        if (items.length > 0) {
          setCartItems(items);
        } else {
          toast.error("Your cart is empty.");
          router.replace("/");
          return;
        }

        setAllAddresses(addressRes);
        const defaultAddress =
          addressRes.find((addr: ShippingAddress) => addr.isDefault) ||
          addressRes[0];
        setShippingAddress(defaultAddress);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Could not load page data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const handleMomo = async (orderId: string, amount: number) => {
    try {
      const res = await orderApi.createMomoUrl(orderId, amount);
      if (res) {
        const supported = await Linking.canOpenURL(res);
        if (supported) {
          await Linking.openURL(res);
        } else {
          toast.error("Cannot open payment app.");
        }
      } else {
        toast.error("Could not get MOMO link.");
      }
    } catch (err) {
      toast.error("MOMO payment failed.");
      console.error(err);
    }
  };

  const handleVnpay = async (orderId: string, amount: number) => {
    try {
      const res = await orderApi.createVnpayUrl(orderId, amount);
      if (res) {
        const supported = await Linking.canOpenURL(res);
        if (supported) {
          await Linking.openURL(res);
        } else {
          toast.error("Cannot open payment app.");
        }
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
      toast.error("Please add a shipping address to proceed.");
      setIsAddressModalOpen(true);
      return;
    }

    setIsSubmitting(true);

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

    const stockPayload = orderPayload.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      sizeId: item.sizeId,
      quantity: item.quantity,
    }));

    try {
      if (paymentMethod === "cash") {
        await orderApi.createOrder(orderPayload);
        await orderApi.decreaseStock(stockPayload);
        await orderApi.deleteCart();

        toast.success("Order placed successfully!");
        router.replace("/");
      } else if (paymentMethod === "momo" || paymentMethod === "vnpay") {
        await orderApi.decreaseStock(stockPayload);
        const order = await orderApi.createOrder(orderPayload);

        if (order && order._id && order.totalPrice != null) {
          if (paymentMethod === "momo") {
            await handleMomo(order._id, order.totalPrice);
          } else {
            await handleVnpay(order._id, order.totalPrice);
          }
        } else {
          throw new Error("Order data is incomplete.");
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to order.";
      console.error("Order Error:", err);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FCF7F1]">
        <ActivityIndicator size="large" color="#FA5800" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FCF7F1]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="px-5 pb-4 border-b border-neutral-200 bg-[#FCF7F1] z-10"
          style={{ paddingTop: insets.top + 10 }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#171717" />
            </TouchableOpacity>
            <Text className="text-lg font-sans font-bold uppercase tracking-widest text-neutral-900">
              Checkout
            </Text>
          </View>
        </View>

        <View className="p-5">
          <View className="mb-6">
            <Text className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">
              Your Items ({cartItems.length})
            </Text>
            <View className="bg-white rounded-sm border border-neutral-200 overflow-hidden">
              {cartItems.map((item, index) => (
                <View
                  key={`${item.variantId}-${index}`}
                  className={clsx(
                    "flex-row p-4 gap-4",
                    index !== cartItems.length - 1 &&
                      "border-b border-neutral-100"
                  )}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-20 h-24 bg-neutral-100 rounded-sm"
                    resizeMode="cover"
                  />
                  <View className="flex-1 justify-between py-1">
                    <View>
                      <Text
                        className="font-sans font-bold text-neutral-900 text-sm uppercase tracking-wide mb-1"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-neutral-500 text-xs font-sans">
                        {item.color} / {item.size}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-end">
                      <Text className="text-neutral-500 text-xs font-sans">
                        Qty: {item.quantity}
                      </Text>
                      <Text className="font-sans font-medium text-neutral-900">
                        ${(item.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">
              Shipping Address
            </Text>
            <View className="bg-white rounded-sm border border-neutral-200 p-4">
              {shippingAddress ? (
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 mr-4">
                    <Text className="font-sans font-bold text-neutral-900 mb-1">
                      {shippingAddress.street}
                    </Text>
                    <Text className="font-sans text-neutral-500 text-sm">
                      {shippingAddress.city}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsAddressModalOpen(true)}
                    className="p-2 bg-neutral-50 rounded-full"
                  >
                    <Ionicons name="pencil" size={16} color="#FA5800" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsAddressModalOpen(true)}
                  className="flex-row items-center justify-center py-4 border border-dashed border-neutral-300 rounded-sm"
                >
                  <Ionicons name="add" size={20} color="#FA5800" />
                  <Text className="ml-2 font-sans font-medium text-neutral-600">
                    Add Address
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">
              Payment Method
            </Text>
            <View className="space-y-3">
              {[
                { id: "cash", label: "Cash on Delivery" },
                { id: "momo", label: "MoMo Wallet" },
                { id: "vnpay", label: "VNPay" },
              ].map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setPaymentMethod(method.id as any)}
                    className={clsx(
                      "flex-row items-center p-4 bg-white border rounded-sm",
                      isSelected ? "border-[#000]" : "border-neutral-200"
                    )}
                  >
                    <View
                      className={clsx(
                        "w-5 h-5 rounded-full border items-center justify-center mr-3",
                        isSelected ? "border-[#000]" : "border-neutral-300"
                      )}
                    >
                      {isSelected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-[#000]" />
                      )}
                    </View>
                    <Text
                      className={clsx(
                        "font-sans font-medium",
                        isSelected ? "text-neutral-900" : "text-neutral-600"
                      )}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="bg-white p-4 rounded-sm border border-neutral-200">
            <View className="h-[1px] bg-neutral-100 mb-4" />
            <View className="flex-row justify-between">
              <Text className="font-sans font-bold text-neutral-900 uppercase tracking-wide">
                Total
              </Text>
              <Text className="font-sans font-bold text-[#000] text-xl">
                ${subtotal.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-[#FCF7F1] border-t border-neutral-200 px-5 py-4 z-20"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          className={clsx(
            "w-full py-4 items-center justify-center rounded-sm shadow-sm flex-row",
            isSubmitting ? "bg-neutral-400" : "bg-[#000]"
          )}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-sans font-bold uppercase tracking-[0.2em] text-xs mr-2">
                Confirm Order
              </Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={allAddresses}
        selectedId={shippingAddress?._id}
        onSelect={setShippingAddress}
      />
    </View>
  );
}

export default withAuth(OrderPage);
