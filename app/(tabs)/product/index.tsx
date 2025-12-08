import { Ionicons } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";
import clsx from "clsx";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface ResProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
}

const MOCK_CATEGORIES = [
  { _id: "all", name: "All Categories" },
  { _id: "cat_sweater", name: "Sweaters" },
  { _id: "cat_jacket", name: "Jackets" },
  { _id: "cat_tshirt", name: "T-Shirts" },
  { _id: "cat_coat", name: "Coats" },
  { _id: "cat_polo", name: "Polo Shirts" },
  { _id: "cat_trouser", name: "Trousers" },
];

const SIZES = ["S", "M", "L", "XL"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const useProductStore = () => {
  const [filters, setFilters] = useState<any>({
    sortBy: "newest",
    category: "all",
    priceRange: [0, 2500],
    sizes: [],
  });
  return { filters, setFilters, category: MOCK_CATEGORIES };
};

export default function ProductListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<ResProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { filters, setFilters, category: categories } = useProductStore();

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [tempCategory, setTempCategory] = useState("all");
  const [tempSizes, setTempSizes] = useState<string[]>([]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 2500]);
  const [tempSort, setTempSort] = useState("newest");

  useEffect(() => {
    if (isFilterModalVisible) {
      setTempCategory(filters.category || "all");
      setTempSizes(filters.sizes || []);
      setTempPriceRange(filters.priceRange || [0, 2500]);
      setTempSort(filters.sortBy || "newest");
    }
  }, [isFilterModalVisible, filters]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockResponse = {
          products: Array.from({ length: limit }).map((_, i) => ({
            _id: `prod-${page}-${i}`,
            name: `Hermès Essential ${page}-${i}`,
            price:
              Math.floor(Math.random() * (filters.priceRange?.[1] || 2500)) +
              100,
            imageUrl:
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400&auto=format&fit=crop",
            category: filters.category || "cat_sweater",
          })),
          total: 50,
        };

        setProducts(mockResponse.products);
        setTotal(mockResponse.total);
      } catch (err) {
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, page]);

  const handleApplyFilters = () => {
    setPage(1);
    setFilters({
      ...filters,
      category: tempCategory,
      sizes: tempSizes,
      priceRange: tempPriceRange,
      sortBy: tempSort,
    });
    setFilterModalVisible(false);
  };

  const toggleSize = (size: string) => {
    if (tempSizes.includes(size)) {
      setTempSizes(tempSizes.filter((s) => s !== size));
    } else {
      setTempSizes([...tempSizes, size]);
    }
  };

  const goToDetail = (id: string) => {
    router.push({
      pathname: "/(tabs)/product/[id]",
      params: { id },
    });
  };

  const renderProductItem = ({ item }: { item: ResProduct }) => (
    <TouchableOpacity
      className="w-[48%] mb-12 group"
      onPress={() => goToDetail(item._id)}
      activeOpacity={0.8}
    >
      <View className="w-full bg-neutral-50 mb-4 border border-neutral-100 overflow-hidden relative">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-64"
          resizeMode="cover"
        />
      </View>

      <View className="px-2 items-center">
        <Text
          className="text-[11px] font-bold text-neutral-900 uppercase tracking-[0.15em] mb-2 text-center leading-4"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text className="text-sm font-serif text-neutral-600 font-normal">
          ${item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (loading || products.length === 0) return null;
    const totalPages = Math.ceil(total / limit);
    return (
      <View className="flex-row justify-center items-center py-16 gap-10 border-t border-neutral-100 mt-4 mx-6">
        <TouchableOpacity
          disabled={page === 1}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          className={clsx(
            "p-3 border border-neutral-200",
            page === 1 && "opacity-20 border-neutral-100"
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
            "p-3 border border-neutral-200",
            page >= totalPages && "opacity-20 border-neutral-100"
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
            Collection 2024
          </Text>
          <Text className="text-3xl font-serif text-neutral-900 uppercase tracking-widest text-center">
            {categories
              .find((c: any) => c._id === filters.category)
              ?.name.replace("Cat_", "") || "All Objects"}
          </Text>
        </View>

        <View className="flex-row items-center justify-between border-t border-b border-neutral-200 px-6 py-3">
          <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
            {loading ? "..." : `${total} items`}
          </Text>

          <TouchableOpacity
            className="flex-row items-center gap-2 active:opacity-60"
            onPress={() => setFilterModalVisible(true)}
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
          <Text className="text-neutral-500 mb-6 tracking-wide text-center font-serif">
            {error}
          </Text>
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
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 32,
            paddingBottom: insets.bottom + 40,
          }}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-32">
              <Text className="text-neutral-400 font-light tracking-wide uppercase text-xs">
                No products found within this criteria.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-6 py-6 border-b border-neutral-100">
            <Text className="text-xl font-serif text-black uppercase tracking-widest">
              Refine
            </Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              hitSlop={20}
            >
              <Ionicons name="close-outline" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-6 pt-8"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-12">
              <Text className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6 text-neutral-400">
                Sort By
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setTempSort(opt.value)}
                    className={clsx(
                      "px-5 py-3 border",
                      tempSort === opt.value
                        ? "bg-black border-black"
                        : "bg-transparent border-neutral-200"
                    )}
                  >
                    <Text
                      className={clsx(
                        "text-[10px] uppercase tracking-wider font-bold",
                        tempSort === opt.value ? "text-white" : "text-black"
                      )}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-12">
              <Text className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 text-neutral-400">
                Category
              </Text>
              <View>
                {categories.map((cat: any) => {
                  const isActive = tempCategory === cat._id;
                  return (
                    <TouchableOpacity
                      key={cat._id}
                      onPress={() => setTempCategory(cat._id)}
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
                        <Ionicons
                          name="checkmark-sharp"
                          size={16}
                          color="#000"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mb-12">
              <Text className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-neutral-400">
                Price Range
              </Text>

              <View
                className="px-2"
                style={{ height: 40, justifyContent: "center" }}
              >
                <Slider
                  animateTransitions
                  minimumValue={0}
                  maximumValue={2500}
                  step={50}
                  value={tempPriceRange}
                  onValueChange={(value) =>
                    setTempPriceRange(value as number[])
                  }
                  minimumTrackTintColor="#000000"
                  maximumTrackTintColor="#E5E5E5"
                  trackStyle={{
                    height: 2,
                    borderRadius: 0,
                  }}
                  thumbStyle={{
                    backgroundColor: "#000000",
                    height: 20,
                    width: 20,
                    borderRadius: 0,
                    borderWidth: 0,
                  }}
                  thumbTouchSize={{ width: 40, height: 40 }}
                />
              </View>

              <View className="flex-row justify-between mt-4">
                <Text className="text-black font-serif text-sm">
                  ${tempPriceRange[0]}
                </Text>
                <Text className="text-black font-serif text-sm">
                  ${tempPriceRange[1]}
                </Text>
              </View>
            </View>

            <View className="mb-12">
              <Text className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6 text-neutral-400">
                Size
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {SIZES.map((size) => {
                  const isChecked = tempSizes.includes(size);
                  return (
                    <TouchableOpacity
                      key={size}
                      className={clsx(
                        "w-12 h-12 items-center justify-center border",
                        isChecked
                          ? "bg-black border-black"
                          : "bg-transparent border-neutral-200"
                      )}
                      onPress={() => toggleSize(size)}
                    >
                      <Text
                        className={clsx(
                          "text-xs",
                          isChecked
                            ? "text-white font-bold"
                            : "text-black font-normal"
                        )}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View className="h-10" />
          </ScrollView>

          <View className="p-6 border-t border-neutral-100 bg-white pb-10 flex-row gap-4">
            <TouchableOpacity
              className="flex-1 py-4 items-center justify-center border border-neutral-200"
              onPress={() => {
                setTempCategory("all");
                setTempSizes([]);
                setTempPriceRange([0, 2500]);
                setTempSort("newest");
              }}
            >
              <Text className="text-neutral-900 font-bold text-[10px] uppercase tracking-[0.2em]">
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-[2] bg-black py-4 items-center justify-center border border-black"
              onPress={handleApplyFilters}
            >
              <Text className="text-white font-bold uppercase tracking-[0.2em] text-[10px]">
                Show Results
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
