const axios = require('axios');

// ─── Configuration & Caching ────────────────────────────────────────────────
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const imageCache = new Map();

// ─── Anti-Duplicate Trip Sessions ───────────────────────────────────────────
const tripSessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 mins

const getUsedImages = (tripId) => {
  if (!tripId) return new Set();
  if (!tripSessions.has(tripId)) {
    tripSessions.set(tripId, new Set());
    setTimeout(() => tripSessions.delete(tripId), SESSION_TTL_MS);
  }
  return tripSessions.get(tripId);
};

// ─── Category Rules ─────────────────────────────────────────────────────────
const getCategoryKeywords = (category) => {
  const map = {
    attraction: 'landmark monument',
    food: 'local cuisine restaurant dining',
    hotel: 'hotel room resort stay luxury',
    stay: 'hotel room resort stay luxury',
    transport: 'metro airport taxi train station',
    shopping: 'market mall shopping bazaar store',
    nature: 'mountains lake forest scenic landscape',
    nightlife: 'bars club neon streets night evening',
    flight: 'airport airplane skyline aviation',
    landmark: 'landmark monument historic famous',
  };
  return map[(category || '').toLowerCase()] || 'travel tourism';
};

// ─── Helper string extraction ───────────────────────────────────────────────
const cleanTokens = (str) => {
  return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
};

/**
 * Score relevance based on how many activity/city/category tokens match the photo's title/tags.
 */
const scoreRelevance = (photoText, activity, city, country, category) => {
  const content = (photoText || '').toLowerCase();
  
  const activityTokens = cleanTokens(activity);
  const geographyTokens = cleanTokens(`${city} ${country}`);
  const catTokens = cleanTokens(getCategoryKeywords(category));

  let score = 0;
  
  // Exact or partial token matches in photo description
  for (const token of activityTokens) {
    if (content.includes(token)) score += 10;
  }
  for (const token of geographyTokens) {
    if (content.includes(token)) score += 5;
  }
  for (const token of catTokens) {
    if (content.includes(token)) score += 2;
  }

  return score;
};

// ─── Multi-Source Providers ─────────────────────────────────────────────────

/**
 * 1. Pexels API
 */
const fetchPexels = async (query) => {
  if (!process.env.PEXELS_API_KEY) return [];
  try {
    const res = await axios.get('https://api.pexels.com/v1/search', {
      params: { query, per_page: 8, orientation: 'landscape', size: 'large' },
      headers: { Authorization: process.env.PEXELS_API_KEY },
      timeout: 5000
    });
    return (res.data.photos || []).map(p => ({
      id: `pexels_${p.id}`,
      url: p.src.large2x || p.src.large || p.src.original,
      text: `${p.alt} ${p.url}`
    }));
  } catch (err) {
    return [];
  }
};

/**
 * 2. Unsplash API
 */
const fetchUnsplash = async (query) => {
  if (!process.env.UNSPLASH_ACCESS_KEY) return [];
  try {
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 8, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
      timeout: 5000
    });
    return (res.data.results || []).map(p => ({
      id: `unsplash_${p.id}`,
      url: p.urls.regular,
      text: `${p.description || ''} ${p.alt_description || ''} ${p.tags ? p.tags.map(t => t.title).join(' ') : ''}`
    }));
  } catch (err) {
    return [];
  }
};

/**
 * 3. Pixabay API
 */
const fetchPixabay = async (query) => {
  if (!process.env.PIXABAY_API_KEY) return [];
  try {
    const res = await axios.get('https://pixabay.com/api/', {
      params: { 
        key: process.env.PIXABAY_API_KEY, 
        q: query, 
        image_type: 'photo', 
        orientation: 'horizontal',
        per_page: 8,
        safesearch: true
      },
      timeout: 5000
    });
    return (res.data.hits || []).map(p => ({
      id: `pixabay_${p.id}`,
      url: p.largeImageURL || p.webformatURL,
      text: p.tags
    }));
  } catch (err) {
    return [];
  }
};

/**
 * Perform queries sequentially across providers.
 */
const fetchImageAcrossProviders = async (query, usedImages, activity, city, country, category) => {
  // Check cache (key incorporates query string)
  const cacheKey = `img_${query.toLowerCase().trim()}`;
  if (imageCache.has(cacheKey)) {
    const cachedResults = imageCache.get(cacheKey);
    // Find un-used in cache
    for (const r of cachedResults) {
      if (!usedImages.has(r.id)) {
        usedImages.add(r.id);
        return r.url;
      }
    }
    // If all cached are used, we must fall through to fetch new ones (or ignore)
  }

  // Define fallback chain
  const providers = [fetchPexels, fetchUnsplash, fetchPixabay];
  
  for (const provider of providers) {
    const results = await provider(query);
    if (results.length > 0) {
      imageCache.set(cacheKey, results); // cache immediately
      
      // Score results
      const scored = results.map(r => ({
        ...r,
        score: scoreRelevance(r.text, activity, city, country, category)
      })).sort((a, b) => b.score - a.score);

      // Pick highest scoring unused
      for (const r of scored) {
        if (!usedImages.has(r.id)) {
          usedImages.add(r.id);
          return r.url;
        }
      }
      
      // If all are used, return null to fall through to the next query in the cascade
    }
  }

  return null;
};

// ─── Main Image Service Export ──────────────────────────────────────────────

/**
 * Gets the best professional travel image using a smart multi-provider cascade.
 */
const getBestTravelImage = async (activity, city, country, category, tripId) => {
  const usedImages = getUsedImages(tripId);
  
  // Build query cascade list
  const queries = [
    `${activity} ${city} ${country}`.replace(/\s+/g, ' ').trim(),
    `${getCategoryKeywords(category)} ${city}`.trim(),
    `best travel places in ${city}`,
  ];

  for (const q of queries) {
    if (!q) continue;
    const url = await fetchImageAcrossProviders(q, usedImages, activity, city, country, category);
    if (url) return url;
  }

  // Failsafe 1: Destination Skyline
  const skylineQuery = `${city} skyline`;
  const skylineUrl = await fetchImageAcrossProviders(skylineQuery, usedImages, activity, city, country, category);
  if (skylineUrl) return skylineUrl;
  
  // Failsafe 2: Absolutely hardcoded high-quality stock if APIs are totally down or unconfigured
  return 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'; 
};

// Alias specifically for compatibility with existing imports depending on name
const getActivityImage = async (params) => {
  const { activity, city, country, category, tripId } = params;
  const url = await getBestTravelImage(activity, city, country, category, tripId);
  return { imageUrl: url, source: 'multi-engine' };
};

module.exports = {
  getBestTravelImage,
  getActivityImage // export mapping for server.js
};
