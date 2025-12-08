import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const FEATURED_PRODUCTS = [
  {
    id: "fp1",
    name: "Heure H Watch",
    sub: "21 mm, Steel",
    price: "$3,375",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "fp2",
    name: "Oran Sandal",
    sub: "Box Calfskin",
    price: "$760",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "fp3",
    name: "Chaine d'Ancre",
    sub: "Silver Bracelet",
    price: "$1,450",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "fp4",
    name: "Avalon Throw",
    sub: "Merino Wool",
    price: "$1,800",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=500&auto=format&fit=crop",
  },
];

const COLLECTIONS = [
  {
    id: 1,
    title: "Women",
    image:
      "https://images.unsplash.com/photo-1616165507963-7eb92723c3b0?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Men",
    image:
      "https://images.unsplash.com/photo-1617137968427-b2879f439691?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Jewelry",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Fragrance",
    image:
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=600&auto=format&fit=crop",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleShopNow = () => {
    router.push("/(tabs)/product");
  };

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="mr-6 w-40 group" activeOpacity={0.9}>
      <View className="w-40 h-52 bg-neutral-50 mb-4 overflow-hidden border border-neutral-100">
        <Image
          source={{ uri: item.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View>
        <Text
          numberOfLines={1}
          className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-1"
        >
          {item.name}
        </Text>
        <Text className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">
          {item.sub}
        </Text>
        <Text className="text-xs font-serif text-neutral-900">
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerImage={
        <Video
          source={{
            uri: "https://res.cloudinary.com/dzskttedu/video/upload/v1753603101/Astonishing_orange_-_Herm%C3%A8s_tglwbm.mp4",
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />
      }
      headerBackgroundColor={{
        light: "#ffffff",
        dark: "#000000",
      }}
    >
      <View className="bg-white py-14 px-6 items-center">
        <Text className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 mb-6 uppercase">
          Winter 2025
        </Text>
        <Text className="text-3xl md:text-4xl font-serif font-light text-center text-neutral-900 uppercase tracking-widest leading-relaxed mb-6">
          The Art of{"\n"}Motion
        </Text>
        <Text className="text-sm text-neutral-600 text-center leading-7 max-w-xs font-light tracking-wide">
          Snow inspires and invites us to draw. A blank canvas for the boldest
          of movements.
        </Text>
      </View>

      <View className="bg-white pb-16 pl-6">
        <View className="flex-row justify-between items-end pr-6 mb-8">
          <Text className="text-lg font-serif text-neutral-900 uppercase tracking-widest">
            Exceptional{"\n"}Objects
          </Text>
          <TouchableOpacity onPress={handleShopNow}>
            <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] underline">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={FEATURED_PRODUCTS}
          horizontal
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        />
      </View>

      <View className="w-full h-[300px] relative ">
        <Image
          source={{
            uri: "https://res.cloudinary.com/dzskttedu/image/upload/v1753603320/imgi_138_P_169_SUMMERMOOD_U_M_wniouk.webp",
          }}
          className="w-full h-full object-cover"
        />
        <View className="absolute inset-0 bg-black/10 justify-end items-center pb-16 px-6">
          <Text className="text-white text-2xl font-serif font-normal uppercase tracking-widest mb-2 text-center shadow-sm">
            Ready To Wear
          </Text>
          <Text className="text-white/90 text-xs font-medium uppercase tracking-[0.2em] mb-8 text-center shadow-sm">
            Autumn-Winter Collection
          </Text>

          <TouchableOpacity
            onPress={handleShopNow}
            activeOpacity={0.8}
            className="bg-white px-10 py-4 shadow-lg active:bg-neutral-100"
          >
            <Text className="text-neutral-900 text-xs font-bold uppercase tracking-[0.2em]">
              Shop Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mx-6 border-t border-neutral-100" />

      <View className="bg-white pt-16 pb-10 px-4">
        <Text className="text-lg font-serif text-neutral-900 uppercase tracking-widest mb-8 px-2 text-center">
          The Universe
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {COLLECTIONS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="w-[48%] mb-10 group"
              activeOpacity={0.8}
              onPress={handleShopNow}
            >
              <View className="w-full h-64 bg-neutral-100 mb-4 overflow-hidden border border-transparent">
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-full object-cover"
                />
              </View>
              <Text className="text-xs font-bold text-neutral-900 uppercase tracking-[0.2em] text-center">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="bg-neutral-900 py-16 px-6">
        <Text className="text-[10px] text-white/60 uppercase tracking-[0.3em] mb-4 text-center">
          Savoir-Faire
        </Text>
        <Text className="text-2xl font-serif text-white uppercase tracking-widest text-center mb-8 leading-9">
          Gestures of{"\n"}The Hand
        </Text>

        <View className="w-full h-64 bg-neutral-800 mb-6 overflow-hidden">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1621335829175-95f437384d7c?q=80&w=800&auto=format&fit=crop",
            }}
            className="w-full h-full object-cover opacity-80"
          />
        </View>

        <Text className="text-neutral-400 text-sm font-light text-center leading-6 mb-8 px-4">
          It is the hand that shapes the material, guided by the eye and the
          spirit of innovation.
        </Text>

        <TouchableOpacity className="self-center border border-white/30 px-8 py-3">
          <Text className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
            Read the Story
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white px-6 py-12 gap-8 border-t border-neutral-100">
        <TouchableOpacity className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-4">
            <Ionicons name="storefront-outline" size={18} color="#000" />
            <Text className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-900">
              Find a Boutique
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#000" />
        </TouchableOpacity>

        <View className="h-[1px] bg-neutral-100" />

        <TouchableOpacity className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-4">
            <Ionicons name="mail-outline" size={18} color="#000" />
            <Text className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-900">
              Contact Customer Care
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="bg-white h-10" />
    </ParallaxScrollView>
  );
}
