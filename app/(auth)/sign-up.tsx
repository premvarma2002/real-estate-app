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
import { useSignUp } from "@clerk/clerk-expo";
import { useToast } from "@/lib/toast-context";
import { getClerkErrorMessage } from "@/lib/errors";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!firstName || !lastName || !email || !password) {
      showToast("error", "Sign Up Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Create user session setup with Clerk, including first and last name
      await signUp.create({
        emailAddress: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      });

      // Trigger the verification email code strategy
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      showToast("info", "Verification Code Sent", "Please check your email for the 6-digit code.");

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const errorMessage = getClerkErrorMessage(err);
      showToast("error", "Sign Up Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    if (!code) {
      showToast("error", "Verification Error", "Please enter the verification code.");
      return;
    }

    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        showToast("error", "Verification Failed", "Verification was not completed. Please try again.");
        return;
      }

      // Activate the session
      await setActive({ session: completeSignUp.createdSessionId });

      showToast("success", "Account Created!", "Welcome to the real estate app.");

      // Redirect to the home screen of the application
      router.replace("/(root)/(tabs)");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const errorMessage = getClerkErrorMessage(err);
      showToast("error", "Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      showToast("info", "New Code Sent", "Please check your email for the new 6-digit code.");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const errorMessage = getClerkErrorMessage(err);
      showToast("error", "Resend Failed", errorMessage);
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
          {pendingVerification ? (
            // Verification OTP input view
            <View>
              <View className="mb-8 items-center">
                <Image
                  source={require("../../assets/images/kribb.png")}
                  style={{ width: 140, height: 70 }}
                  resizeMode="contain"
                  className="mb-4"
                />
                <Text className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</Text>
                <Text className="text-gray-500 text-base text-center">
                  We&apos;ve sent a 6-digit verification code to <Text className="font-semibold text-gray-800">{email}</Text>
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">Verification Code</Text>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#A0AEC0"
                  value={code}
                  onChangeText={setCode}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-center text-xl font-bold tracking-widest mb-2"
                />
                <View className="flex-row justify-end">
                  <TouchableOpacity onPress={onResendPress} disabled={loading}>
                    <Text className="text-primary font-semibold text-sm" style={{ color: "#0E4D92" }}>
                      Send New Code
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={onVerifyPress}
                disabled={loading}
                className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center mb-4"
                style={{ backgroundColor: "#0E4D92" }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Verify Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPendingVerification(false)}
                className="w-full py-3 flex-row justify-center items-center"
              >
                <Text className="text-gray-500 font-semibold">Change Email / Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Credentials sign-up form view
            <View>
              <View className="mb-8 items-center">
                <Image
                  source={require("../../assets/images/kribb.png")}
                  style={{ width: 140, height: 70 }}
                  resizeMode="contain"
                  className="mb-4"
                />
                <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
                <Text className="text-gray-500 text-base text-center">Sign up to explore exclusive real estate listings</Text>
              </View>

              <View className="mb-6">
                <View className="flex-row mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-700 font-semibold mb-2">First Name</Text>
                    <TextInput
                      autoCapitalize="words"
                      placeholder="First Name"
                      placeholderTextColor="#A0AEC0"
                      value={firstName}
                      onChangeText={setFirstName}
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800"
                    />
                  </View>

                  <View className="flex-1 ml-2">
                    <Text className="text-gray-700 font-semibold mb-2">Last Name</Text>
                    <TextInput
                      autoCapitalize="words"
                      placeholder="Last Name"
                      placeholderTextColor="#A0AEC0"
                      value={lastName}
                      onChangeText={setLastName}
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800"
                    />
                  </View>
                </View>

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
                  <View className="relative">
                    <TextInput
                      secureTextEntry={!showPassword}
                      placeholder="Create a strong password"
                      placeholderTextColor="#A0AEC0"
                      value={password}
                      onChangeText={setPassword}
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 pr-12"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      className="absolute right-4 top-0 bottom-0 justify-center"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color="#0E4D92"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={loading}
                className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center"
                style={{ backgroundColor: "#0E4D92" }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Sign Up</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Already have an account? </Text>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary font-bold" style={{ color: "#0E4D92" }}>Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
