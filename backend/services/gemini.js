require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

let _model = null;

const getModel = () => {
  if (!_model) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is completely missing from your .env file! Please add it to use the AI generator.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Explicitly using a currently available model string from the v1beta list
    _model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
  }
  return _model;
};

/**
 * Generate a day-wise travel itinerary using Google Gemini 1.5 Flash.
 * Enhanced with real budget numbers, travel logistics, and personalization.
 */
const generateItinerary = async (from, destination, days, budget, travelType, interests) => {
  const systemPrompt = `You are an expert travel planner. Generate a detailed day-wise travel itinerary.
Return ONLY valid JSON matching this exact structure layout. Do not include markdown formatting or ANY extra conversational text.

{
  "destination": "string",
  "totalDays": number,
  "budget": "string",
  "totalEstimatedCost": "string (e.g. $850)",
  "currency": "USD",
  "budgetBreakdown": {
    "accommodation": number,
    "food": number,
    "transportation": number,
    "activities": number,
    "miscellaneous": number
  },
  "travelTips": ["string"],
  "days": [
    {
      "day": number,
      "title": "string — short theme for the day",
      "dailyCost": "string (e.g. $280)",
      "activities": [
        {
          "time": "string (e.g. 9:00 AM)",
          "activity": "string",
          "description": "string (1-2 sentences)",
          "estimatedCost": "string (e.g. $5 or Free)",
          "location": "string (specific place name with city)",
          "type": "attraction|food|transport|stay|nature|shopping|nightlife",
          "travelFromPrevious": {
            "distance": "string (e.g. 1.2 km)",
            "duration": "string (e.g. 10 min)",
            "mode": "Walk|Metro|Cab|Auto|Bus|Flight|Train|Ferry"
          }
        }
      ]
    }
  ]
}

CRITICAL RULES:
- budgetBreakdown values MUST be numbers (not strings), representing USD amounts
- The first activity of Day 1 should have travelFromPrevious as null
- Every subsequent activity MUST have travelFromPrevious with realistic distance, duration, and mode
- Each activity MUST have a "type" field from the allowed values
- estimatedCost should use realistic local prices
- dailyCost should sum up all activities + meals + transport for that day
- totalEstimatedCost should be the sum of all dailyCosts
- Include exactly 3-4 highly curated activities per day (Do not exceed 4)
- travelTips should have 3 practical tips`;

  const routeString = from ? `from ${from} to ${destination}` : `for ${destination}`;
  
  // Build personalization context
  let personalizationContext = '';
  if (travelType) {
    personalizationContext += `\nTravel type: ${travelType} travel.`;
    if (travelType === 'Family') personalizationContext += ' Include family-friendly activities, kid-appropriate venues, and relaxed pacing.';
    if (travelType === 'Couple') personalizationContext += ' Include romantic spots, fine dining, scenic viewpoints, and intimate experiences.';
    if (travelType === 'Solo') personalizationContext += ' Include social hostels, walking tours, street food, and safe solo-friendly activities.';
    if (travelType === 'Friends') personalizationContext += ' Include group activities, nightlife, adventure sports, and fun experiences.';
  }
  if (interests && interests.length > 0) {
    personalizationContext += `\nKey interests to prioritize: ${interests.join(', ')}.`;
  }

  const userPrompt = `Create a ${days}-day travel itinerary ${routeString} with a ${budget} budget.
Include detailed activities with REALISTIC estimated costs in USD, travel logistics between places, and practical travel tips.
${from ? 'Ensure Day 1 accurately reflects arrival and travel logistics from the origin location.' : ''}${personalizationContext}`;

  const prompt = `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`;

  try {
    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // Safety fallback in case the model returns markdown despite responseMimeType
    const cleaned = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to generate itinerary with Gemini. Check server logs.');
  }
};

/**
 * Chat with the AI travel assistant via Gemini.
 */
const chatWithAssistant = async (message, history = []) => {
  const formatHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    // We instantiate a separate model context for chat if we wish, or use the global one
    const chatModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: "gemini-flash-latest" });
    const chatSession = chatModel.startChat({
      history: formatHistory,
      systemInstruction: "You are a friendly and knowledgeable travel assistant. Help users with travel-related questions, provide recommendations, tips, and advice. Keep responses concise, helpful, and engaging."
    });

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    return "I'm having trouble connecting right now. Please try again soon!";
  }
};

module.exports = { generateItinerary, chatWithAssistant };
