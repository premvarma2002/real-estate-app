
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../globals.css"
import React from "react";

const properties = [
  { id: 1, title: "Luxury Apartment", city: "Mumbai", price: "1.2cr" },
  { id: 2, title: "3BHK Flat", city: "Bangalore", price: "1.1cr" },
  { id: 3, title: "4BHK villa", city: "Delhi", price: "2.1cr" },
];

export default function Index() {
  return (
    <SafeAreaView className="p-4 bg-white">
      <View style={{ padding: 16 }}>
        <Text>Subscribe to Roadsidecoder</Text>
        <TextInput
          placeholder="Search City.."
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 10,
            marginTop: 12,
          }}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          onPress={() => alert("searching...")}
          style={{
            backgroundColor: "#2563EB",
            padding: 12,
            borderRadius: 8,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            {" "}
            Search{" "}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
              {item.title}
            </Text>
            <Text
              style={{
                marginBottom: 8,
                fontWeight: "bold",
                color: "#2563EB",
              }}
            >
              {item.city}
            </Text>
            <Text style={{ fontWeight: "bold", color: "#2563EB" }}>
              {item.price}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
