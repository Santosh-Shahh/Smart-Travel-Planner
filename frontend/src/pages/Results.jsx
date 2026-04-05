import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ItineraryCard from '../components/ItineraryCard';
import WeatherCard from '../components/WeatherCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaSave, FaCheck, FaExclamationTriangle, FaShareAlt } from 'react-icons/fa';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [tripData, setTripData] = useState(location.state?.tripData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTrip = async () => {
      // If we already have the tripData passed via state routing (from history), use it
      if (tripData && !id) {
        if (tripData._id) {
          setIsSaved(true);
          setSavedTripId(tripData._id);
        }
        return;
      }

      setIsLoading(true);
      try {
        if (id) {
          // It's a shared link or direct ID link
          const response = await api.get(`/trips/shared/${id}`);
          if (isMounted) {
            setTripData(response.data);
            setIsSaved(true);
            setSavedTripId(response.data._id);
          }
        } else if (location.state?.query) {
          // Generative fetch initiated from TripForm
          const { from, destination, days, budget } = location.state.query;
          const response = await api.post('/trips/generate', { from, destination, days, budget });
          if (isMounted) {
            setTripData(response.data);
            toast.success('Itinerary generated successfully!');
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || 'Failed to fetch trip data');
          // Navigate to home after 2 seconds if error
          setTimeout(() => navigate('/'), 2000);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTrip();

    return () => {
      isMounted = false;
    };
  }, [id, location.state, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // If directly navigated without ID or state, redirect
  if (!id && !location.state && !isLoading && !tripData) {
    return <Navigate to="/" />;
  }

  const handleSaveTrip = async () => {
    if (!user) {
      toast.error('Please log in to save trips');
      navigate('/login');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post('/trips/save', tripData);
      setIsSaved(true);
      setSavedTripId(response.data._id);
      toast.success('Trip saved successfully!');
    } catch (error) {
      toast.error('Failed to save trip');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareTrip = async () => {
    // If it hasn't been saved yet, we need to save it to get an ID to share
    if (!isSaved) {
      if (!user) {
        toast.error('Please log in to securely save and share this trip!');
        return;
      }
      setIsSaving(true);
      try {
        const response = await api.post('/trips/save', tripData);
        setIsSaved(true);
        setSavedTripId(response.data._id);
        
        // Use new ID for sharing
        const shareUrl = `${window.location.origin}/trip/${response.data._id}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Trip saved and link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to save and share trip');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Already saved, copy the link
      const idToShare = savedTripId || tripData._id || id;
      const shareUrl = `${window.location.origin}/trip/${idToShare}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard! Ready to share.');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {isLoading ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="h-6 w-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Crafting your perfect itinerary...
            </h2>
            <LoadingSkeleton />
          </div>
        ) : tripData ? (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
              <div>
                <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-3">
                  {tripData.days} Days • {tripData.budget}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  Trip {tripData.from ? <span className="text-primary-600">from {tripData.from} </span> : ''}
                  to <span className="text-primary-600">{tripData.destination}</span>
                </h1>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                {/* Share Button */}
                <button
                  onClick={handleShareTrip}
                  disabled={isSaving}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-primary-600 active:scale-95"
                >
                  <FaShareAlt /> Share
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSaveTrip}
                  disabled={isSaving || isSaved}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                    isSaved 
                      ? 'bg-green-100 text-green-700 cursor-default' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20'
                  }`}
                >
                  {isSaved ? (
                    <><FaCheck /> Saved</>
                  ) : isSaving ? (
                    <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><FaSave /> Save</>
                  )}
                </button>
              </div>
            </div>

            {/* Travel Tips Banner */}
            {tripData.itinerary?.travelTips && tripData.itinerary.travelTips.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4">
                <FaExclamationTriangle className="text-amber-500 h-6 w-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">Essential Travel Tips</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
                    {tripData.itinerary.travelTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Weather Forecast */}
            {tripData.weather && tripData.weather.forecast && (
              <WeatherCard forecast={tripData.weather.forecast} />
            )}

            {/* Itinerary */}
            {tripData.itinerary?.days && (
              <div className="mt-12">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Your Itinerary</h2>
                {tripData.itinerary.days.map((day) => (
                  <ItineraryCard key={day.day} day={day} destination={tripData.destination} />
                ))}
              </div>
            )}
          </>
        ) : null}
        
      </div>
    </div>
  );
};

export default Results;
