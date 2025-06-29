import React, { useState } from "react";
import { SafeAreaView, Text, Button, View } from "react-native";
import ChatBox from "./components/ChatBox";

export default function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginVertical: 20 }}>
        Welcome to Zenroute 🧘‍♀️
      </Text>

      <Button
        title={showChat ? "Close ZenBot" : "Chat with ZenBot 🤖"}
        onPress={() => setShowChat(prev => !prev)}
      />

      {showChat && (
        <View style={{ flex: 1, marginTop: 20 }}>
          <ChatBox />
        </View>
      )}
    </SafeAreaView>
  );
}
