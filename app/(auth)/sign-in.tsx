import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { useToast } from "@/lib/toast-context";
import { getClerkErrorMessage } from "@/lib/errors";

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    if (!email || !password) {
      showToast("error", "Sign In Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password: password,
      });

      // This will activate the session and log the user in
      await setActive({ session: completeSignIn.createdSessionId });
      
      showToast("success", "Welcome Back!", "Signed in successfully.");

      // Redirect to the main application
      router.replace("/(root)/(tabs)");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const errorMessage = getClerkErrorMessage(err);
      showToast("error", "Sign In Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} 
          className="px-6 py-8"
        >
          <View className="mb-8 items-center">
            <Image
              source={require("../../assets/images/kribb.png")}
              style={{ width: 140, height: 70 }}
              resizeMode="contain"
              className="mb-4"
            />
            <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
            <Text className="text-gray-500 text-base text-center">Sign in to manage your real estate preferences</Text>
          </View>

          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Password</Text>
              <TextInput
                secureTextEntry
                placeholder="Enter your password"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={setPassword}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={onSignInPress}
            disabled={loading}
            className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center"
            style={{ backgroundColor: "#0E4D92" }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold" style={{ color: "#0E4D92" }}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
