// app/(auth)/login.tsx

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { toast } from "sonner-native";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, token } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email & password");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      console.log("res", res);
      setUser(res.user, res.access_token);
      router.replace("/");
      toast.success("Logged in successfully!");
    } catch (err) {
      const error = err as AxiosError<any>;
      const message =
        error.response?.data?.message || "Email or password is incorrect.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-8 text-center">Login</Text>

      <Text className="font-medium mb-1">Email</Text>
      <TextInput
        className="border-b border-gray-300 pb-2 mb-6"
        placeholder="email@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text className="font-medium mb-1">Password</Text>
      <TextInput
        className="border-b border-gray-300 pb-2 mb-2"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        className="w-full py-3 bg-black rounded-md items-center mt-4"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Login</Text>
        )}
      </Pressable>

      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-neutral-300" />
        <Text className="mx-3 text-neutral-500 uppercase text-xs">
          Or continue with
        </Text>
        <View className="flex-1 h-px bg-neutral-300" />
      </View>

      <Pressable
        onPress={() => router.replace("/")}
        className="w-full py-3 border border-neutral-300 rounded-md flex-row items-center justify-center"
      >
        <Text className="text-neutral-700 font-medium">
          Continue with Google
        </Text>
      </Pressable>

      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-neutral-500 mr-2">Don't have an account?</Text>
        <Pressable
          onPress={() => router.push("/register")}
          className="py-1 px-2"
        >
          <Text className="text-black font-semibold">Create one</Text>
        </Pressable>
      </View>
    </View>
  );
}
