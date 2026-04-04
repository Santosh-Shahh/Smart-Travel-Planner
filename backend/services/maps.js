const axios = require('axios');

/**
 * Geocode a destination name to latitude/longitude using Google Geocoding API.
 *
 * @param {string} destination - Place name (e.g. "Paris, France")
 * @returns {{ lat: number, lng: number } | null} Coordinates or null
 */
const geocodeDestination = async (destination) => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: destination,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.results.length > 0) {
      return response.data.results[0].geometry.location; // { lat, lng }
    }

    return null;
  } catch (error) {
    console.error('Geocoding API error:', error.message);
    return null;
  }
};

module.exports = { geocodeDestination };
