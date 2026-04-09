import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ItineraryCard from '../components/ItineraryCard';
import WeatherCard from '../components/WeatherCard';
import BudgetBreakdown from '../components/BudgetBreakdown';
import TripMap from '../components/TripMap';
import AnimatedLoader from '../components/AnimatedLoader';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { exportToPDF } from '../utils/pdfExport';
import { FaSave, FaCheck, FaExclamationTriangle, FaShareAlt, FaMap, FaListUl, FaFilePdf } from 'react-icons/fa';

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
  const [activeView, setActiveView] = useState('itinerary'); // 'itinerary' | 'map'
  const [isExporting, setIsExporting] = useState(false);

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
          const { from, destination, days, budget, travelType, interests } = location.state.query;
          const response = await api.post('/trips/generate', { from, destination, days, budget, travelType, interests });
          if (isMounted) {
            setTripData(response.data);
            toast.success('Itinerary generated successfully!');
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || 'Failed to generate itinerary. Please try again.');
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
        
        const shareUrl = `${window.location.origin}/trip/${response.data._id}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Trip saved and link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to save and share trip');
      } finally {
        setIsSaving(false);
      }
    } else {
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

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const filename = `${tripData.destination || 'trip'}-itinerary.pdf`.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
      await exportToPDF('pdf-export-area', filename);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {isLoading ? (
          <AnimatedLoader />
        ) : tripData ? (
          <>
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {tripData.days} Days • {tripData.budget}
                  </span>
                  {tripData.travelType && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {tripData.travelType}
                    </span>
                  )}
                  {tripData.itinerary?.totalEstimatedCost && (
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                      {tripData.itinerary.totalEstimatedCost}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  Trip {tripData.from ? <span className="text-primary-600">from {tripData.from} </span> : ''}
                  to <span className="text-primary-600">{tripData.destination}</span>
                </h1>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {/* PDF Export */}
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold transition-all shadow-sm bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-600 active:scale-95 disabled:opacity-50"
                >
                  {isExporting ? (
                    <div className="h-4 w-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <FaFilePdf />
                  )}
                  PDF
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShareTrip}
                  disabled={isSaving}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold transition-all shadow-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-primary-600 active:scale-95"
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
            </motion.div>

            {/* PDF Export Container */}
            <div id="pdf-export-area">
              {/* Travel Tips Banner */}
              {tripData.itinerary?.travelTips && tripData.itinerary.travelTips.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4"
                >
                  <FaExclamationTriangle className="text-amber-500 h-6 w-6 shrink-0" />
                  <div>
                    <h3 className="font-bold text-amber-800 mb-2">Essential Travel Tips</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
                      {tripData.itinerary.travelTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Budget Breakdown */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <BudgetBreakdown itinerary={tripData.itinerary} totalDays={tripData.days} />
              </motion.div>

              {/* Weather Forecast */}
              {tripData.weather && tripData.weather.forecast && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <WeatherCard forecast={tripData.weather.forecast} />
                </motion.div>
              )}

              {/* View Toggle Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8 mt-4">
                <button
                  onClick={() => setActiveView('itinerary')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeView === 'itinerary'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FaListUl className="h-3.5 w-3.5" /> Itinerary
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeView === 'map'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FaMap className="h-3.5 w-3.5" /> Map View
                </button>
              </div>

              {/* Itinerary or Map */}
              {activeView === 'itinerary' ? (
                tripData.itinerary?.days && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Your Itinerary</h2>
                    {tripData.itinerary.days.map((day) => (
                      <ItineraryCard 
                        key={day.day} 
                        day={day} 
                        destination={tripData.destination}
                        totalDays={tripData.itinerary.totalDays || tripData.days}
                      />
                    ))}
                  </motion.div>
                )
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <TripMap 
                    itinerary={tripData.itinerary} 
                    coordinates={tripData.coordinates}
                  />
                </motion.div>
              )}
            </div>
          </>
        ) : null}
        
      </div>
    </div>
  );
};

export default Results;
