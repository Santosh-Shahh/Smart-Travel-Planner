<div align="center">

# ✈️ SmartTravel

### AI-Powered Travel Itinerary Generator

Generate personalized, day-by-day travel plans in seconds — complete with budget breakdowns, live weather, interactive maps, and one-click PDF exports.

🌐 **Live Demo →** [smart-travel-planner-app.vercel.app](https://smart-travel-planner-app.vercel.app)

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Key Features

1. **🤖 AI Itinerary Generation:** Dual-LLM architecture (Groq LLaMA 3.3 primary, Gemini 1.5 fallback) generates structured, day-by-day itineraries tailored to budget, travel type, and interests.
2. **💬 Contextual AI Chatbot:** Floating travel assistant for instant destination Q&A and personalized recommendations.
3. **🗺️ Interactive Maps & Routing:** Google Places autocomplete and embedded maps with geocoded destination markers.
4. **🌤️ Live Weather Integration:** Real-time 5-day forecasts via OpenWeatherMap.
5. **📊 Budget Analytics:** Visual breakdowns (Recharts) for accommodation, food, transport, and activities.
6. **🖼️ Smart Image Engine:** Context-aware activity photos fetched sequentially from Pexels, Unsplash, and Pixabay.
7. **🔐 Secure Authentication:** JWT-based sessions and Google OAuth 2.0 integration.
8. **📤 Trip Management:** Save, duplicate, share (via public links), and export itineraries to PDF.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, React Router v7, Framer Motion, Recharts, html2pdf.js
- **Backend:** Node.js, Express.js, Mongoose, JWT, Helmet, express-rate-limit
- **APIs:** Groq SDK, Google Generative AI, Google Maps/Places, OpenWeatherMap, Pexels/Unsplash/Pixabay
- **Infrastructure:** MongoDB Atlas, Vercel (Frontend), Render (Backend)

---

## 🏗️ Architecture

```text
User Input ──> [React Frontend] ──(Axios)──> [Express Backend] ──> [MongoDB]
                    │                                │
             (Render / PDF)                ┌─────────┴─────────┐
                                           │                   │
                                    [AI Services]      [Data APIs]
                                    (Groq, Gemini)     (Maps, Weather, Images)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ & **MongoDB Atlas** cluster
- **API Keys:** Groq, Google AI Studio, Google Cloud (Maps/Places), OpenWeatherMap. *(Optional: Pexels, Unsplash)*.

### 1. Clone & Install
```bash
git clone https://github.com/Santosh-Shahh/Smart-Travel-Planner.git
cd Smart-Travel-Planner
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT_SECRET, and API keys
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:5001/api and VITE_GOOGLE_CLIENT_ID
npm run dev
```

Navigate to `http://localhost:5173` to view the app!

---

## 📁 Project Structure (Simplified)

```text
Smart-Travel-Planner/
├── backend/
│   ├── models/        # Mongoose schemas (User, Trip)
│   ├── routes/        # API endpoints (Auth, Trips)
│   ├── services/      # External API integrations (AI, Weather, Maps, Images)
│   └── server.js      # Express app entry point
└── frontend/
    └── src/
        ├── components/# Reusable UI elements (TripForm, ChatBot, Maps)
        ├── context/   # React Context (Auth)
        ├── pages/     # Main views (Home, Results, Dashboard)
        └── App.jsx    # Client-side routing
```

---

## 🔄 How It Works

1. **Input:** User provides destination, duration, budget, and preferences.
2. **Parallel Processing:** Backend concurrently calls AI (Groq/Gemini), Weather, and Maps APIs.
3. **Rendering:** Frontend displays the generated itinerary with maps, charts, and contextual images.
4. **Persistence:** Authenticated users can save, share, or export trips as PDFs.

---

## 🔮 Future Improvements
- Flight & hotel booking integration.
- Real-time pricing & collaborative trip planning.
- Offline access via PWA.

## 🤝 Contributing
Contributions are welcome! Fork the repository, create a feature branch, and submit a pull request.

## 📜 License
[MIT License](LICENSE). Built with ❤️ by [Santosh Shah](https://github.com/Santosh-Shahh).
