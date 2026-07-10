require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

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
    if (process.env.GROQ_API_KEY) {
      console.log('Attempting generation with Groq API (Primary)...');
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const groqResponse = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        
        const content = groqResponse.choices[0]?.message?.content;
        return JSON.parse(content);
      } catch (groqError) {
        console.warn("Groq API Error, falling back to Gemini:", groqError.message);
        // Fallthrough to Gemini
      }
    }

    console.log('Attempting generation with Gemini API...');
    const MAX_RETRIES = 2;
    const BASE_DELAY_MS = 5000;
    let result;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        result = await getModel().generateContent(prompt);
        break;
      } catch (retryErr) {
        if (retryErr.status === 429 && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`Gemini rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw retryErr;
        }
      }
    }
    const response = await result.response;
    const content = response.text();
    
    // Safety fallback in case the model returns markdown despite responseMimeType
    const cleaned = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("All AI generation failed:", error.message);
    if (error.status === 429) {
      throw new Error('AI services are temporarily busy due to high traffic. Please wait a moment and try again.');
    }
    throw new Error('Failed to generate itinerary. Check server logs.');
  }
};

/**
 * Chat with the AI travel assistant via Gemini.
 */
const chatWithAssistant = async (message, history = []) => {
  const systemMessage = "You are a friendly and knowledgeable travel assistant. Help users with travel-related questions, provide recommendations, tips, and advice. Keep responses concise, helpful, and engaging.";

  // Try Groq first for faster response time
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      // Convert history to Groq/OpenAI format
      const groqMessages = [
        { role: "system", content: systemMessage }
      ];
      for (const msg of history) {
        if (msg.content.includes("Hi there! I am your AI travel guide") || 
            msg.content.includes("I'm having trouble connecting right now") ||
            msg.content.includes("I'm having trouble connecting to the network")) {
          continue;
        }
        groqMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
      }
      groqMessages.push({ role: 'user', content: message });

      const groqResponse = await groq.chat.completions.create({
        messages: groqMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
      });

      return groqResponse.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    } catch (groqError) {
      console.warn("Groq Chat API Error, attempting Gemini fallback:", groqError.message);
    }
  }

  // Fallback to Gemini
  // Gemini requires history to strictly start with 'user' and alternate 'user' -> 'model'
  let validHistory = [];
  for (const msg of history) {
    // Ignore default greetings and error messages from the frontend
    if (msg.content.includes("Hi there! I am your AI travel guide") || 
        msg.content.includes("I'm having trouble connecting right now") ||
        msg.content.includes("I'm having trouble connecting to the network")) {
      continue;
    }
    
    const role = msg.role === 'assistant' ? 'model' : 'user';
    
    // History must start with a user message
    if (validHistory.length === 0 && role === 'model') {
      continue;
    }
    
    // Ensure strict alternation
    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === role) {
      // Overwrite the previous consecutive message of the same role
      validHistory[validHistory.length - 1].parts[0].text = msg.content;
    } else {
      validHistory.push({ role, parts: [{ text: msg.content }] });
    }
  }

  try {
    const chatModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemMessage
    });
    const chatSession = chatModel.startChat({
      history: validHistory
    });

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (geminiError) {
    console.error("Gemini Chat API Error:", geminiError.message);
    throw new Error("All AI chat providers failed. Please check your API keys.");
  }
};

module.exports = { generateItinerary, chatWithAssistant };
