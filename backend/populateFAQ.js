require('dotenv').config();
const mongoose = require("mongoose");
const FAQ = require("./models/faqModel");

async function populateFAQ() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const faqs = [
      { question: "What are the features of ClassCloud?", answer: "ClassCloud offers features like community creation, real-time chat, and note sharing." },
      { question: "How do I create a community in ClassCloud?", answer: "Go to the Communities section and click 'Create' Provide the name and description." },
      { question: "How do I upload notes?", answer: "Navigate to the Notes section and click 'Upload.' Choose a file to upload." },
      { question: "How does real-time chat work?", answer: "ClassCloud provides instant messaging between users to discuss topics or solve doubts." },
      { question: "How do I join a study group?", answer: "Navigate to the Communities section, find a study group and click 'Join.'" },
      { question: "Who created this site?", answer: "This site is created by Krish, Kirtan, Sanjay, and Raj." },
      { question: "What is ClassCloud?", answer: "ClassCloud is a platform for students to collaborate, share notes, and chat in real-time." },
    ];

    for (const faq of faqs) {
      const existingFAQ = await FAQ.findOne({ question: faq.question });
      if (!existingFAQ) {
        await FAQ.create(faq);
        console.log(`Added FAQ: ${faq.question}`);
      } else {
        console.log(`FAQ already exists: ${faq.question}`);
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error connecting to MongoDB or inserting FAQ data:", error);
  }
}

populateFAQ();
