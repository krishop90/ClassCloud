const express = require("express");
const router = express.Router();
const axios = require("axios");
const FAQ = require("../models/faqModel"); 
const ChatHistory = require("../models/chatHistoryModel");
require("dotenv").config();

router.post("/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Chatbot API is not configured" });
    }
    const faq = await FAQ.findOne({ question: message });
    if (faq) {
      return res.json({ reply: faq.answer });
    }

    const cachedResponse = await ChatHistory.findOne({ userMessage: message }).sort({ createdAt: -1 });
    if (cachedResponse) {
      return res.json({ reply: cachedResponse.botReply });
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: `You are ClassCloud's official chatbot. Be concise, direct, and clear. Question: "${message}".` }
            ]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't find an answer.";

    await ChatHistory.create({ userMessage: message, botReply });

    res.json({ reply: botReply });

  } catch (error) {
    const friendly = "I'm having trouble reaching the AI service right now. Please try again in a moment.";
    return res.status(200).json({ reply: friendly });
  }
});




module.exports = router;
