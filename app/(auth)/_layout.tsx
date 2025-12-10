import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Toaster } from "sonner-native";

export default function AuthLayout() {
  const router = useRouter();

  return (
    <>
      <Toaster position="bottom-center" />

      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/")}
              style={{ paddingLeft: 12 }}
            >
              <Ionicons name="arrow-back" size={24} />
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </>
  );
}
