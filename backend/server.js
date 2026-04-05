require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

const { getPlaceImagePhotoURL, autocompletePlaces } = require('./services/places');
app.get('/api/place-image', async (req, res) => {
  try {
    const { query, index } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    // Pass query, referer, and index
    const referer = req.headers.referer || 'http://localhost:5173/';
    const imageUrl = await getPlaceImagePhotoURL(query, referer, index);
    if (!imageUrl) {
      return res.status(404).json({ message: 'No image found' });
    }
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Place image route error:', error.message);
    res.status(500).json({ message: 'Internal server error while fetching place image' });
  }
});

// Autocomplete route
app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    if (!input || input.trim().length < 2) {
      return res.json([]);
    }
    const referer = req.headers.referer || 'http://localhost:5173/';
    const predictions = await autocompletePlaces(input, referer);
    res.json(predictions);
  } catch (error) {
    console.error('Autocomplete route error:', error.message);
    res.status(500).json({ message: 'Failed to fetch autocomplete suggestions' });
  }
});

// ─── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Start server ────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
