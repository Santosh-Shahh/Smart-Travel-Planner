import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaLocationArrow, FaPlaneDeparture, FaUser, FaUsers, FaHeart, FaChild, FaUtensils, FaMountain, FaLandmark, FaGlassMartini, FaLeaf, FaShoppingBag } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TRAVEL_TYPES = [
  { value: 'Solo', icon: FaUser, label: 'Solo' },
  { value: 'Couple', icon: FaHeart, label: 'Couple' },
  { value: 'Friends', icon: FaUsers, label: 'Friends' },
  { value: 'Family', icon: FaChild, label: 'Family' },
];

const INTERESTS = [
  { value: 'Food', icon: FaUtensils, label: 'Food' },
  { value: 'Adventure', icon: FaMountain, label: 'Adventure' },
  { value: 'History', icon: FaLandmark, label: 'History' },
  { value: 'Nightlife', icon: FaGlassMartini, label: 'Nightlife' },
  { value: 'Nature', icon: FaLeaf, label: 'Nature' },
  { value: 'Shopping', icon: FaShoppingBag, label: 'Shopping' },
];

const TripForm = () => {
  const [from, setFrom] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3');
  const [budget, setBudget] = useState('Moderate');
  const [travelType, setTravelType] = useState('');
  const [interests, setInterests] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  
  // Shared autocomplete state
  const [activeField, setActiveField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const formRef = useRef(null);

  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Central debounced fetcher
  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const query = activeField === 'from' ? from : destination;

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&osm_tag=place:city&osm_tag=place:town&limit=5&lang=en`, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        const data = await res.json();
        
        if (data && data.features && data.features.length > 0) {
          const formattedSuggestions = data.features.map(f => {
            const prop = f.properties;
            let city = prop.name;
            let state = prop.state || prop.county;
            let country = prop.country;
            return [city, state, country].filter(Boolean).join(', ');
          });
          // Remove duplicates
          setSuggestions([...new Set(formattedSuggestions)]);
          setHighlightedIndex(-1);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceId = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(debounceId);
  }, [from, destination, activeField]);

  const handleKeyDown = (e) => {
    if (!activeField || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setActiveField(null);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (activeField === 'from') {
      setFrom(suggestion);
    } else if (activeField === 'destination') {
      setDestination(suggestion);
    }
    setActiveField(null);
    setSuggestions([]);
  };

  const renderHighlightedText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="font-bold text-primary-600">{part}</span> : part
        )}
      </span>
    );
  };

  const handleGeolocate = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
        const data = await res.json();
        
        let city = data.address.city || data.address.town || data.address.village || data.address.state_district || '';
        let country = data.address.country || '';
        
        const locString = [city, country].filter(Boolean).join(', ');
        if (locString) {
          setFrom(locString);
          toast.success('Location detected!');
        } else {
          toast.error('Could not precisely determine city');
        }
      } catch (err) {
        toast.error('Failed to get location details');
      } finally {
        setIsLocating(false);
      }
    }, () => {
      toast.error('Location permission denied');
      setIsLocating(false);
    });
  };

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }
    
    setActiveField(null);
    navigate('/results', { 
      state: { 
        query: { from, destination, days, budget, travelType: travelType || null, interests } 
      } 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-5">
        {/* ROW 1: From & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">From 📍 <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaPlaneDeparture className="text-slate-400" />
              </div>
              <input
                type="text"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setActiveField('from');
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setActiveField('from')}
                placeholder="e.g., Kathmandu, Nepal"
                autoComplete="off"
                className="w-full pl-11 pr-12 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-slate-700 font-medium placeholder:font-normal"
              />
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={isLocating}
                title="Detect my location"
                aria-label="Detect my location automatically"
                className="absolute inset-y-0 right-2 flex items-center justify-center p-2 my-auto h-10 w-10 text-primary-500 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {isLocating ? (
                   <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                   <FaLocationArrow />
                )}
              </button>
              {activeField === 'from' && isSearching && (
                <div className="absolute inset-y-0 right-12 pr-2 flex items-center pointer-events-none text-primary-500">
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <AnimatePresence>
                {activeField === 'from' && (isSearching || suggestions.length > 0 || (from.trim().length >= 2 && !isSearching && suggestions.length === 0)) && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl overflow-hidden py-2"
                    style={{ border: '0.5px solid #e2e8f0' }}
                  >
                    {isSearching ? (
                      <li className="px-4 py-3 flex items-center gap-3 text-slate-400">
                        <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Searching...</span>
                      </li>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                            highlightedIndex === index ? 'bg-primary-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <FaPlaneDeparture className={`text-sm flex-shrink-0 ${highlightedIndex === index ? 'text-primary-500' : 'text-slate-400'}`} />
                          <span className="text-slate-700 text-sm font-medium truncate">
                            {renderHighlightedText(suggestion, from)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-slate-400 text-sm">No matching places found</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Destination */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Where to?</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-slate-400" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setActiveField('destination');
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setActiveField('destination')}
                placeholder="e.g. Kyoto, Japan"
                autoComplete="off"
                className="w-full pl-11 pr-10 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-slate-700 font-medium placeholder:font-normal"
              />
              {activeField === 'destination' && isSearching && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-primary-500">
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <AnimatePresence>
                {activeField === 'destination' && (isSearching || suggestions.length > 0 || (destination.trim().length >= 2 && !isSearching && suggestions.length === 0)) && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl overflow-hidden py-2"
                    style={{ border: '0.5px solid #e2e8f0' }}
                  >
                    {isSearching ? (
                      <li className="px-4 py-3 flex items-center gap-3 text-slate-400">
                        <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Searching...</span>
                      </li>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                            highlightedIndex === index ? 'bg-primary-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <FaMapMarkerAlt className={`text-sm flex-shrink-0 ${highlightedIndex === index ? 'text-primary-500' : 'text-slate-400'}`} />
                          <span className="text-slate-700 text-sm font-medium truncate">
                            {renderHighlightedText(suggestion, destination)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-slate-400 text-sm">No matching places found</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ROW 2: Duration, Budget, Submit */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="w-full md:col-span-2">
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

          <div className="w-full md:col-span-2">
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

          <div className="w-full md:col-span-2">
            <button
              type="submit"
              disabled={!destination.trim()}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/30 transition-all disabled:opacity-50 disabled:bg-slate-400 disabled:bg-none disabled:shadow-none disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
            >
              <span className="relative z-10">Plan My Trip</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-secondary-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* ROW 3: Travel Type Pills */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">Who's traveling?</label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_TYPES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTravelType(prev => prev === value ? '' : value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  travelType === value
                    ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 4: Interest Chips */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">What are you into?</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleInterest(value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  interests.includes(value)
                    ? 'bg-secondary-50 border-secondary-300 text-secondary-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default TripForm;
