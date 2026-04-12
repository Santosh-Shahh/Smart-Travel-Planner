const axios = require('axios');
const { getPlaceImagePhotoURL } = require('./places');

// ─── Category → Keyword Mapping ─────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  transport: ['airport terminal', 'train station', 'taxi cab ride', 'bus station', 'ferry port', 'metro subway'],
  food: ['local restaurant cuisine', 'street food market', 'traditional dishes', 'cafe dining'],
  stay: ['hotel room interior', 'luxury hotel lobby', 'boutique hotel exterior', 'resort accommodation'],
  attraction: ['famous landmark', 'iconic tourist attraction', 'historic monument'],
  nature: ['scenic landscape view', 'national park', 'beautiful beach', 'mountain trail', 'waterfall'],
  shopping: ['local market bazaar', 'shopping street', 'traditional craft shop', 'mall'],
  nightlife: ['nightlife neon lights', 'rooftop bar city view', 'night city skyline', 'evening entertainment'],
};

// ─── Time → Visual Modifier Mapping ─────────────────────────────────────────
const getTimeModifier = (timeStr) => {
  if (!timeStr) return '';
  // Parse AM/PM time strings like "9:00 AM", "7:30 PM"
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (!match) return '';

  let hour = parseInt(match[1]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  if (hour >= 6 && hour < 10) return 'morning golden hour';
  if (hour >= 10 && hour < 16) return 'daytime';
  if (hour >= 16 && hour < 19) return 'sunset evening';
  if (hour >= 19 || hour < 6) return 'night lights';
  return '';
};

// ─── Transport Mode → Specific Keywords ─────────────────────────────────────
const TRANSPORT_MODE_KEYWORDS = {
  flight: 'airplane aircraft airport',
  train: 'train railway station platform',
  metro: 'metro subway underground station',
  cab: 'taxi cab city street ride',
  auto: 'auto rickshaw tuk tuk city',
  bus: 'bus station public transport',
  ferry: 'ferry boat harbor port',
  walk: 'pedestrian walkway city street',
};

// ─── Per-Trip Duplicate Tracking ─────────────────────────────────────────────
// Map<tripId, Set<imageId>> — prevents duplicate images within the same trip
const tripSessions = new Map();

// Auto-cleanup sessions after 30 minutes
const SESSION_TTL_MS = 30 * 60 * 1000;
const cleanupSession = (tripId) => {
  setTimeout(() => {
    tripSessions.delete(tripId);
  }, SESSION_TTL_MS);
};

const getUsedSet = (tripId) => {
  if (!tripId) return new Set();
  if (!tripSessions.has(tripId)) {
    tripSessions.set(tripId, new Set());
    cleanupSession(tripId);
  }
  return tripSessions.get(tripId);
};

// ─── Unsplash Search Cache ──────────────────────────────────────────────────
const unsplashCache = new Map();

/**
 * Build a smart, category-aware search query.
 *
 * @param {string} activity - Activity title (e.g. "Visit Meiji Shrine")
 * @param {string} city - Destination city (e.g. "Tokyo")
 * @param {string} country - Destination country (e.g. "Japan")  
 * @param {string} category - Activity type: attraction|food|transport|stay|nature|shopping|nightlife
 * @param {string} time - Time string (e.g. "7:30 PM")
 * @param {object} [travelFromPrevious] - Transport info if category is transport
 * @returns {string} Optimized search query
 */
const buildSmartQuery = (activity, city, country, category, time, travelFromPrevious) => {
  const parts = [];
  const cat = (category || 'attraction').toLowerCase();

  // For transport, use the transport mode keywords instead of the activity title
  if (cat === 'transport' && travelFromPrevious?.mode) {
    const modeKey = travelFromPrevious.mode.toLowerCase();
    const modeKeywords = TRANSPORT_MODE_KEYWORDS[modeKey] || TRANSPORT_MODE_KEYWORDS['cab'];
    parts.push(modeKeywords);
    if (city) parts.push(city);
  } else if (cat === 'attraction') {
    // For attractions, use the exact activity name — it's usually the landmark name
    parts.push(activity);
    if (city && !activity.toLowerCase().includes(city.toLowerCase())) {
      parts.push(city);
    }
  } else {
    // For food, stay, shopping, nightlife, nature — combine category keywords with city
    const keywords = CATEGORY_KEYWORDS[cat];
    if (keywords) {
      // Pick a keyword variant based on a hash of the activity for variety
      const hash = simpleHash(activity);
      parts.push(keywords[hash % keywords.length]);
    }
    if (city) parts.push(city);
    if (country && !city?.toLowerCase().includes(country.toLowerCase())) {
      parts.push(country);
    }
  }

  // Add time modifier for visual variety
  const timeMod = getTimeModifier(time);
  if (timeMod && (cat === 'attraction' || cat === 'nature' || cat === 'nightlife')) {
    parts.push(timeMod);
  }

  return parts.filter(Boolean).join(' ');
};

/**
 * Simple string hash for deterministic variety.
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// ─── Unsplash API Search ────────────────────────────────────────────────────

/**
 * Search Unsplash for images matching a query.
 * Returns an array of { id, url, thumbUrl } objects.
 *
 * @param {string} query - Search query
 * @param {number} perPage - Results per page (max 30)
 * @returns {Array} Array of image result objects
 */
const searchUnsplash = async (query, perPage = 15) => {
  const cacheKey = query.trim().toLowerCase();
  if (unsplashCache.has(cacheKey)) {
    return unsplashCache.get(cacheKey);
  }

  try {
    const response = await axios.get('https://unsplash.com/napi/search/photos', {
      params: {
        query,
        per_page: perPage,
        orientation: 'landscape',
      },
      timeout: 8000,
    });

    const results = (response.data?.results || []).map((photo) => ({
      id: photo.id,
      url: `${photo.urls.regular}&w=800&q=80`, // High quality, controlled size
      thumbUrl: photo.urls.small,
      description: photo.description || photo.alt_description || '',
    }));

    unsplashCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error(`Unsplash NAPI search error for "${query}":`, error.message);
    return null;
  }
};

// ─── Category-Specific Fallback URLs (Unsplash curated, no API needed) ──────
const CATEGORY_FALLBACKS = {
  transport: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80',
  ],
  stay: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
  ],
  attraction: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  ],
  nature: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528698827591-e19cef1a992c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=800&q=80',
  ],
  nightlife: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  ],
};

