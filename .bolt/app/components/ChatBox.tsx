import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet } from "react-native";

const ChatBox = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updated = [...messages, "You: " + input];
    setMessages(updated);
    const question = input;
    setInput("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are ZenBot, a helpful AI wellness assistant." },
            { role: "user", content: question },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "ZenBot didn’t reply.";
      setMessages([...updated, "ZenBot: " + reply]);
    } catch (err) {
      setMessages([...updated, "ZenBot: Error talking to server."]);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(_, i) => i.toString()}
        style={{ flex: 1 }}
      />
      <TextInput
        style={styles.input}
        placeholder="Ask ZenBot something..."
        value={input}
        onChangeText={setInput}
        onSubmitEditing={sendMessage}
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  message: { marginVertical: 4, fontSize: 14 },
});

export default ChatBox;
