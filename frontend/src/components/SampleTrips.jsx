import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';

const sampleTrips = [
  {
    id: 1,
    city: 'Kathmandu',
    country: 'Nepal',
    days: 5,
    travelType: 'Solo',
    budget: 'Luxury',
    cost: '$1,200',
    color: 'from-orange-400 to-red-600',
    coverImage: '/images/kathmandu.png',
    itinerary: [
      {
        day: 1,
        theme: 'Arrival & Royal Heritage',
        stops: [
          { time: '10:00 AM', title: 'Check in at Dwarika\'s Hotel', desc: 'Settle into your premium heritage suite.' },
          { time: '01:00 PM', title: 'Kathmandu Durbar Square', desc: 'Explore the ancient royal palace complex and temples.' },
          { time: '06:00 PM', title: 'Dinner at Krishnarpan', desc: 'Experience a traditional luxury Newari feast.' }
        ]
      },
      {
        day: 2,
        theme: 'Spiritual Awakening',
        stops: [
          { time: '09:00 AM', title: 'Swayambhunath Stupa', desc: 'Climb the steps to the Monkey Temple for city views.' },
          { time: '01:00 PM', title: 'Patan Durbar Square', desc: 'Discover fine arts and architecture in the city of beauty.' },
          { time: '05:00 PM', title: 'Pashupatinath Aarti', desc: 'Witness the mesmerizing evening river ritual.' }
        ]
      },
      {
        day: 3,
        theme: 'Himalayan Sunrise',
        stops: [
          { time: '05:30 AM', title: 'Helicopter to Everest Base Camp', desc: 'An exclusive champagne breakfast at the top of the world.' },
          { time: '02:00 PM', title: 'Spa & Wellness', desc: 'Relax with a deep tissue Himalayan massage.' },
          { time: '07:00 PM', title: 'Boudhanath Stupa Walk', desc: 'Evening kora around the illuminated giant stupa.' }
        ]
      },
      {
        day: 4,
        theme: 'Art & Culture',
        stops: [
          { time: '10:00 AM', title: 'Bhaktapur Ancient City', desc: 'Stroll through timeless brick streets and pottery squares.' },
          { time: '01:30 PM', title: 'Lunch at Juju Dhau', desc: 'Taste the famous "King of Yogurt".' },
          { time: '04:00 PM', title: 'Thangka Painting Class', desc: 'Private workshop with a master artisan.' }
        ]
      },
      {
        day: 5,
        theme: 'Departure',
        stops: [
          { time: '09:00 AM', title: 'Garden of Dreams', desc: 'Morning coffee in a neo-classical historical garden.' },
          { time: '12:00 PM', title: 'Thamel Shopping', desc: 'Pick up pashminas and luxury crafts.' },
          { time: '03:00 PM', title: 'Airport Transfer', desc: 'Private chauffeur back to TIA.' }
        ]
      }
    ]
  },
  {
    id: 2,
    city: 'Manali',
    country: 'India',
    days: 3,
    travelType: 'Couple',
    budget: 'Budget',
    cost: '$150',
    color: 'from-emerald-400 to-teal-600',
    coverImage: '/images/manali.png',
    itinerary: [
      {
        day: 1,
        theme: 'Old Manali Charm',
        stops: [
          { time: '11:00 AM', title: 'Hadimba Temple', desc: 'Visit the peaceful wooden temple amidst the cedar forest.' },
          { time: '02:00 PM', title: 'Cafe Hopping', desc: 'Enjoy cheap eats and live music in Old Manali.' },
          { time: '06:00 PM', title: 'Mall Road Stroll', desc: 'Evening walk and local street food.' }
        ]
      },
      {
        day: 2,
        theme: 'Snow & Adventure',
        stops: [
          { time: '08:00 AM', title: 'Solang Valley', desc: 'Budget-friendly snow activities and paragliding.' },
          { time: '01:00 PM', title: 'Maggi Point', desc: 'Classic hot noodles overlooking the mountains.' },
          { time: '04:00 PM', title: 'Vashisht Hot Springs', desc: 'Relax in the natural public hot water baths.' }
        ]
      },
      {
        day: 3,
        theme: 'Riverside Romance',
        stops: [
          { time: '09:00 AM', title: 'Jogini Waterfall Trek', desc: 'A scenic, free hike to a stunning waterfall.' },
          { time: '01:00 PM', title: 'Picnic by Beas River', desc: 'Pack lunch and sit by the rushing river waters.' },
          { time: '04:00 PM', title: 'Departure Bus', desc: 'Catch the Volvo bus back down the mountains.' }
        ]
      }
    ]
  },
  {
    id: 3,
    city: 'Tokyo',
    country: 'Japan',
    days: 4,
    travelType: 'Friends',
    budget: 'Moderate',
    cost: '$850',
    color: 'from-fuchsia-500 to-purple-700',
    coverImage: '/images/tokyo.png',
    itinerary: [
      {
        day: 1,
        theme: 'Neon & Culture',
        stops: [
          { time: '10:00 AM', title: 'Senso-ji Temple', desc: 'Explore Asakusa and grab traditional snacks.' },
          { time: '02:00 PM', title: 'Akihabara', desc: 'Arcades, anime, and electronics with the group.' },
          { time: '07:00 PM', title: 'Shinjuku Omoide Yokocho', desc: 'Dinner and drinks in the famous alleyway.' }
        ]
      },
      {
        day: 2,
        theme: 'Pop Culture & Views',
        stops: [
          { time: '11:00 AM', title: 'Harajuku Takeshita Street', desc: 'Crepes, fashion, and people watching.' },
          { time: '03:00 PM', title: 'Shibuya Crossing', desc: 'Experience the world\'s busiest pedestrian intersection.' },
          { time: '08:00 PM', title: 'Shibuya Sky', desc: 'Stunning night views of the entire metropolis.' }
        ]
      },
      {
        day: 3,
        theme: 'Food & History',
        stops: [
          { time: '09:00 AM', title: 'Tsukiji Outer Market', desc: 'Fresh sushi breakfast and seafood street eats.' },
          { time: '01:00 PM', title: 'Meiji Shrine', desc: 'A peaceful walk through the massive forested shrine.' },
          { time: '06:00 PM', title: 'Roppongi Izakaya', desc: 'Endless plates and drinks at a local pub.' }
        ]
      },
      {
        day: 4,
        theme: 'Bay Area Fun',
        stops: [
          { time: '10:00 AM', title: 'TeamLab Planets', desc: 'Immersive interactive digital art museum.' },
          { time: '01:30 PM', title: 'Odaiba Seaside Park', desc: 'Views of the Rainbow Bridge and Statue of Liberty.' },
          { time: '05:00 PM', title: 'Haneda Airport', desc: 'Last minute souvenir shopping and departure.' }
        ]
      }
    ]
  }
];