/**
 * Get a curated fallback image URL for a category.
 * Uses a hash of the activity name for variety.
 */
const getCategoryFallback = (category, activity, index = 0) => {
  const cat = (category || 'attraction').toLowerCase();
  const fallbacks = CATEGORY_FALLBACKS[cat] || CATEGORY_FALLBACKS.attraction;
  const hash = simpleHash(activity || 'unknown') + index;
  return fallbacks[hash % fallbacks.length];
};

// ─── Free API Image Fetchers ──────────────────────────────────────────────────

/**
 * Search Wikipedia for a landmark image.
 * Requires no API key and provides excellent real-world landmark photos.
 * @param {string} query
 * @returns {Promise<string|null>}
 */
const searchWikipediaImage = async (query) => {
  try {
    const res = await axios.get(`https://en.wikipedia.org/w/api.php`, {
      params: {
        action: 'query',
        generator: 'search',
        gsrsearch: query,
        gsrlimit: 1,
        prop: 'pageimages',
        pithumbsize: 800,
        format: 'json'
      },
      timeout: 4000
    });
    
    const pages = res.data?.query?.pages;
    if (pages) {
      const firstPage = Object.values(pages)[0];
      if (firstPage && firstPage.thumbnail && firstPage.thumbnail.source) {
        return firstPage.thumbnail.source;
      }
    }
  } catch (err) {
    console.error('Wikipedia image search failed for:', query);
  }
  return null;
}

// ─── Main Image Fetcher ─────────────────────────────────────────────────────

/**
 * Fetch the best matching activity image using a multi-source strategy.
 *
 * Priority:
 *   1. Unsplash API search (if key configured)
 *   2. Google Places photo (for named landmarks/places)
 *   3. Category-specific curated fallback
 *
 * @param {object} params
 * @param {string} params.activity - Activity title
 * @param {string} params.city - Destination city
 * @param {string} [params.country] - Destination country
 * @param {string} params.category - Activity type
 * @param {string} [params.time] - Activity time
 * @param {string} [params.tripId] - Trip session ID for dedup
 * @param {number} [params.index] - Activity index for variety
 * @param {string} [params.location] - Specific place name
 * @param {object} [params.travelFromPrevious] - Transport info
 * @returns {Promise<{imageUrl: string, source: string}>}
 */
const getActivityImage = async ({
  activity,
  city,
  country,
  category,
  time,
  tripId,
  index = 0,
  location,
  travelFromPrevious,
}) => {
  const usedSet = getUsedSet(tripId);
  const smartQuery = buildSmartQuery(activity, city, country, category, time, travelFromPrevious);

  // ── Source 1: Unsplash API (Will skip if key misses) ───────────────────
  const unsplashResults = await searchUnsplash(smartQuery);
  if (unsplashResults && unsplashResults.length > 0) {
    for (const result of unsplashResults) {
      if (!usedSet.has(result.id)) {
        usedSet.add(result.id);
        return { imageUrl: result.url, source: 'unsplash' };
      }
    }
    const fallbackResult = unsplashResults[index % unsplashResults.length];
    return { imageUrl: fallbackResult.url, source: 'unsplash' };
  }

  // ── Source 2: Wikipedia (Incredible free resolver for Landmarks) ────────
  if (category === 'attraction' || category === 'nature' || category === 'landmark' || category === 'stay' || category === 'food') {
    const wikiQuery = location || `${activity} ${city || ''}`.trim();
    const wikiUrl = await searchWikipediaImage(wikiQuery);
    if (wikiUrl) {
      const wikiId = `wiki_${simpleHash(wikiUrl)}`;
      if (!usedSet.has(wikiId)) {
        usedSet.add(wikiId);
        return { imageUrl: wikiUrl, source: 'wikipedia' };
      }
      return { imageUrl: wikiUrl, source: 'wikipedia' };
    }
  }

  // ── Source 3: Google Places (Will skip if billing disables) ─────────────
  try {
    const placesQuery = location || `${activity}, ${city}`;
    const photoUrl = await getPlaceImagePhotoURL(placesQuery, 'http://localhost:5173/', index);
    if (photoUrl) {
      const placesId = `gp_${simpleHash(placesQuery)}_${index}`;
      if (!usedSet.has(placesId)) {
        usedSet.add(placesId);
        return { imageUrl: photoUrl, source: 'google_places' };
      }
      return { imageUrl: photoUrl, source: 'google_places' };
    }
  } catch (err) {
    console.error('Google Places fallback error:', err.message);
  }

  // ── Source 4: Dynamic LoremFlickr (Guarantees zero repeats) ─────────────
  // Limits to 3 broad keywords to improve matching. Locks the seed for determinism.
  const keywords = Array.from(new Set(smartQuery.split(' ')))
    .filter(k => k.length > 3)
    .slice(0, 3)
    .join(',');
  const lockId = simpleHash(activity + city) + index;
  const loremUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keywords)}?lock=${lockId}`;
  
  return { imageUrl: loremUrl, source: 'loremflickr' };
};

module.exports = {
  getActivityImage,
  buildSmartQuery,
  getCategoryFallback,
};
