// app/(tabs)/product/_layout.tsx
import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="orderHistory" options={{ headerShown: false }} />
    </Stack>
  );
}
