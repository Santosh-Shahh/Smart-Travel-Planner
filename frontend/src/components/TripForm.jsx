import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TripForm = () => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3');
  const [budget, setBudget] = useState('Moderate');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    setIsLoading(true);
    
    // Using toast.promise for excellent UX during generation
    toast.promise(
      api.post('/trips/generate', { destination, days, budget }),
      {
        loading: 'AI is crafting your perfect itinerary (this takes 10-20s)...',
        success: (response) => {
          // Navigate to results page passing the generated data via location state
          navigate('/results', { state: { tripData: response.data } });
          return 'Itinerary generated successfully!';
        },
        error: 'Failed to generate itinerary. Please try again.',
      }
    ).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        {/* Destination */}
        <div className="w-full md:flex-[2]">
          <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Where to?</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-slate-400" />
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Kyoto, Japan"
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>
        </div>

        {/* Days */}
        <div className="w-full md:flex-[1]">
          <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Duration</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-slate-400" />
            </div>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none appearance-none cursor-pointer text-slate-700 font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(d => (
                <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="w-full md:flex-[1]">
          <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Budget</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaMoneyBillWave className="text-slate-400" />
            </div>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none appearance-none cursor-pointer text-slate-700 font-medium"
            >
              <option value="Budget-friendly">Budget</option>
              <option value="Moderate">Moderate</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="w-full md:flex-[1]">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
          >
            <span className={`transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              Plan My Trip
            </span>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TripForm;
