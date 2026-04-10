import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTrash, FaMapMarkedAlt, FaCalendarAlt, FaExternalLinkAlt, FaCopy, FaSearch, FaPlus, FaPlaneDeparture, FaArrowRight, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [duplicatingId, setDuplicatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data } = await api.get('/trips');
      setTrips(data);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter(t => t._id !== id));
      toast.success('Trip deleted');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const handleDuplicate = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setDuplicatingId(id);
    try {
      const { data } = await api.post(`/trips/duplicate/${id}`);
      setTrips([data, ...trips]);
      toast.success('Trip duplicated with a fresh itinerary!');
    } catch (error) {
      toast.error('Failed to duplicate trip');
    } finally {
      setDuplicatingId(null);
    }
  };

  const openTrip = (trip) => {
    navigate('/results', { state: { tripData: trip } });
  };

  const filteredTrips = trips.filter(trip => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      trip.destination?.toLowerCase().includes(q) ||
      trip.from?.toLowerCase().includes(q) ||
      trip.budget?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Trips</h1>
            <p className="text-slate-500 mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            <FaPlus className="h-3.5 w-3.5" /> Plan New Trip
          </button>
        </div>

        {/* Search Bar */}
        {trips.length > 0 && (
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by destination, origin, or budget..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>
        )}
        
        {trips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
          >
            <div className="bg-primary-50 h-24 w-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaMapMarkedAlt className="h-12 w-12 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No trips planned yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Start planning your next adventure using our AI assistant. It only takes seconds!</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              ✨ Plan your first trip
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
                <motion.div 
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => openTrip(trip)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary-200 transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Cover gradient header */}
                  <div className="h-32 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white truncate drop-shadow-sm">
                        {trip.destination}
                      </h3>
                      {trip.from && (
                        <div className="flex items-center gap-1.5 text-white/80 text-sm font-medium mt-1">
                          <FaPlaneDeparture className="h-3 w-3" />
                          <span className="truncate">{trip.from}</span>
                          <FaArrowRight className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{trip.destination}</span>
                        </div>
                      )}
                    </div>
                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                      <button 
                        onClick={(e) => handleDuplicate(e, trip._id)}
                        disabled={duplicatingId === trip._id}
                        className="h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-primary-600 hover:bg-white shadow-sm transition-all disabled:opacity-50"
                        title="Duplicate trip"
                      >
                        {duplicatingId === trip._id ? (
                          <div className="h-3.5 w-3.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaCopy className="h-3 w-3" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, trip._id)}
                        className="h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-all"
                        title="Delete trip"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <FaCalendarAlt className="text-slate-400 h-3 w-3" />
                        {trip.days} Days
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <FaMoneyBillWave className="h-3 w-3" />
                        {trip.budget}
                      </span>
                      {trip.travelType && (
                        <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          {trip.travelType}
                        </span>
                      )}
                    </div>

                    {/* Interests chips */}
                    {trip.interests && trip.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {trip.interests.slice(0, 3).map(interest => (
                          <span key={interest} className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md text-xs font-medium">
                            {interest}
                          </span>
                        ))}
                        {trip.interests.length > 3 && (
                          <span className="text-xs text-slate-400 font-medium">+{trip.interests.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-primary-600 font-semibold text-sm flex items-center gap-1 group-hover:underline">
                        View <FaExternalLinkAlt className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No search results */}
        {trips.length > 0 && filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No trips matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
