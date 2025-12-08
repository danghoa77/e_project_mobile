import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React, { ComponentType, useEffect } from "react";

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.replace("/(auth)/login");
      }
    }, [user]);
    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
