import { useState, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';
import api from '../api/axios';

// Clean, aesthetic fallback images related to travel
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', // Airplane
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', // Boat on lake
  'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=800&q=80', // Compass / Vintage travel
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80', // Mountains reflection
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80', // Map and passport
];

// Helper to reliably hash a string to the same integer
const getStringHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const PlaceImage = ({ locationName, imageIndex = 0 }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Stable fallback for this specific component instance mixed with imageIndex 
  const stableFallback = FALLBACK_IMAGES[(getStringHash(locationName || 'unknown') + imageIndex) % FALLBACK_IMAGES.length];

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      if (!locationName) {
        if (isMounted) {
          setImageUrl(stableFallback);
          setIsLoading(false);
        }
        return;
      }
      
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await api.get(`/place-image?query=${encodeURIComponent(locationName)}&index=${imageIndex}`);
        
        if (isMounted && response.data?.imageUrl) {
          setImageUrl(response.data.imageUrl);
        } else if (isMounted) {
          setHasError(true);
          setImageUrl(stableFallback);
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setImageUrl(stableFallback);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchImage();
    
    return () => {
      isMounted = false;
    };
  }, [locationName, stableFallback, imageIndex]);

  if (isLoading) {
    return (
      <div className="w-full h-48 bg-slate-100 animate-pulse rounded-xl mb-4 flex items-center justify-center">
        <FaImage className="text-slate-300 text-3xl" />
      </div>
    );
  }

  if (!imageUrl) return null; 

  return (
    <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl bg-slate-100 group/img">
      <img 
        src={imageUrl} 
        alt={locationName} 
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        loading="lazy"
        onError={(e) => {
          if (e.target.src !== stableFallback) {
            e.target.src = stableFallback;
          }
        }}
      />
    </div>
  );
};

export default PlaceImage;
