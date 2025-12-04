import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginTab, setIsLoginTab] = useState(true);

  // --- LOGIC HANDLERS ---
  const handleLogin = () => {
    // TODO: Thực hiện logic đăng nhập (Call API, validate, v.v.)
    console.log("Login pressed:", { email, password });
  };

  const handleGoogleLogin = () => {
    // TODO: Thực hiện logic đăng nhập bằng Google
    console.log("Google login pressed");
  };

  const handleTabSwitch = (isLogin: boolean) => {
    setIsLoginTab(isLogin);
    // TODO: Reset form hoặc điều hướng
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6 pb-10">
            {/* --- TOP TABS --- */}
            <View className="flex-row border border-black rounded overflow-hidden mb-10">
              <TouchableOpacity
                className={`flex-1 py-3 items-center justify-center ${
                  isLoginTab ? "bg-white" : "bg-gray-50"
                } border-r border-black`}
                onPress={() => handleTabSwitch(true)}
              >
                <Text
                  className={`text-base ${
                    isLoginTab ? "font-bold" : "font-medium text-gray-500"
                  }`}
                >
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 items-center justify-center ${
                  !isLoginTab ? "bg-white" : "bg-gray-50"
                }`}
                onPress={() => handleTabSwitch(false)}
              >
                <Text
                  className={`text-base ${
                    !isLoginTab ? "font-bold" : "font-medium text-gray-500"
                  }`}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- HEADER --- */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-black mb-2">
                Welcome Back
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                Enter your credentials to access your account.
              </Text>
            </View>

            {/* --- FORM --- */}
            <View className="mb-6">
              {/* Email */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-black mb-2">
                  Email
                </Text>
                <TextInput
                  className="border-b border-black py-2 text-base text-black"
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF" // gray-400
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-black mb-2">
                  Password
                </Text>
                <TextInput
                  className="border-b border-black py-2 text-base text-black"
                  placeholder="........"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* --- LOGIN BUTTON --- */}
            <TouchableOpacity
              className="bg-neutral-900 py-4 rounded items-center mb-8 active:bg-neutral-700"
              onPress={handleLogin}
            >
              <Text className="text-white text-base font-bold">Login</Text>
            </TouchableOpacity>

            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-3 text-xs font-semibold text-gray-400 uppercase">
                Or continue with
              </Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center border border-black py-3.5 rounded bg-white"
              onPress={handleGoogleLogin}
            >
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
                }}
                className="w-5 h-5 mr-3"
                resizeMode="contain"
              />
              <Text className="text-black text-base font-semibold">
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
