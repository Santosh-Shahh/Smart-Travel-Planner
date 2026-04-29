require('dotenv').config({path: './backend/.env'});
const { generateItinerary } = require('./backend/services/gemini');

(async () => {
   try {
     console.log("Generating for 'jap'...");
     let res = await generateItinerary("japan", "jap", 3, "Moderate", "Solo", []);
     console.log("SUCCESS length:", res.days.length);
   } catch(e) {
     console.error("FAIL:", e.message);
   }
})();
