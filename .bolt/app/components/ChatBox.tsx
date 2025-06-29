import { useState } from "react";

const ChatBox = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, "You: " + input]);
    const question = input;
    setInput("");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are ZenBot, a helpful assistant." },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "ZenBot didn’t reply.";
    setMessages((prev) => [...prev, "ZenBot: " + reply]);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded mt-6">
      <div className="h-64 overflow-y-scroll mb-2 border rounded p-2 text-sm">
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <input
        className="w-full p-2 border rounded"
        placeholder="Ask ZenBot..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
    </div>
  );
};

export default ChatBox;
