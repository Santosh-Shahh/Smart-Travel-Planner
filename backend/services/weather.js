const axios = require('axios');

/**
 * Fetch a 5-day / 3-hour weather forecast from OpenWeatherMap.
 *
 * @param {string} destination - City name or location string
 * @returns {object} Simplified weather forecast grouped by day
 */
const getWeatherForecast = async (destination) => {
  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/forecast',
      {
        params: {
          q: destination,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          cnt: 40, // max 5-day forecast
        },
      }
    );

    const { list, city } = response.data;

    // Group forecast entries by date and pick the midday reading
    const dailyMap = {};
    list.forEach((entry) => {
      const date = entry.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = entry;
      }
      // Prefer the 12:00 reading as the representative for the day
      if (entry.dt_txt.includes('12:00:00')) {
        dailyMap[date] = entry;
      }
    });

    const forecast = Object.entries(dailyMap).map(([date, entry]) => ({
      date,
      temp: Math.round(entry.main.temp),
      tempMin: Math.round(entry.main.temp_min),
      tempMax: Math.round(entry.main.temp_max),
      humidity: entry.main.humidity,
      description: entry.weather[0].description,
      icon: entry.weather[0].icon,
      windSpeed: entry.wind.speed,
    }));

    return {
      city: city.name,
      country: city.country,
      forecast: forecast.slice(0, 5),
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    // Return null so the caller can gracefully handle the absence of data
    return null;
  }
};

module.exports = { getWeatherForecast };
