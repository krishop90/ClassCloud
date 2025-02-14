import React, { useState, useEffect, useRef, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import "../style/Chat.css";

// Update the Message component
const Message = memo(({ message, currentUserId, showSenderName }) => {
  const isOwnMessage = message.sender._id === currentUserId;

  return (
    <div className={`message ${isOwnMessage ? 'sent' : 'received'}`}>
      <div className="message-bubble">
        {!isOwnMessage && showSenderName && (
          <span className="sender-name">{message.sender.name}</span>
        )}
        <p className="message-text">{message.text}</p>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
});

const Chat = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [community, setCommunity] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Get user info from token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(tokenPayload.id); // Store user ID

      // Try to get username from different possible fields
      let username = tokenPayload.name;  // Try name first
      if (!username) {
        username = tokenPayload.username;  // Then try username
      }
      if (!username && tokenPayload.email) {
        username = tokenPayload.email.split('@')[0];  // Finally try email
      }
      if (!username) {
        username = "User";  // Fallback
      }

      setUserName(username);

      const newSocket = io("http://localhost:5001");
      setSocket(newSocket);

      // Join room with username
      newSocket.emit("joinCommunity", communityId, username);

      // Load initial data
      fetchCommunity();
      fetchMessages();

      // Socket listeners
      newSocket.on("receiveMessage", (message) => {
        setMessages(prev => [...prev, {
          ...message,
          sender: {
            name: message.sender.name || message.senderName || username
          }
        }]);
      });

      return () => newSocket.close();
    } catch (error) {
      console.error("Error setting up chat:", error);
      setError("Failed to initialize chat");
    }
  }, [communityId, navigate]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`/api/community/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunity(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching community:", error);
      setError("Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`/api/community/${communityId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const tokenPayload = JSON.parse(atob(token.split('.')[1]));

        // Send to backend
        await axios.post(
          `/api/community/${communityId}/messages`,
          {
            text: newMessage,
            senderName: userName,
            senderId: tokenPayload.id // Include sender ID
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Emit through socket
        socket.emit("sendMessage", communityId, {
          text: newMessage,
          sender: {
            _id: tokenPayload.id,
            name: userName
          },
          timestamp: new Date().toISOString()
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="chat-container">
      {loading ? (
        <div className="loading">Loading community chat...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : community ? (
        <>
          <div className="chat-header">
            <h2>{community.name}</h2>
            <p>{community.members?.length || 0} members</p>
          </div>
          <div className="chat-box">
            {messages.map((msg, index) => {
              const showSenderName = msg.sender._id !== currentUserId &&
                (index === 0 || messages[index - 1].sender._id !== msg.sender._id);

              return (
                <Message
                  key={msg._id || index}
                  message={msg}
                  currentUserId={currentUserId}
                  showSenderName={showSenderName}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        <div className="error">Community not found</div>
      )}
    </div>
  );
};

export default Chat;
