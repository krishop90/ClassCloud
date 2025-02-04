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
    const faq = await FAQ.findOne({ question: message });
    if (faq) {
      return res.json({ reply: faq.answer });
    }

    const cachedResponse = await ChatHistory.findOne({ userMessage: message }).sort({ createdAt: -1 });
    if (cachedResponse) {
      return res.json({ reply: cachedResponse.botReply });
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are ClassCloud's official chatbot. Always give concise, direct, and clear answers. Avoid any irrelevant details. Here's the question: "${message}".`
              }
            ]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    const botReply = response.data.candidates[0]?.content?.parts[0]?.text || "I couldn't find an answer.";

    await ChatHistory.create({ userMessage: message, botReply });

    res.json({ reply: botReply });

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get a response from Gemini AI" });
  }
});




module.exports = router;
