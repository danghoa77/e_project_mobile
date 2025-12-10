import productApi from "@/api/product";
import { ResProduct } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";
import clsx from "clsx";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SIZES = ["S", "M", "L", "XL"];
const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
];

interface FilterParams {
  sortBy: string;
  category: string;
  priceRange: number[];
  sizes: string[];
}

const INITIAL_FILTERS: FilterParams = {
  sortBy: "-createdAt",
  category: "all",
  priceRange: [0, 2500],
  sizes: [],
};

const ProductItem = memo(
  ({ item, onPress }: { item: ResProduct; onPress: (id: string) => void }) => {
    const imageUrl = item.images?.[0]?.url;
    const price = item.variants?.[0]?.sizes?.[0]?.price || 0;

    return (
      <TouchableOpacity
        className="w-[48%] mb-8 group"
        onPress={() => onPress(item._id)}
        activeOpacity={0.8}
      >
        <View className="w-full bg-neutral-50 mb-3 border border-neutral-100 overflow-hidden relative aspect-[3/4]">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-100">
              <Text className="text-xs text-gray-400">No Image</Text>
            </View>
          )}
        </View>

        <View className="px-1 items-center">
          <Text
            className="text-[11px] font-bold text-neutral-900 uppercase tracking-[0.15em] mb-1 text-center leading-4"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text className="text-sm font-serif text-neutral-600 font-normal">
            ${price.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

const FilterModal = ({
  visible,
  onClose,
  currentFilters,
  onApply,
  categories,
}: {
  visible: boolean;
  onClose: () => void;
  currentFilters: FilterParams;
  onApply: (filters: FilterParams) => void;
  categories: any[];
}) => {
  const [tempFilters, setTempFilters] = useState<FilterParams>(currentFilters);

  useEffect(() => {
    if (visible) setTempFilters(currentFilters);
  }, [visible, currentFilters]);

  const toggleSize = (size: string) => {
    setTempFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleReset = () => setTempFilters(INITIAL_FILTERS);
  const handleApply = () => onApply(tempFilters);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-6 py-5 border-b border-neutral-100">
          <Text className="text-xl font-serif text-black uppercase tracking-widest">
            Filter
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={20}>
            <Ionicons name="close-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <SectionTitle title="Sort By" />
          <View className="flex-row flex-wrap gap-3 mb-8">
            {SORT_OPTIONS.map((opt) => (
              <FilterTag
                key={opt.value}
                label={opt.label}
                isActive={tempFilters.sortBy === opt.value}
                onPress={() =>
                  setTempFilters({ ...tempFilters, sortBy: opt.value })
                }
              />
            ))}
          </View>

          <SectionTitle title="Category" />
          <View className="mb-8">
            {categories.map((cat: any) => {
              const isActive = tempFilters.category === cat._id;
              return (
                <TouchableOpacity
                  key={cat._id}
                  onPress={() =>
                    setTempFilters({ ...tempFilters, category: cat._id })
                  }
                  className="flex-row items-center justify-between py-3 border-b border-neutral-50"
                >
                  <Text
                    className={clsx(
                      "text-sm uppercase tracking-widest",
                      isActive
                        ? "font-bold text-black"
                        : "font-normal text-neutral-500"
                    )}
                  >
                    {cat.name}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-sharp" size={16} color="#000" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionTitle title="Price Range" />
          <View className="px-2 mb-2 justify-center h-10">
            <Slider
              animateTransitions
              minimumValue={0}
              maximumValue={2500}
              step={50}
              value={tempFilters.priceRange}
              onValueChange={(val) =>
                setTempFilters({ ...tempFilters, priceRange: val as number[] })
              }
              minimumTrackTintColor="#000"
              maximumTrackTintColor="#E5E5E5"
              thumbStyle={{ backgroundColor: "#000", height: 20, width: 20 }}
              trackStyle={{ height: 2 }}
            />
          </View>
          <View className="flex-row justify-between mb-8">
            <Text className="font-serif text-sm">
              ${tempFilters.priceRange[0]}
            </Text>
            <Text className="font-serif text-sm">
              ${tempFilters.priceRange[1]}
            </Text>
          </View>

          <SectionTitle title="Size" />
          <View className="flex-row flex-wrap gap-3 mb-10">
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                className={clsx(
                  "w-12 h-12 items-center justify-center border",
                  tempFilters.sizes.includes(size)
                    ? "bg-black border-black"
                    : "bg-transparent border-neutral-200"
                )}
                onPress={() => toggleSize(size)}
              >
                <Text
                  className={clsx(
                    "text-xs",
                    tempFilters.sizes.includes(size)
                      ? "text-white font-bold"
                      : "text-black"
                  )}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="p-6 border-t border-neutral-100 bg-white pb-10 flex-row gap-4">
          <TouchableOpacity
            onPress={handleReset}
            className="flex-1 py-4 items-center justify-center border border-neutral-200"
          >
            <Text className="text-neutral-900 font-bold text-[10px] uppercase tracking-[0.2em]">
              Reset
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApply}
            className="flex-[2] bg-black py-4 items-center justify-center border border-black"
          >
            <Text className="text-white font-bold uppercase tracking-[0.2em] text-[10px]">
              Show Results
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 text-neutral-400">
    {title}
  </Text>
);

const FilterTag = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={clsx(
      "px-4 py-2 border",
      isActive ? "bg-black border-black" : "bg-transparent border-neutral-200"
    )}
  >
    <Text
      className={clsx(
        "text-[10px] uppercase tracking-wider font-bold",
        isActive ? "text-white" : "text-black"
      )}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function ProductListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<ResProduct[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterVisible, setFilterVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterParams>(INITIAL_FILTERS);

  const LIMIT = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cate = await productApi.getAllCategory();
        setCategories(cate);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    if (categories.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const res = await productApi.fetchProducts({
        page,
        limit: LIMIT,
        category: filters.category !== "all" ? filters.category : undefined,
        sortBy: filters.sortBy,
        price: { min: filters.priceRange[0], max: filters.priceRange[1] },
        size: filters.sizes,
      });
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [page, filters, categories.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApplyFilters = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setPage(1);
    setFilterVisible(false);
  };

  const goToDetail = (id: string) => {
    router.push({ pathname: "/(tabs)/product/[id]", params: { id } });
  };

  const currentCategoryName = useMemo(() => {
    const cat = categories.find((c) => c._id === filters.category);
    return cat ? cat.name.replace("Cat_", "") : "All Products";
  }, [categories, filters.category]);

  const totalPages = Math.ceil(total / LIMIT);

  const renderFooter = () => {
    if (loading || products.length === 0) return null;
    return (
      <View className="flex-row justify-center items-center py-10 gap-8 border-t border-neutral-100 mt-4 mx-6">
        <TouchableOpacity
          disabled={page === 1}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          className={clsx(
            "p-3 border",
            page === 1 ? "border-neutral-100 opacity-30" : "border-neutral-200"
          )}
        >
          <Ionicons name="chevron-back" size={16} color="#000" />
        </TouchableOpacity>

        <Text className="text-neutral-900 text-[10px] tracking-[0.25em] font-bold uppercase">
          Page {page} / {totalPages}
        </Text>

        <TouchableOpacity
          disabled={page >= totalPages}
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          className={clsx(
            "p-3 border",
            page >= totalPages
              ? "border-neutral-100 opacity-30"
              : "border-neutral-200"
          )}
        >
          <Ionicons name="chevron-forward" size={16} color="#000" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white z-10" style={{ paddingTop: insets.top }}>
        <View className="py-6 items-center px-4">
          <Text className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">
            Collection 2025
          </Text>
          <Text className="text-3xl font-serif text-neutral-900 uppercase tracking-widest text-center">
            {currentCategoryName}
          </Text>
        </View>

        <View className="flex-row items-center justify-between border-t border-b border-neutral-200 px-6 py-3">
          <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
            {loading ? "Loading..." : `${total} Items`}
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 active:opacity-60"
            onPress={() => setFilterVisible(true)}
          >
            <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-900 underline">
              Filter & Sort
            </Text>
            <Ionicons name="options-outline" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && products.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#000" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-neutral-500 mb-6 font-serif">{error}</Text>
          <TouchableOpacity
            onPress={() => setPage(1)}
            className="border-b border-black pb-1"
          >
            <Text className="text-black text-xs font-bold uppercase tracking-widest">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductItem item={item} onPress={goToDetail} />
          )}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: insets.bottom + 20,
          }}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-32">
              <Text className="text-neutral-400 font-light tracking-wide uppercase text-xs">
                No products found.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        currentFilters={filters}
        onApply={handleApplyFilters}
        categories={categories}
      />
    </View>
  );
}
