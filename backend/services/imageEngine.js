const axios = require('axios');
const { getPlaceImagePhotoURL } = require('./places');

// ─── Action verbs to strip from activity titles ───────────────────────────────
// "Visit Meiji Shrine"            → "Meiji Shrine"
// "Lunch at Tsukiji Market"       → "Tsukiji Market"
// "Take the Narita Express"       → "Narita Express"
const ACTION_PREFIXES = [
  /^(visit|explore|see|discover|tour|walk through|walk to|walk around|walk in|walk)\s+/i,
  /^(take|take the|catch|board|hop on|ride|travel by|travel via|travel on|travel to)\s+/i,
  /^(have|enjoy|grab|try|eat|taste|dine at|lunch at|dinner at|breakfast at|brunch at)\s+/i,
  /^(check in at|check in to|stay at|sleep at|arrive at|arrive in|depart from|depart to)\s+/i,
  /^(attend|watch|witness|experience|join|participate in)\s+/i,
  /^(shop at|shop in|browse|explore the)\s+/i,
  /^(morning at|evening at|afternoon at|night at)\s+/i,
  /^(head to|go to|travel to|transfer to|move to|proceed to)\s+/i,
];

/**
 * Extract the most meaningful place name from an AI-generated activity title.
 * "Narita Express to Shinjuku" → searches "Narita Express" then "Shinjuku"
 * "Lunch at Tsukiji Market"   → "Tsukiji Market"
 * "Visit Golden Pavilion"     → "Golden Pavilion"
 */
const extractPlaceName = (activity) => {
  if (!activity) return '';
  let name = activity.trim();

  // Strip leading action verbs
  for (const pattern of ACTION_PREFIXES) {
    name = name.replace(pattern, '');
  }

  // For "X to Y" transport patterns, return both so we can search either
  const toMatch = name.match(/^(.+?)\s+to\s+(.+)$/i);
  if (toMatch) {
    // Prefer the destination (Y) — e.g. "Shinjuku" is more searchable than "Narita Express to Shinjuku"
    return `${toMatch[2].trim()} ${toMatch[1].trim()}`;
  }

  return name.trim();
};

// ─── Transport Mode → Wikipedia fallback search terms ────────────────────────
const TRANSPORT_WIKI_TERMS = {
  flight: 'airport terminal international',
  train: 'railway train station',
  metro: 'metro subway underground',
  cab: 'taxi city street',
  auto: 'auto rickshaw tuk-tuk',
  bus: 'bus station public transport',
  ferry: 'ferry harbor boat',
  walk: 'pedestrian street city',
};

// ─── Curated category-specific static fallbacks (always work, no API needed) ─
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

// ─── Simple hash for deterministic variety ────────────────────────────────────
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getCategoryFallback = (category, activity, index = 0) => {
  const cat = (category || 'attraction').toLowerCase();
  const fallbacks = CATEGORY_FALLBACKS[cat] || CATEGORY_FALLBACKS.attraction;
  const hash = simpleHash(activity || 'unknown') + index;
  return fallbacks[hash % fallbacks.length];
};

// ─── Wikipedia Real-Photo Search ─────────────────────────────────────────────
const wikiCache = new Map();

/**
 * Fetch a real, authentic photo of a place from Wikipedia.
 * Tries the primary query first; falls back to secondaryQuery if no image is found.
 * Filters out flags, coats of arms, and SVG icons — only real photographs.
 *
 * @param {string} primaryQuery
 * @param {string} [secondaryQuery]
 * @returns {Promise<string|null>}
 */
const searchWikipediaImage = async (primaryQuery, secondaryQuery = null) => {
  const queries = [primaryQuery, secondaryQuery].filter(Boolean);

  for (const query of queries) {
    if (!query || query.trim().length < 3) continue;
    const cacheKey = query.toLowerCase().trim();

    if (wikiCache.has(cacheKey)) {
      const cached = wikiCache.get(cacheKey);
      if (cached) return cached;
      continue;
    }

    try {
      const res = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          generator: 'search',
          gsrsearch: query,
          gsrlimit: 5,
          prop: 'pageimages',
          pithumbsize: 900,
          pilimit: 5,
          format: 'json',
        },
        headers: {
          'User-Agent': 'SmartTravelPlanner/1.0 (https://smart-travel-planner-app.vercel.app; contact@smarttravel.app) Node.js/axios',
        },
        timeout: 5000,
      });

      const pages = res.data?.query?.pages;
      if (pages) {
        for (const page of Object.values(pages)) {
          const url = page?.thumbnail?.source;
          if (
            url &&
            !url.endsWith('.svg') &&
            !url.includes('Flag_of') &&
            !url.includes('Coat_of_arms') &&
            !url.includes('Logo') &&
            !url.includes('logo') &&
            !url.includes('icon') &&
            !url.includes('Icon')
          ) {
            wikiCache.set(cacheKey, url);
            return url;
          }
        }
      }
      wikiCache.set(cacheKey, null);
    } catch (err) {
      console.error(`Wikipedia search failed for "${query}":`, err.message);
    }
  }

  return null;
};

