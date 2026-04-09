const Groq = require('groq-sdk');

// Lazily initialize the Groq client so dotenv has time to load
let _groq = null;
const getGroq = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate a day-wise travel itinerary using Groq (LLaMA 3.3 70B).
 * Enhanced with real budget numbers, travel logistics, and personalization.
 */
const generateItinerary = async (from, destination, days, budget, travelType, interests) => {
  const systemPrompt = `You are an expert travel planner. Generate a detailed day-wise travel itinerary.
Return ONLY valid JSON with NO markdown fences, NO extra text — just raw JSON following this EXACT structure:
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
          "description": "string (2-3 sentences)",
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
- Include 4-6 activities per day
- travelTips should have 5-7 practical tips`;

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
${from ? 'Ensure Day 1 accurately reflects arrival and travel logistics from the origin location.' : ''}${personalizationContext}
Remember: return ONLY raw JSON, no markdown, no explanation.`;

  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Groq');

  // Strip any accidental markdown fences
  const cleaned = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

  return JSON.parse(cleaned);
};

/**
 * Chat with the AI travel assistant via Groq.
 */
const chatWithAssistant = async (message, history = []) => {
  const systemPrompt = `You are a friendly and knowledgeable travel assistant. Help users with travel-related questions, provide recommendations, tips, and advice. Keep responses concise, helpful, and engaging.`;

  // Map history to OpenAI-compatible format
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: message },
  ];

  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 500,
    messages,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
};

module.exports = { generateItinerary, chatWithAssistant };
