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
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { useToast } from "@/lib/toast-context";
import { getClerkErrorMessage } from "@/lib/errors";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPassword() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);

  const onRequestReset = async () => {
    if (!isLoaded) return;
    if (!email) {
      showToast("error", "Email Required", "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      showToast("success", "Reset Code Sent", "Please check your email for the 6-digit code.");
      setStep("reset");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const errorMessage = getClerkErrorMessage(err);
      showToast("error", "Request Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!isLoaded) return;
    if (!code || !password) {
      showToast("error", "Required Fields", "Please enter the verification code and your new password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status !== "complete") {
        showToast("error", "Reset Failed", "Could not complete password reset. Please try again.");
        return;
      }

      // Activate the session
      await setActive({ session: result.createdSessionId });
      showToast("success", "Password Reset Successful", "Your password has been reset, and you are logged in.");
      
      // Redirect to home
      router.replace("/(root)/(tabs)");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const errorMessage = getClerkErrorMessage(err);
      showToast("error", "Reset Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      showToast("info", "New Code Sent", "Please check your email for the new code.");
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
          <View className="mb-8 items-center">
            <Image
              source={require("../../assets/images/kribb.png")}
              style={{ width: 140, height: 70 }}
              resizeMode="contain"
              className="mb-4"
            />
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {step === "request" ? "Reset Password" : "Create New Password"}
            </Text>
            <Text className="text-gray-500 text-base text-center">
              {step === "request"
                ? "Enter your email address to receive a recovery code"
                : `We&apos;ve sent a reset code to ${email}`}
            </Text>
          </View>

          {step === "request" ? (
            // Step 1: Request Reset Code
            <View>
              <View className="mb-6">
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

              <TouchableOpacity
                onPress={onRequestReset}
                disabled={loading}
                className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center mb-4"
                style={{ backgroundColor: "#0E4D92" }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Send Reset Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                className="w-full py-3 flex-row justify-center items-center"
              >
                <Text className="text-gray-500 font-semibold">Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Step 2: Enter Code & Set New Password
            <View>
              <View className="mb-4">
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

              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">New Password</Text>
                <View className="relative">
                  <TextInput
                    secureTextEntry={!showPassword}
                    placeholder="Enter your new password"
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

              <TouchableOpacity
                onPress={onResetPassword}
                disabled={loading}
                className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center mb-4"
                style={{ backgroundColor: "#0E4D92" }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep("request")}
                className="w-full py-3 flex-row justify-center items-center"
              >
                <Text className="text-gray-500 font-semibold">Change Email / Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
