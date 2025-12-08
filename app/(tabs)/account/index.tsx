import { withAuth } from "@/components/auth/withAuth";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";
function AccountPage() {
  const router = useRouter();

  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("Logged out successfully!");
  };
  return (
    <ParallaxScrollView>
      <View className="flex-1 bg-white dark:bg-black px-5 pt-12">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Account
          </Text>

          <TouchableOpacity
            onPress={() => handleLogout()}
            className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800"
          >
            <Ionicons name="log-out-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-gray-200 dark:bg-neutral-800 items-center justify-center mb-3">
            <MaterialIcons name="person-2" size={40} color="#555" />
          </View>

          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {user!.name}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            {user!.email}
          </Text>
        </View>

        <View className="gap-3">
          <MenuItem
            title="Orders"
            icon="cube-outline"
            onPress={() => router.push("/")}
          />
          <MenuItem
            title="Wishlist"
            icon="heart-outline"
            onPress={() => router.push("/")}
          />
          <MenuItem
            title="Addresses"
            icon="location-outline"
            onPress={() => router.push("/")}
          />
          <MenuItem
            title="Payment Methods"
            icon="card-outline"
            onPress={() => router.push("/")}
          />
        </View>

        <View className="mt-16 items-center opacity-60">
          <Image
            source={{
              uri: "https://res.cloudinary.com/dzskttedu/image/upload/v1753605066/Logo_Hismes_Italy_v%E1%BB%9Bi_xe_ng%E1%BB%B1aa1-removebg-preview_ngtmst.png",
            }}
            className="w-12 h-12"
          />

          <Text className="text-[11px] mt-1 text-gray-500 tracking-wide">
            © Hismes 2025. All rights reserved.
          </Text>
        </View>
      </View>
    </ParallaxScrollView>
  );
}
function MenuItem({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color="#f37021" />
        <Text className="text-gray-900 dark:text-white text-base">{title}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#aaa" />
    </TouchableOpacity>
  );
}

export default withAuth(AccountPage);
