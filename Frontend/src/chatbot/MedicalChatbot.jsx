import { useState } from "react";
import axios from "axios";

const MedicalChatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const CHATBOT_URL = "https://medical-chatbot-pinecone.onrender.com/get"; // same as HTML

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // HTML used FormData, backend may expect it
      const formData = new FormData();
      formData.append("msg", input);

      const res = await axios.post(CHATBOT_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const botMessage = { sender: "bot", text: res.data || res.data.answer || "No reply" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to chatbot. Please try later." },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">Medical Chatbot</h2>
      <div className="border rounded p-4 h-80 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 p-2 rounded ${
              m.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-100"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="border p-2 flex-1 rounded"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="bg-blue-600 text-white px-4 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default MedicalChatbot;
