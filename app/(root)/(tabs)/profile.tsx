import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useToast } from "@/lib/toast-context";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast("success", "Signed Out", "You have been signed out successfully.");
    } catch (error) {
      console.error("Sign out error:", error);
      showToast("error", "Error", "Failed to sign out. Please try again.");
    }
  };

  const userInitial = user?.firstName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0) || "U";
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "User Profile";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        {/* Profile Card Header */}
        <View className="items-center mb-8">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-24 h-24 rounded-full border-4 border-white shadow-sm mb-4"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-primary justify-center items-center mb-4" style={{ backgroundColor: "#0E4D92" }}>
              <Text className="text-white text-3xl font-bold uppercase">{userInitial}</Text>
            </View>
          )}
          <Text className="text-2xl font-bold text-gray-900 mb-1">{fullName}</Text>
          <Text className="text-gray-500 text-sm">{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>

        {/* Options List */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center mr-3" style={{ backgroundColor: "#E6F4FE" }}>
                <Ionicons name="settings-outline" size={20} color="#0E4D92" />
              </View>
              <Text className="text-gray-800 font-semibold text-base">Account Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center mr-3" style={{ backgroundColor: "#E6F4FE" }}>
                <Ionicons name="bookmark-outline" size={20} color="#0E4D92" />
              </View>
              <Text className="text-gray-800 font-semibold text-base">Saved Properties</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center mr-3" style={{ backgroundColor: "#E6F4FE" }}>
                <Ionicons name="notifications-outline" size={20} color="#0E4D92" />
              </View>
              <Text className="text-gray-800 font-semibold text-base">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <View className="mt-auto">
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-full bg-red-50 border border-red-200 py-4 rounded-xl flex-row justify-center items-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
