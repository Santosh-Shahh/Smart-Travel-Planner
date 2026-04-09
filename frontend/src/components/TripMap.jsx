import { useMemo } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';

const mapContainerStyle = { width: '100%', height: '500px', borderRadius: '1.5rem' };
const defaultCenter = { lat: 28.6139, lng: 77.209 };

const ACTIVITY_COLORS = {
  attraction: '#3b82f6',
  food: '#f59e0b',
  transport: '#10b981',
  stay: '#6366f1',
  nature: '#22c55e',
  shopping: '#ec4899',
  nightlife: '#8b5cf6',
  default: '#64748b',
};

const TripMap = ({ itinerary, coordinates }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Extract all locations from itinerary days
  const markers = useMemo(() => {
    if (!itinerary?.days) return [];

    const allMarkers = [];
    itinerary.days.forEach((day) => {
      day.activities.forEach((activity, actIdx) => {
        if (activity.location) {
          allMarkers.push({
            id: `${day.day}-${actIdx}`,
            day: day.day,
            position: null, // We'll use geocoded positions or fallback
            label: `${allMarkers.length + 1}`,
            activity: activity.activity,
            time: activity.time,
            cost: activity.estimatedCost,
            location: activity.location,
            type: activity.type || 'default',
          });
        }
      });
    });
    return allMarkers;
  }, [itinerary]);

  // Build path coordinates from itinerary places data
  const pathCoords = useMemo(() => {
    if (!itinerary?.days) return [];
    // For polyline, we need actual lat/lng — use places data if available
    return [];
  }, [itinerary]);

  if (loadError) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 text-center">
        <p className="text-slate-500">Unable to load Google Maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
        <div className="h-[500px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
          <p className="text-slate-400">Loading map…</p>
        </div>
      </div>
    );
  }

  const center = coordinates
    ? { lat: coordinates.lat, lng: coordinates.lng }
    : defaultCenter;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-8 overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#c8e6ff' }] },
          ],
        }}
      >
        {/* Destination center marker */}
        <Marker
          position={center}
          icon={{
            path: 'M12 0C7 0 3 4 3 9c0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9z',
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: 1.8,
            anchor: { x: 12, y: 24 },
          }}
          title={itinerary?.destination || 'Destination'}
        />

        {/* If we had geocoded activity positions we'd render numbered markers here */}
        {/* For now, show the destination as the primary pin */}

        {pathCoords.length > 1 && (
          <Polyline
            path={pathCoords}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.7,
              strokeWeight: 3,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Activity legend */}
      <div className="mt-4 px-2">
        <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Activity Locations</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {markers.map((marker, idx) => (
            <a
              key={marker.id}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors text-sm group"
            >
              <span
                className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: ACTIVITY_COLORS[marker.type] || ACTIVITY_COLORS.default }}
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">{marker.activity}</p>
                <p className="text-xs text-slate-400 truncate">{marker.time} · Day {marker.day}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripMap;
