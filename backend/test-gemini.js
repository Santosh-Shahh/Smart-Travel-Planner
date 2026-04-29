require('dotenv').config();
const { generateItinerary } = require('./services/gemini');
(async () => {
   try {
     console.log("Generating for 'jap'...");
     const result = await generateItinerary("japan", "jap", 3, "Moderate", "Solo", []);
     console.log("SUCCESS");
   } catch(e) {
     console.error("FAIL:", e);
   }
})();