// ─── Per-Trip Duplicate Tracking ─────────────────────────────────────────────
const tripSessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000;
const cleanupSession = (tripId) => setTimeout(() => tripSessions.delete(tripId), SESSION_TTL_MS);
const getUsedSet = (tripId) => {
  if (!tripId) return new Set();
  if (!tripSessions.has(tripId)) {
    tripSessions.set(tripId, new Set());
    cleanupSession(tripId);
  }
  return tripSessions.get(tripId);
};

// ─── Main Image Fetcher ───────────────────────────────────────────────────────

/**
 * Fetch the best real matching image for an itinerary activity.
 *
 * Priority:
 *   1. Wikipedia real photo (smart place name extraction + city fallback query)
 *   2. Google Places photo (only if billing-enabled API key is set)
 *   3. Curated category-specific static fallback (always reliable)
 *
 * @param {object} params
 * @param {string} params.activity  - Activity title
 * @param {string} params.city      - Destination city
 * @param {string} [params.country] - Destination country
 * @param {string} params.category  - Activity category
 * @param {string} [params.tripId]  - Session ID for dedup tracking
 * @param {number} [params.index]   - Activity index
 * @param {string} [params.location]- Explicit location name override
 * @param {object} [params.travelFromPrevious] - Transport info { mode }
 * @returns {Promise<{imageUrl: string, source: string}>}
 */
const getActivityImage = async ({
  activity,
  city,
  country,
  category,
  tripId,
  index = 0,
  location,
  travelFromPrevious,
}) => {
  const usedSet = getUsedSet(tripId);
  const cat = (category || 'attraction').toLowerCase();

  // ── Build Wikipedia search queries ───────────────────────────────────────
  let primaryWikiQuery;
  let fallbackWikiQuery;

  if (location) {
    primaryWikiQuery = location;
    fallbackWikiQuery = city ? `${location} ${city}` : null;
  } else if (cat === 'transport') {
    const placeName = extractPlaceName(activity);
    const modeKey = (travelFromPrevious?.mode || 'train').toLowerCase();
    const modeTerms = TRANSPORT_WIKI_TERMS[modeKey] || 'railway station';
    primaryWikiQuery = placeName;
    fallbackWikiQuery = city ? `${modeTerms} ${city}` : modeTerms;
  } else {
    const placeName = extractPlaceName(activity);
    primaryWikiQuery = placeName;
    fallbackWikiQuery = city ? `${placeName} ${city}` : null;
  }

  // ── Source 1: Wikipedia (real place photos, completely free) ─────────────
  const wikiUrl = await searchWikipediaImage(primaryWikiQuery, fallbackWikiQuery);
  if (wikiUrl) {
    const wikiId = `wiki_${simpleHash(wikiUrl)}`;
    usedSet.add(wikiId);
    return { imageUrl: wikiUrl, source: 'wikipedia' };
  }

  // ── Source 2: Google Places (only if billing-enabled API key present) ────
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const placesQuery = location || `${activity}, ${city}`;
      const photoUrl = await getPlaceImagePhotoURL(
        placesQuery,
        'https://smart-travel-planner-app.vercel.app/',
        index
      );
      if (photoUrl) {
        return { imageUrl: photoUrl, source: 'google_places' };
      }
    } catch (err) {
      // Silent fail — Google billing may not be enabled
    }
  }

  // ── Source 3: Curated category static fallback (always reliable) ─────────
  const fallbackUrl = getCategoryFallback(category, activity, index);
  return { imageUrl: fallbackUrl, source: 'fallback' };
};

module.exports = {
  getActivityImage,
  extractPlaceName,
  getCategoryFallback,
};
