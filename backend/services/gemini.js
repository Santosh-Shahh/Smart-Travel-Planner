const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a day-wise travel itinerary using Google Gemini.
 */
const generateItinerary = async (from, destination, days, budget) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const systemPrompt = `You are an expert travel planner. Generate a detailed day-wise travel itinerary.
Return ONLY valid JSON following this exact structure:
{
  "destination": "string",
  "totalDays": number,
  "budget": "string",
  "budgetBreakdown": {
    "accommodation": "string",
    "food": "string",
    "transportation": "string",
    "activities": "string",
    "miscellaneous": "string"
  },
  "travelTips": ["string"],
  "days": [
    {
      "day": number,
      "title": "string — short theme for the day",
      "activities": [
        {
          "time": "string (e.g. 9:00 AM)",
          "activity": "string",
          "description": "string",
          "estimatedCost": "string",
          "location": "string"
        }
      ]
    }
  ]
}`;

  const routeString = from ? `from ${from} to ${destination}` : `for ${destination}`;
  const userPrompt = `Create a ${days}-day travel itinerary ${routeString} with a budget of ${budget}. 
Include detailed activities, estimated costs, and practical travel tips. 
${from ? 'Ensure Day 1 accurately reflects arrival and travel logistics from the origin location.' : ''}`;

  const response = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
    ],
  });

  const content = response.response.text().trim();
  
  // Clean json fences in case gemini injects them
  const cleaned = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

  return JSON.parse(cleaned);
};

/**
 * Chat with the AI travel assistant via Google Gemini.
 */
const chatWithAssistant = async (message, history = []) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  // Map history to Gemini format { role: 'user' | 'model', parts: [{ text }] }
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const systemPrompt = `You are a friendly and knowledgeable travel assistant. Help users with travel-related questions, provide recommendations, tips, and advice. Keep responses concise, helpful, and engaging.`;

  // Prepend system prompt to the first user message, or append to history if empty
  if (formattedHistory.length === 0) {
    formattedHistory.push({ role: 'user', parts: [{ text: systemPrompt }] });
    formattedHistory.push({ role: 'model', parts: [{ text: 'Understood.' }] });
  }

  const chatSession = model.startChat({
    history: formattedHistory,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });

  const result = await chatSession.sendMessage(message);
  return result.response.text().trim();
};

module.exports = { generateItinerary, chatWithAssistant };
