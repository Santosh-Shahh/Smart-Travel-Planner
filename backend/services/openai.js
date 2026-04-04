const OpenAI = require('openai');

// Initialize the OpenAI client with the API key from environment
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a day-wise travel itinerary using OpenAI.
 *
 * @param {string} destination - Travel destination
 * @param {number} days - Number of days for the trip
 * @param {string} budget - Budget description (e.g. "$1500")
 * @returns {object} Parsed itinerary JSON
 */
const generateItinerary = async (destination, days, budget) => {
  const systemPrompt = `You are an expert travel planner. Generate a detailed day-wise travel itinerary in JSON format.
The JSON must follow this exact structure:
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
}
Return ONLY valid JSON, no markdown, no extra text.`;

  const userPrompt = `Create a ${days}-day travel itinerary for ${destination} with a budget of ${budget}. Include detailed activities, estimated costs, and practical travel tips.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content.trim();

  // Strip markdown code fences if the model wraps the output
  const cleaned = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

  return JSON.parse(cleaned);
};

/**
 * Chat with the AI travel assistant.
 *
 * @param {string} message - User's question
 * @param {Array} history - Previous messages [{role, content}]
 * @returns {string} Assistant response
 */
const chatWithAssistant = async (message, history = []) => {
  const systemPrompt = `You are a friendly and knowledgeable travel assistant. Help users with travel-related questions, 
provide recommendations, tips, and advice. Keep responses concise, helpful, and engaging.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content.trim();
};

module.exports = { generateItinerary, chatWithAssistant };
