const mongoose = require('mongoose');

/**
 * Trip schema — stores generated itineraries for a user.
 * `itinerary` holds the full AI-generated plan as a flexible object.
 */
const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    from: {
      type: String,
      default: null, // Legacy trips will just have null
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: 1,
      max: 30,
    },
    budget: {
      type: String,
      required: [true, 'Budget is required'],
    },
    travelType: {
      type: String,
      enum: ['Solo', 'Friends', 'Family', 'Couple', null],
      default: null,
    },
    interests: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: mongoose.Schema.Types.Mixed, // Flexible JSON from AI
      required: true,
    },
    weather: {
      type: mongoose.Schema.Types.Mixed, // Weather forecast data
      default: null,
    },
    places: {
      type: [mongoose.Schema.Types.Mixed], // Array of place objects
      default: [],
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
