require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const chatModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: "You are a friendly and knowledgeable travel assistant."
    });
    const chatSession = chatModel.startChat({
      history: []
    });

    const result = await chatSession.sendMessage("hello");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (err) {
    console.error("Error from startChat:", err);
  }
}

test();
