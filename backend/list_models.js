const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrU4m4zA93kr0ufHTxWdzI-VQngBGKb6Y');

async function listModels() {
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCrU4m4zA93kr0ufHTxWdzI-VQngBGKb6Y';
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

listModels();
