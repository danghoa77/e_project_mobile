import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { toast } from "sonner-native";

export const AuthLoader = ({ children }: React.PropsWithChildren) => {
  const { token, setUser, setLoading, isLoading, logout } = useAuthStore();
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { data: user } = await authApi.getUserProfile();
        console.log("Fetched user profile:", user);
        setUser(user, token);
      } catch (err) {
        toast.error("Session expired!");
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  if (isLoading) {
    return (
      <View className="flex-row items-center justify-center h-[50vh]">
        <ActivityIndicator size="large" />
        <Text className="ml-2 text-muted-foreground">
          Authenticating user...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};
