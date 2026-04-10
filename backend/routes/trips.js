const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip');
const { generateItinerary, chatWithAssistant } = require('../services/gemini');
const { getWeatherForecast } = require('../services/weather');
const { getPlaces } = require('../services/places');
const { geocodeDestination } = require('../services/maps');

const router = express.Router();

const generateLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { message: 'Too many requests. Please wait a minute before generating another trip.' } });
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { message: 'Too many chat messages. Please slow down.' } });

// ─── POST /api/trips/generate ───────────────────────────────────────────────
// Generate a new itinerary (public — no auth required so guests can try it)
router.post('/generate', generateLimiter, async (req, res) => {
  try {
    const { from, destination, days, budget, travelType, interests } = req.body;

    if (!destination || !days || !budget) {
      return res
        .status(400)
        .json({ message: 'Destination, days, and budget are required' });
    }

    // Fetch data from all services in parallel for speed
    const [itinerary, weather, places, coordinates] = await Promise.all([
      generateItinerary(from, destination, days, budget, travelType, interests),
      getWeatherForecast(destination),
      getPlaces(destination),
      geocodeDestination(destination),
    ]);

    res.json({
      from: from || null,
      destination,
      days: Number(days),
      budget,
      travelType: travelType || null,
      interests: interests || [],
      itinerary,
      weather,
      places,
      coordinates,
    });
  } catch (error) {
    console.error('Generate trip error:', error.message);
    res.status(500).json({
      message: 'Failed to generate itinerary. Please try again.',
      error: error.message,
    });
  }
});

// ─── POST /api/trips/save ───────────────────────────────────────────────────
// Save a generated trip to the database (auth required)
router.post('/save', protect, async (req, res) => {
  try {
    const { from, destination, days, budget, travelType, interests, itinerary, weather, places, coordinates } =
      req.body;

    const trip = await Trip.create({
      userId: req.user._id,
      from: from || null,
      destination,
      days,
      budget,
      travelType: travelType || null,
      interests: interests || [],
      itinerary,
      weather,
      places,
      coordinates,
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Save trip error:', error.message);
    res.status(500).json({ message: 'Failed to save trip' });
  }
});

// ─── POST /api/trips/duplicate/:id ──────────────────────────────────────────
// Duplicate a trip — re-generates itinerary with same parameters (auth required)
router.post('/duplicate/:id', protect, async (req, res) => {
  try {
    const originalTrip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!originalTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Re-generate with same params
    const [itinerary, weather, places, coordinates] = await Promise.all([
      generateItinerary(
        originalTrip.from,
        originalTrip.destination,
        originalTrip.days,
        originalTrip.budget,
        originalTrip.travelType,
        originalTrip.interests
      ),
      getWeatherForecast(originalTrip.destination),
      getPlaces(originalTrip.destination),
      geocodeDestination(originalTrip.destination),
    ]);

    const newTrip = await Trip.create({
      userId: req.user._id,
      from: originalTrip.from,
      destination: originalTrip.destination,
      days: originalTrip.days,
      budget: originalTrip.budget,
      travelType: originalTrip.travelType,
      interests: originalTrip.interests,
      itinerary,
      weather,
      places,
      coordinates,
    });

    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Duplicate trip error:', error.message);
    res.status(500).json({ message: 'Failed to duplicate trip' });
  }
});

// ─── GET /api/trips/shared/:id ──────────────────────────────────────────────
// Get a shared trip publicly by ID (no auth required)
router.get('/shared/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Shared trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Shared trip error:', error.message);
    res.status(500).json({ message: 'Failed to fetch shared trip' });
  }
});

// ─── GET /api/trips ─────────────────────────────────────────────────────────
// List all trips for the logged-in user (auth required)
router.get('/', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error.message);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
});

// ─── GET /api/trips/:id ─────────────────────────────────────────────────────
// Get a single trip by ID (auth required)
router.get('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error.message);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
});

// ─── DELETE /api/trips/:id ──────────────────────────────────────────────────
// Delete a trip (auth required)
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error.message);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
});

// ─── POST /api/trips/chat ───────────────────────────────────────────────────
// AI chatbot endpoint
router.post('/chat', chatLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const reply = await chatWithAssistant(message, history || []);
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ message: 'Chat service unavailable' });
  }
});

module.exports = router;
