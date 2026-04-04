import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ItineraryCard from '../components/ItineraryCard';
import WeatherCard from '../components/WeatherCard';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaSave, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tripData = location.state?.tripData;
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // If directly navigated to /results without data, redirect to home
  if (!tripData) {
    return <Navigate to="/" />;
  }

  const { itinerary, weather } = tripData;

  const handleSaveTrip = async () => {
    if (!user) {
      toast.error('Please log in to save trips');
      navigate('/login');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/trips/save', tripData);
      setIsSaved(true);
      toast.success('Trip saved successfully!');
    } catch (error) {
      toast.error('Failed to save trip');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-3">
              {tripData.days} Days • {tripData.budget}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Trip to <span className="text-primary-600">{tripData.destination}</span>
            </h1>
          </div>
          
          <button
            onClick={handleSaveTrip}
            disabled={isSaving || isSaved}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
              isSaved 
                ? 'bg-green-100 text-green-700 cursor-default' 
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20'
            }`}
          >
            {isSaved ? (
              <><FaCheck /> Saved to Dashboard</>
            ) : isSaving ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><FaSave /> Save Trip</>
            )}
          </button>
        </div>

        {/* Travel Tips Banner */}
        {itinerary.travelTips && itinerary.travelTips.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4">
            <FaExclamationTriangle className="text-amber-500 h-6 w-6 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800 mb-2">Essential Travel Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
                {itinerary.travelTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Weather Forecast */}
        {weather && weather.forecast && (
          <WeatherCard forecast={weather.forecast} />
        )}

        {/* Itinerary */}
        <div className="mt-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Your Itinerary</h2>
          {itinerary.days && itinerary.days.map((day) => (
            <ItineraryCard key={day.day} day={day} />
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default Results;
