import React from "react";
import { SafeAreaView, Text } from "react-native";
import ChatBox from "./components/ChatBox";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>
        Zenroute 💬
      </Text>
      <ChatBox />
    </SafeAreaView>
  );
}
