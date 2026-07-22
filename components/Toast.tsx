import React, { useEffect, useRef } from "react";
import { Animated, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ToastProps {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  onClose: () => void;
}

export function Toast({ type, title, message, onClose }: ToastProps) {
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    // Slide down animation
    Animated.spring(translateY, {
      toValue: 50,
      useNativeDriver: true,
      tension: 15,
      friction: 6,
    }).start();

    // Auto dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -180,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const getTheme = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 border-green-200",
          titleColor: "text-green-800",
          descColor: "text-green-600",
          icon: "checkmark-circle" as const,
          iconColor: "#22C55E",
        };
      case "error":
        return {
          bg: "bg-red-50 border-red-200",
          titleColor: "text-red-800",
          descColor: "text-red-600",
          icon: "alert-circle" as const,
          iconColor: "#EF4444",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 border-blue-200",
          titleColor: "text-blue-800",
          descColor: "text-blue-600",
          icon: "information-circle" as const,
          iconColor: "#3B82F6",
        };
    }
  };

  const theme = getTheme();

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: "absolute",
        top: 0,
        left: 16,
        right: 16,
        zIndex: 99999,
        elevation: 10,
      }}
      className={`p-4 rounded-xl border flex-row items-start shadow-md ${theme.bg}`}
    >
      <View className="pt-0.5">
        <Ionicons name={theme.icon} size={24} color={theme.iconColor} />
      </View>
      <View className="flex-1 ml-3 mr-2">
        <Text className={`font-bold text-sm leading-tight ${theme.titleColor}`}>
          {title}
        </Text>
        <Text className={`text-xs mt-1 leading-normal ${theme.descColor}`}>
          {message}
        </Text>
      </View>
      <TouchableOpacity onPress={handleDismiss} className="p-1 -mr-1 -mt-1">
        <Ionicons name="close" size={20} color="#718096" />
      </TouchableOpacity>
    </Animated.View>
  );
}
