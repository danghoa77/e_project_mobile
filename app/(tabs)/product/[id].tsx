import { cartApi } from "@/api/cart";
import productApi from "@/api/product";
import { useAuthStore } from "@/stores/authStore";
import { ResProduct } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const { width } = Dimensions.get("window");

const AccordionItem = ({ title, children, isOpen, onPress }: any) => {
  return (
    <View className="border-b border-neutral-200">
      <TouchableOpacity
        onPress={onPress}
        className="flex-row justify-between items-center py-5 active:bg-neutral-50/50"
      >
        <Text className="text-xs font-sans font-bold text-neutral-900 uppercase tracking-[0.15em]">
          {title}
        </Text>
        <Ionicons
          name={isOpen ? "remove-outline" : "add-outline"}
          size={20}
          color="#171717"
        />
      </TouchableOpacity>
      {isOpen && (
        <View className="pb-6 pt-1">
          <Text className="text-sm font-sans text-neutral-600 leading-6 tracking-wide">
            {children}
          </Text>
        </View>
      )}
    </View>
  );
};

const RecommendCard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ResProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await productApi.topProducts();
        const fullProducts: ResProduct[] = [];

        for (const p of res.products) {
          const detail = await productApi.findOneProduct(p.productId);
          fullProducts.push(detail);
        }

        setProducts(fullProducts);
      } catch (err) {
        console.error("Failed to fetch recommended products", err);
      }
    };

    fetchData();
  }, []);

  if (products.length === 0) return null;

  return (
    <View className="mt-16 mb-10">
      <Text className="text-sm font-sans font-bold text-neutral-900 mb-6 uppercase tracking-[0.2em]">
        You May Also Like
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-ml-1"
      >
        {products.slice(0, 5).map((product) => {
          const displayVariant = product.variants?.[0];
          const firstSize = displayVariant?.sizes?.[0];
          const firstImage = product.images?.[0];

          if (!displayVariant || !firstSize || !firstImage) return null;

          return (
            <TouchableOpacity
              key={product._id}
              className="mr-4 w-36"
              onPress={() => router.push(`/product/${product._id}`)}
            >
              <View className="h-48 bg-white border border-neutral-100 rounded-sm overflow-hidden mb-2">
                <Image
                  source={{ uri: firstImage.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              <Text className="text-xs font-sans font-bold text-neutral-900 uppercase tracking-wide">
                {product.name}
              </Text>

              {/* Price */}
              <View className="flex-row items-center mt-1">
                {firstSize.salePrice ? (
                  <>
                    <Text className="text-xs font-sans text-red-600 mr-2">
                      ${firstSize.salePrice.toFixed(2)}
                    </Text>

                    <Text className="text-xs font-sans text-neutral-500 line-through">
                      ${firstSize.price.toFixed(2)}
                    </Text>
                  </>
                ) : (
                  <Text className="text-xs font-sans text-neutral-800">
                    ${firstSize.price.toFixed(2)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "description"
  );
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);
  const toggleAccordion = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await productApi.findOneProduct(String(id));
        setProduct(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const availableColors = useMemo(
    () => (product ? product.variants.map((v: any) => v.color) : []),
    [product]
  );

  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    const variant = product.variants.find(
      (v: any) => v.color === selectedColor
    );
    return variant ? variant.sizes.map((s: any) => s.size) : [];
  }, [product, selectedColor]);

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors]);

  useEffect(() => {
    setSelectedSize(null);
  }, [selectedColor]);

  const selectedColorVariant = useMemo(() => {
    if (!product || !selectedColor) return undefined;
    return product.variants.find((v: any) => v.color === selectedColor);
  }, [product, selectedColor]);

  const selectedSizeOption = useMemo(() => {
    if (!selectedColorVariant || !selectedSize) return undefined;
    return selectedColorVariant.sizes.find((s: any) => s.size === selectedSize);
  }, [selectedColorVariant, selectedSize]);

  const displayPrice =
    selectedSizeOption?.price ?? product?.variants[0]?.sizes[0]?.price ?? 0;
  const displaySalePrice = selectedSizeOption?.salePrice;
  const isAddToCartDisabled =
    !selectedColorVariant ||
    !selectedSizeOption ||
    selectedSizeOption.stock === 0;

  const handleAddToCart = async () => {
    if (!product || !selectedColorVariant || !selectedSizeOption) return;
    setIsAdding(true);
    try {
      const payload = {
        productId: product._id,
        variantId: selectedColorVariant._id,
        sizeId: selectedSizeOption._id,
        categoryId: product.category._id,
        quantity: 1,
      };
      await cartApi.addItemToCart(payload);
      toast.success("Added to cart!");
    } catch (err) {
      Alert.alert("Error", "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };
  const handleDeleteRating = async (productId: string, ratingId: string) => {
    try {
      await productApi.deleteRating(productId);
      toast.success("Deleted rating!");

      setProduct((prev: any) =>
        prev
          ? {
              ...prev,
              ratings: prev.ratings.filter((r: any) => r._id !== ratingId),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete rating");
    }
  };

  const handleAddRating = async () => {
    if (!newRating || !newComment.trim()) return;

    const payload = {
      userId: user?._id,
      productId: product._id,
      rating: newRating,
      comment: newComment,
    };

    try {
      const res: any = await productApi.createRating(payload);

      const newReview = {
        ...res,
        rating: newRating,
        comment: newComment,
        userId: user?._id,
        userName: "You",
      };

      setProduct((prev: any) => ({
        ...prev,
        ratings: [newReview, ...prev.ratings],
      }));

      setNewRating(0);
      setNewComment("");
      setReviewModalOpen(false);
    } catch (err) {
      Alert.alert("Error", "Failed to add rating");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-paper">
        <ActivityIndicator size="large" color="#FA5800" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <View className="flex-1 bg-paper">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="relative">
          <FlatList
            ref={flatListRef}
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(ev) => {
              const index = Math.round(ev.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={{ width: width, height: width * 1.3 }}>
                <Image
                  source={{ uri: item.url }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            )}
          />

          <View className="absolute bottom-6 w-full flex-row justify-center gap-3">
            {product.images.map((_: any, index: number) => (
              <View
                key={index}
                className={clsx(
                  "h-0.5 transition-all duration-300",
                  index === currentImageIndex
                    ? "w-6 bg-white"
                    : "w-3 bg-white/40"
                )}
              />
            ))}
          </View>
        </View>

        <View className="px-6 pt-8">
          <Text className="text-xs font-sans text-neutral-500 uppercase tracking-[0.2em] mb-2">
            {product.category.name}
          </Text>
          <Text className="text-2xl font-sans text-neutral-900 uppercase tracking-widest leading-8 mb-4">
            {product.name}
          </Text>
          <View className="flex-row items-baseline gap-4 mb-8">
            {displaySalePrice ? (
              <>
                <Text className="text-2xl font-sans font-light text-primary">
                  ${displaySalePrice.toLocaleString()}
                </Text>
                <Text className="text-lg font-sans text-neutral-400 line-through decoration-1">
                  ${displayPrice.toLocaleString()}
                </Text>
              </>
            ) : (
              <Text className="text-2xl font-sans font-light text-neutral-900">
                ${displayPrice.toLocaleString()}
              </Text>
            )}
          </View>

          <View className="h-[1px] bg-neutral-200 mb-8" />

          <View className="mb-8">
            <Text className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-neutral-900 mb-4">
              Color:{" "}
              <Text className="font-light text-neutral-600 ml-1">
                {selectedColor}
              </Text>
            </Text>
            <View className="flex-row gap-4">
              {availableColors.map((color: string) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={clsx(
                    "w-8 h-8 rounded-full items-center justify-center border",
                    selectedColor === color
                      ? "border-neutral-900"
                      : "border-transparent"
                  )}
                >
                  <View
                    style={{ backgroundColor: color.toLowerCase() }}
                    className="w-6 h-6 rounded-full border border-neutral-200 shadow-sm"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-10">
            <Text className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-neutral-900 mb-4">
              Size
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {availableSizes.map((size: string) => {
                const variant = product.variants.find(
                  (v: any) => v.color === selectedColor
                );
                const sizeObj = variant?.sizes.find(
                  (s: any) => s.size === size
                );
                const isAvailable = sizeObj ? sizeObj.stock > 0 : false;
                const isSelected = selectedSize === size;

                return (
                  <TouchableOpacity
                    key={size}
                    disabled={!isAvailable}
                    onPress={() => setSelectedSize(size)}
                    className={clsx(
                      "min-w-[48px] h-12 px-3 border rounded-sm items-center justify-center",
                      isSelected
                        ? "bg-neutral-900 border-neutral-900"
                        : "bg-transparent border-neutral-300",
                      !isAvailable &&
                        "opacity-30 bg-neutral-100 border-neutral-100"
                    )}
                  >
                    <Text
                      className={clsx(
                        "text-sm font-sans uppercase",
                        isSelected
                          ? "text-white font-bold"
                          : "text-neutral-900",
                        !isAvailable && "line-through text-neutral-400"
                      )}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mb-10 border-t border-neutral-200">
            <AccordionItem
              title="Description"
              isOpen={expandedSection === "description"}
              onPress={() => toggleAccordion("description")}
            >
              {product.description}
            </AccordionItem>

            <AccordionItem
              title="Shipping & Returns"
              isOpen={expandedSection === "shipping"}
              onPress={() => toggleAccordion("shipping")}
            >
              Complimentary standard shipping. Returns and exchanges are
              accepted within 30 days.
            </AccordionItem>
          </View>

          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-6">
              <Text className="text-sm font-sans font-bold uppercase tracking-[0.15em] text-neutral-900">
                Reviews ({product.ratings.length})
              </Text>
              <TouchableOpacity onPress={() => setReviewModalOpen(true)}>
                <Text className="text-[10px] font-sans uppercase tracking-widest text-neutral-500 border-b border-neutral-500 pb-0.5">
                  Write a Review
                </Text>
              </TouchableOpacity>
            </View>
            {(isReviewExpanded
              ? product.ratings
              : product.ratings.slice(0, 3)
            ).map((r: any) => (
              <View
                key={r._id}
                className="bg-white p-5 mb-3 border border-neutral-100 rounded-sm"
              >
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs font-bold uppercase tracking-wide text-neutral-800">
                    {r.userName}
                  </Text>

                  <View className="flex-row items-center">
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < r.rating ? "star" : "star-outline"}
                        size={12}
                        color="#FA5800"
                      />
                    ))}

                    {r.userId === user?._id && (
                      <TouchableOpacity
                        onPress={() => handleDeleteRating(product._id, r._id)}
                        className="ml-3"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Text className="text-neutral-600 text-sm font-sans italic leading-5">
                  "{r.comment}"
                </Text>
              </View>
            ))}

            {product.ratings.length > 3 && (
              <View className="items-center mt-2">
                <TouchableOpacity
                  onPress={() => setIsReviewExpanded(!isReviewExpanded)}
                  className="py-2 px-4"
                >
                  <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-300 pb-1">
                    {isReviewExpanded ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <RecommendCard />
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-paper border-t border-neutral-200 px-6 py-4 z-20"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isAddToCartDisabled || isAdding}
          className={clsx(
            "w-full py-4 items-center justify-center rounded-sm shadow-sm",
            isAddToCartDisabled
              ? "bg-neutral-300"
              : "bg-primary active:opacity-90"
          )}
        >
          {isAdding ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-sans font-bold uppercase tracking-[0.2em] text-xs py-1">
              {isAddToCartDisabled
                ? selectedSizeOption?.stock === 0
                  ? "Sold Out"
                  : "Select Size"
                : "Add to Cart"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isReviewModalOpen}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View className="flex-1 bg-paper p-6">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-lg font-sans font-bold uppercase tracking-widest">
              Write Review
            </Text>
            <TouchableOpacity onPress={() => setReviewModalOpen(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                <Ionicons
                  name={star <= newRating ? "star" : "star-outline"}
                  size={32}
                  color={star <= newRating ? "#FA5800" : "#D4D4D4"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="How was the product?"
            multiline
            className="bg-white border border-neutral-200 rounded-sm p-4 h-32 text-neutral-800 font-sans text-base mb-6"
            textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleAddRating}
            disabled={!newRating}
            className={clsx(
              "bg-neutral-900 py-4 items-center rounded-sm",
              !newRating && "opacity-50"
            )}
          >
            <Text className="text-white font-bold uppercase tracking-widest text-xs">
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