const SampleTrips = () => {
  const [expandedId, setExpandedId] = useState(null);
  const containerRef = useRef(null);

  const handleToggle = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Wait for layout to shift then scroll down slightly
      setTimeout(() => {
        const topOffset = containerRef.current?.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: topOffset - 100, behavior: 'smooth' });
      }, 150);
    }
  };

  const handleUseTemplate = (trip) => {
    const event = new CustomEvent('fill-trip-form', {
      detail: {
        destination: `${trip.city}, ${trip.country}`,
        days: trip.days,
        budget: trip.budget,
        travelType: trip.travelType
      }
    });
    window.dispatchEvent(event);
  };

  const expandedTrip = sampleTrips.find(t => t.id === expandedId);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Popular itineraries &mdash; click to explore</h2>
        <p className="text-slate-500">Not sure where to start? Check out these community favorites.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sampleTrips.map((trip) => {
          const isExpanded = expandedId === trip.id;
          const totalStops = trip.itinerary.reduce((sum, day) => sum + day.stops.length, 0);

          return (
            <motion.div
              layout
              key={trip.id}
              onClick={() => handleToggle(trip.id)}
              className={`bg-white rounded-2xl border ${isExpanded ? 'border-primary-500 ring-2 ring-primary-100 shadow-xl' : 'border-slate-200 shadow-sm'} overflow-hidden cursor-pointer transition-all hover:shadow-md h-full flex flex-col`}
            >
              {/* Cover Image area */}
              <div className="h-32 relative overflow-hidden">
                <img src={trip.coverImage} alt={trip.city} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-white/80 text-lg" />
                    {trip.city}, {trip.country}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex-grow">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                    <FaCalendarAlt className="text-primary-500" /> {trip.days} Days
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                    <FaUser className="text-secondary-500" /> {trip.travelType}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                    <FaMoneyBillWave className="text-emerald-500" /> {trip.budget}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                  <span>{totalStops} planned stops</span>
                  <span className="font-semibold text-slate-700">Est. {trip.cost}</span>
                </div>
                
                <div className="w-full flex justify-center mt-4">
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className={`text-slate-400 ${isExpanded ? 'text-primary-500' : ''}`} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {expandedTrip && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl border border-primary-100 shadow-2xl p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-100 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{expandedTrip.city} Itinerary</h3>
                  <p className="text-slate-500">{expandedTrip.days} Days &bull; {expandedTrip.travelType} &bull; {expandedTrip.budget}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Est. Total Cost</p>
                    <p className="text-2xl font-bold text-slate-900">{expandedTrip.cost}</p>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(expandedTrip)}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm shadow-primary-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 relative z-10"
                  >
                    Use this template
                  </button>
                </div>
              </div>

              <div className="space-y-12 relative z-10">
                {expandedTrip.itinerary.map((dayData, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center font-bold text-lg border border-primary-100 shadow-sm">
                        D{dayData.day}
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">{dayData.theme}</h4>
                    </div>

                    <div className="ml-6 pl-8 border-l-2 border-slate-100 space-y-8">
                      {dayData.stops.map((stop, sIndex) => (
                        <div key={sIndex} className="relative">
                          <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-white border-2 border-primary-400 rounded-full"></div>
                          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block mb-2">{stop.time}</span>
                          <h5 className="font-bold text-slate-800 text-lg mb-1">{stop.title}</h5>
                          <p className="text-slate-500">{stop.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SampleTrips;
