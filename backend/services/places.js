const axios = require('axios');

/**
 * Search for popular tourist attractions near a destination
 * using the Google Places Text Search API.
 *
 * @param {string} destination - City or region name
 * @returns {Array} Array of place objects with name, address, rating, photo URL, location
 */
const getPlaces = async (destination) => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: `top tourist attractions in ${destination}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const places = response.data.results.slice(0, 10).map((place) => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      location: place.geometry.location, // { lat, lng }
      photo: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        : null,
      types: place.types || [],
    }));

    return places;
  } catch (error) {
    console.error('Places API error:', error.message);
    return [];
  }
};

// Simple in-memory cache to avoid duplicate API requests (Query -> Array of photo names)
const imageCache = new Map();

/**
 * Get a specific image URL for a place/query using Google Places Text Search.
 * Returns a deterministic photo based on the index to prevent exact image duplicates.
 *
 * @param {string} query - Location or landmark name
 * @param {string} referer - Spoofed referer header
 * @param {number|string} index - Seed index to pick unique photos
 * @returns {string|null} The resolved Google Places Photo URL, or null if none found
 */
const getPlaceImagePhotoURL = async (query, referer = 'http://localhost:5173/', index = 0) => {
  if (!query) return null;
  
  const cacheKey = query.trim().toLowerCase();
  const parsedIndex = parseInt(index) || 0;

  // Helper to build URL from photo name
  const buildPhotoUrl = (photoName) => 
    `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  if (imageCache.has(cacheKey)) {
    const cachedPhotos = imageCache.get(cacheKey);
    if (!cachedPhotos || cachedPhotos.length === 0) return null;
    // Pick the photo deterministically using modulo
    const targetPhotoName = cachedPhotos[parsedIndex % cachedPhotos.length];
    return buildPhotoUrl(targetPhotoName);
  }

  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery: query },
      {
        headers: {
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.photos',
          'Referer': referer
        }
      }
    );

    const place = response.data.places && response.data.places[0];
    if (place && place.photos && place.photos.length > 0) {
      // Store up to the first 5 photos to ensure variety
      const photoNames = place.photos.slice(0, 5).map(p => p.name);
      imageCache.set(cacheKey, photoNames);

      const targetPhotoName = photoNames[parsedIndex % photoNames.length];
      return buildPhotoUrl(targetPhotoName);
    }

    imageCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.error(`Places API image fetch error for "${query}":`, error.response?.data || error.message);
    return null;
  }
};

/**
 * Fetch autocomplete predictions for a given input string.
 * Uses Google Places API (New) Autocomplete.
 * 
 * @param {string} input - User typed query
 * @param {string} referer - Spoofed referer header
 * @returns {Array} Array of prediction objects { placeId, description }
 */
const autocompletePlaces = async (input, referer = 'http://localhost:5173/') => {
  if (!input) return [];

  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:autocomplete',
      { input },
      {
        headers: {
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'Referer': referer
        }
      }
    );

    if (response.data && response.data.suggestions) {
      return response.data.suggestions.map(s => ({
        placeId: s.placePrediction.placeId,
        description: s.placePrediction.text.text
      }));
    }

    return [];
  } catch (error) {
    console.error('Places Autocomplete API error:', error.response?.data || error.message);
    return [];
  }
};

module.exports = { getPlaces, getPlaceImagePhotoURL, autocompletePlaces };
