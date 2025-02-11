import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../style/Chat.css";

const Chat = () => {
  const { communityId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    const storedCommunities = JSON.parse(localStorage.getItem("yourCommunities")) || [];
    const foundCommunity = storedCommunities.find((c) => c.id === parseInt(communityId));
    setCommunity(foundCommunity);

    const storedMessages = JSON.parse(localStorage.getItem(`chat_${communityId}`)) || [];
    setMessages(storedMessages);
  }, [communityId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const updatedMessages = [...messages, { text: newMessage, sender: "You" }];
      setMessages(updatedMessages);
      localStorage.setItem(`chat_${communityId}`, JSON.stringify(updatedMessages));
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      {community ? (
        <>
          <h2>Chat in {community.name}</h2>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "You" ? "sent" : "received"}`}>
                <p><strong>{msg.sender}:</strong> {msg.text}</p>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      ) : (
        <p>Loading community chat...</p>
      )}
    </div>
  );
};

export default Chat;
