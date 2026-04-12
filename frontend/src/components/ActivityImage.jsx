import { useState, useEffect, useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import api from '../api/axios';

/**
 * Category-specific curated Unsplash fallback URLs (no API key needed).
 * Used as the last resort when both Unsplash API and Google Places fail.
 */
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

/** Simple hash for deterministic fallback selection */
const hashStr = (str) => {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
};

/** Get a category-specific fallback URL */
const getFallback = (category, activity, index) => {
  const cat = (category || 'attraction').toLowerCase();
  const pool = CATEGORY_FALLBACKS[cat] || CATEGORY_FALLBACKS.attraction;
  return pool[(hashStr(activity) + (index || 0)) % pool.length];
};

/**
 * ActivityImage — premium, category-aware image component for itinerary cards.
 *
 * Features:
 * - Smart backend query with activity + city + category + time context
 * - Per-trip duplicate prevention via tripId
 * - Animated skeleton loader during fetch
 * - Smooth fade-in on load
 * - Hover zoom effect
 * - Category-specific curated fallbacks
 * - Native lazy loading
 */
const ActivityImage = ({
  activity = '',
  city = '',
  country = '',
  category = 'attraction',
  time = '',
  tripId = '',
  index = 0,
  location = '',
  transportMode = '',
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef(null);

  const fallbackUrl = getFallback(category, activity, index);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      setIsLoading(true);
      setIsImageLoaded(false);

      try {
        // Build query params for the new smart endpoint
        const params = new URLSearchParams({
          activity,
          city,
          category: category || 'attraction',
          index: String(index),
        });
        if (country) params.set('country', country);
        if (time) params.set('time', time);
        if (tripId) params.set('tripId', tripId);
        if (location) params.set('location', location);
        if (transportMode) params.set('transportMode', transportMode);

        const response = await api.get(`/activity-image?${params.toString()}`);

        if (isMounted && response.data?.imageUrl) {
          setImageUrl(response.data.imageUrl);
        } else if (isMounted) {
          setImageUrl(fallbackUrl);
        }
      } catch (error) {
        // Fallback: try legacy place-image endpoint
        try {
          const legacyQuery = [activity, city].filter(Boolean).join(', ');
          const legacyRes = await api.get(`/place-image?query=${encodeURIComponent(legacyQuery)}&index=${index}`);
          if (isMounted && legacyRes.data?.imageUrl) {
            setImageUrl(legacyRes.data.imageUrl);
          } else if (isMounted) {
            setImageUrl(fallbackUrl);
          }
        } catch {
          if (isMounted) setImageUrl(fallbackUrl);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchImage();
    return () => { isMounted = false; };
  }, [activity, city, country, category, time, tripId, index, location, transportMode, fallbackUrl]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = (e) => {
    if (e.target.src !== fallbackUrl) {
      e.target.src = fallbackUrl;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {/* Animated Skeleton Loader */}
      {(isLoading || !isImageLoaded) && (
        <div className="absolute inset-0 z-10">
          <div className="w-full h-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaImage className="text-slate-300 text-3xl animate-pulse" />
          </div>
        </div>
      )}

      {/* Actual Image */}
      {imageUrl && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={activity || city || 'Travel'}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{ willChange: 'opacity, transform' }}
        />
      )}
    </div>
  );
};

export default ActivityImage;
