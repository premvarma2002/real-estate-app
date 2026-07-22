import "../globals.css";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View, Text } from "react-native";
import { ToastProvider } from "@/lib/toast-context";
import { tokenCacheSafe } from "@/lib/cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Check if the user is currently on an authentication route
    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      // If not logged in, redirect to sign-in page
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && inAuthGroup) {
      // If logged in and on auth pages, redirect to main application
      router.replace("/(root)/(tabs)");
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0E4D92" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(root)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-red-500 font-bold text-lg text-center mb-2">
          Clerk Publishable Key Missing
        </Text>
        <Text className="text-gray-500 text-center text-sm">
          Please add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file and restart the development server.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCacheSafe} publishableKey={publishableKey}>
      <ClerkLoaded>
        <ToastProvider>
          <InitialLayout />
        </ToastProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
