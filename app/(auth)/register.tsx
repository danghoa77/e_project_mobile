import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
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

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const showError = (message: string) => toast.error(message);
  const showSuccess = (message: string) => toast.success(message);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      showError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, phone, password, role: "customer" };

      const res = await authApi.register({ ...payload, confirmPassword });
      showSuccess("Account created!");

      setUser(res.data.user, res.data.access_token);
      router.replace("/");
    } catch (error: any) {
      console.log(error);
      const message = error.response?.data?.message || "Registration failed";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-8 text-center">
        Create Account
      </Text>

      <Text className="font-medium mb-1">Name</Text>
      <TextInput
        className="border-b border-gray-300 pb-2 mb-4"
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />

      <Text className="font-medium mb-1">Email</Text>
      <TextInput
        className="border-b border-gray-300 pb-2 mb-4"
        placeholder="email@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text className="font-medium mb-1">Phone Number</Text>
      <TextInput
        className="border-b border-gray-300 pb-2 mb-4"
        placeholder="Your Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="number-pad"
      />

      <Text className="font-medium mb-1">Password</Text>
      <TextInput
        className="border-b border-gray-300 pb-2 mb-4"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text className="font-medium mb-1">Confirm Password</Text>
      <TextInput
        className="border-b border-gray-300 pb-2 mb-4"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable
        onPress={handleRegister}
        disabled={loading}
        className="w-full py-3 bg-black rounded-md items-center mt-6"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Create Account</Text>
        )}
      </Pressable>

      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-neutral-500 mr-2">Have an account?</Text>
        <Pressable onPress={() => router.push("/login")} className="py-1 px-2">
          <Text className="text-black font-semibold">Login now!</Text>
        </Pressable>
      </View>
    </View>
  );
}
