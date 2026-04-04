# Smart Travel Planner (AI + APIs)

A full-stack, production-ready web application that generates personalized day-by-day travel itineraries based on destination, budget, and duration using OpenAI.

## 🚀 Features

- **AI-Powered Itineraries:** Fully detailed daily plans, including activities, time, and hidden gems.
- **Smart Budget Estimation:** Realistic cost breakdown based on selected budget tiers.
- **Integrated Forecasts:** 5-day weather forecasts via OpenWeatherMap.
- **Trip Dashboard:** Securely save your favorite itineraries to your account.
- **AI Chatbot:** Built-in floating chat assistant for instant travel queries and tips.
- **JWT Authentication:** Secure user registration, login, and protected routes.

---

## 🧱 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Framer Motion, React-Hot-Toast.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (using Mongoose).
- **APIs:** OpenAI, Google Maps (Geocoding/Places), OpenWeatherMap.

---

## 📁 Repository Structure

```
.
├── backend/            # Express Backend API
│   ├── config/         # DB connection
│   ├── middleware/     # JWT Auth guard
│   ├── models/         # User & Trip Schemas
│   ├── routes/         # Express routers
│   ├── services/       # OpenAI, Maps, Weather fetchers
│   ├── server.js       # Entry point
│   └── package.json    
└── frontend/           # React + Tailwind Frontend
    ├── src/
    │   ├── api/        # Axios configuration
    │   ├── components/ # Reusable UI components
    │   ├── context/    # Auth context provider
    │   ├── pages/      # Route pages
    │   ├── App.jsx     # Main Router
    │   └── main.jsx    
    ├── vite.config.js  
    └── package.json    
```

---

## ⚙️ Getting Started & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/atlas) cluster URI
- API Keys: 
  - [OpenAI](https://platform.openai.com/)
  - [Google Maps API](https://console.cloud.google.com/)
  - [OpenWeatherMap](https://openweathermap.org/)

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and add your `MONGO_URI`, `OPENAI_API_KEY`, etc.*
4. Start the backend server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

### 3. Open in Browser
Visit `http://localhost:5173` to view the app!

---

## ⚠️ Important Notes

- **AI Billing:** Ensure your OpenAI account has billing set up, or the API returns a 429 quota error.
- **Google Maps Quotas:** Restrict your keys in Google Cloud to avoid unexpected charges.

---

## ☁️ Deployment Guidelines

- **Frontend:** Recommended to deploy on [Vercel](https://vercel.com).
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Dir: `dist`
- **Backend:** Recommended to deploy on [Render](https://render.com) or [Railway](https://railway.app).
- **Database:** Hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
