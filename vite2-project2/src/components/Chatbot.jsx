import React, { useState } from "react";
import axiosInstance from "../config/axios";
import "../style/Chatbot.css";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.post("/chatbot/ask", { message: trimmed });
      const reply = res.data?.reply || "Sorry, I couldn't find an answer.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      console.error("Chatbot request failed:", err);
      setError("Failed to contact chatbot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {isLoading && <div className="msg bot">Thinking…</div>}
        {error && <div className="error">{error}</div>}
      </div>
      <form className="chatbot-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
