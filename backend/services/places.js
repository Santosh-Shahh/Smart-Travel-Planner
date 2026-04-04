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

module.exports = { getPlaces };
