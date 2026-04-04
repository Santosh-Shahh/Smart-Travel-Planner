import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTrash, FaMapMarkedAlt, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
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
    e.stopPropagation(); // prevent navigation
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter(t => t._id !== id));
      toast.success('Trip deleted');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const openTrip = (trip) => {
    navigate('/results', { state: { tripData: trip } });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Trips</h1>
        
        {trips.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <FaMapMarkedAlt className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No trips planned yet</h3>
            <p className="text-slate-500 mb-6">Start planning your next adventure using our AI assistant.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              Plan a new trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div 
                key={trip._id}
                onClick={() => openTrip(trip)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary-200 transition-all cursor-pointer overflow-hidden group"
              >
                <div className="p-6 relative">
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, trip._id)}
                      className="h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                    <FaMapMarkedAlt className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {trip.destination}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3 mt-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-md">
                      <FaCalendarAlt className="text-slate-400" />
                      {trip.days} Days
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md">
                      {trip.budget}
                    </span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-primary-600 font-medium text-sm group-hover:underline">
                    View full itinerary <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
