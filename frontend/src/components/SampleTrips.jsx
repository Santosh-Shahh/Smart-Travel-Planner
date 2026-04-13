import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaChevronDown, FaChevronUp, FaPlaneDeparture } from 'react-icons/fa';

const sampleTrips = [
  {
    id: 'kathmandu',
    destination: 'Kathmandu, Nepal',
    country: 'Nepal',
    days: 5,
    budget: 'Luxury',
    travelType: 'Couple',
    estCost: '$1,200',
    stops: 15,
    color: 'bg-emerald-500',
    accent: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Thamel Exploration',
        activities: [
          'Arrive at Tribhuvan International Airport; private transfer to your luxury boutique hotel.',
          'Stroll through the vibrant streets of Thamel, exploring hidden courtyards and artisan shops.',
          'Enjoy a traditional welcome dinner with cultural performances at Krishnarpan.'
        ]
      },
      {
        day: 2,
        title: 'Spiritual Heritage',
        activities: [
          'Early morning visit to Swayambhunath (Monkey Temple) for panoramic city views.',
          'Explore Kathmandu Durbar Square and witness the living goddess, Kumari.',
          'Sunset visit to Boudhanath Stupa, joining pilgrims in lighting butter lamps.'
        ]
      },
      {
        day: 3,
        title: 'Patan City of Arts',
        activities: [
          'Drive to Patan to admire the exquisite Newari architecture in Patan Durbar Square.',
          'Visit the Golden Temple and the Patan Museum.',
          'Fine dining experience at a restored palace courtyard restaurant.'
        ]
      },
      {
        day: 4,
        title: 'Bhaktapur Excursion',
        activities: [
          'Day trip to Bhaktapur, interacting with local potters directly in Pottery Square.',
          'Sample famous Juju Dhau (King Curd) while admiring the 55-Window Palace.',
          'Return to Kathmandu for a relaxing couple\'s spa treatment.'
        ]
      },
      {
        day: 5,
        title: 'Himalayan Flight & Departure',
        activities: [
          'Early morning Mount Everest scenic flight experience.',
          'Leisurely luxury brunch back at the hotel.',
          'Private transfer to the airport for luxurious departure.'
        ]
      }
    ]
  },
  {
    id: 'manali',
    destination: 'Manali, India',
    country: 'India',
    days: 3,
    budget: 'Budget',
    travelType: 'Friends',
    estCost: '$250',
    stops: 9,
    color: 'bg-blue-500',
    accent: 'text-blue-600',
    bgLight: 'bg-blue-50',
    itinerary: [
      {
        day: 1,
        title: 'Old Manali Vibes',
        activities: [
          'Check into a cozy backpacker hostel in Old Manali.',
          'Hike to the ancient Hadimba Devi Temple surrounded by cedar forests.',
          'Café hopping with friends, enjoying live music and momos in the vibrant market.'
        ]
      },
      {
        day: 2,
        title: 'Solang Valley Adventure',
        activities: [
          'Early morning bus ride up to Solang Valley.',
          'Group paragliding and zorbing down the grass slopes.',
          'Return to Mall Road for street food and souvenir shopping by the river.'
        ]
      },
      {
        day: 3,
        title: 'Vashisht Hot Springs & Trek',
        activities: [
          'Trek from Old Manali to Vashisht Village.',
          'Relieve your muscles in the natural thermal hot springs.',
          'Hike further up to the stunning Jogini Waterfall before heading home.'
        ]
      }
    ]
  },
  {
    id: 'tokyo',
    destination: 'Tokyo, Japan',
    country: 'Japan',
    days: 4,
    budget: 'Moderate',
    travelType: 'Solo',
    estCost: '$850',
    stops: 12,
    color: 'bg-purple-500',
    accent: 'text-purple-600',
    bgLight: 'bg-purple-50',
    itinerary: [
      {
        day: 1,
        title: 'Shinjuku & Shibuya',
        activities: [
          'Navigate the vibrant chaos of the Shibuya Crossing and Hachiko Statue.',
          'Explore the serene Meiji Shrine nestled quietly inside a massive urban forest.',
          'Experience the neon nightlife and micro-bars of Golden Gai in Shinjuku.'
        ]
      },
      {
        day: 2,
        title: 'Tradition & Tech',
        activities: [
          'Morning visit to Senso-ji Temple in Asakusa, browsing Nakamise shopping street.',
          'Cruise down the Sumida River to Odaiba.',
          'Explore digital art installations and futuristic architecture at teamLab.'
        ]
      },
      {
        day: 3,
        title: 'Geek Culture & Markets',
        activities: [
          'Wander through Akihabara, exploring endless anime shops and arcades.',
          'Lunch sushi run near the outer Tsukiji market.',
          'High-end window shopping and architecture admiring in Ginza.'
        ]
      },
      {
        day: 4,
        title: 'Parks & Viewpoints',
        activities: [
          'Stroll around the Imperial Palace East Gardens.',
          'Ascend the Tokyo Skytree for a breathtaking solo panorama of the metropolitan sprawl.',
          'Final ramen bowl at a famous local standing ramen shop before departure.'
        ]
      }
    ]
  }
];

const SampleTrips = () => {
  const [expandedId, setExpandedId] = useState(null);

  const handleUseTemplate = (trip) => {
    window.dispatchEvent(
      new CustomEvent('fillTripTemplate', {
        detail: {
          destination: trip.destination,
          days: trip.days,
          budget: trip.budget,
          travelType: trip.travelType
        }
      })
    );
  };

  const getExpandedTrip = () => sampleTrips.find(t => t.id === expandedId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24 relative z-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Popular itineraries &mdash; click to explore</h2>
        <p className="text-slate-500">Not sure where to start? Check out these AI-curated sample journeys.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {sampleTrips.map((trip) => {
          const isExpanded = expandedId === trip.id;
          return (
            <motion.div
              key={trip.id}
              whileHover={{ y: -5 }}
              onClick={() => setExpandedId(isExpanded ? null : trip.id)}
              className={`bg-white rounded-2xl border-[0.5px] cursor-pointer overflow-hidden transition-all duration-300 ${isExpanded ? `ring-2 ring-${trip.color.replace('bg-', '')} border-transparent` : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'}`}
            >
              <div className={`h-2 ${trip.color}`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{trip.destination.split(',')[0]}</h3>
                    <p className="text-sm text-slate-500">{trip.country}</p>
                  </div>
                  <div className={`p-2 rounded-full ${trip.bgLight} ${trip.accent}`}>
                    <FaPlaneDeparture />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">{trip.travelType}</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">{trip.budget} Budget</span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1"><FaClock /> Days</p>
                    <p className="font-semibold text-slate-700">{trip.days}</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <p className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1"><FaMapMarkerAlt /> Stops</p>
                    <p className="font-semibold text-slate-700">{trip.stops}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1"><FaMoneyBillWave /> Est.</p>
                    <p className="font-semibold text-slate-700">{trip.estCost}</p>
                  </div>
                </div>

                <div className="flex justify-center items-center pt-2 text-primary-500 text-sm font-medium">
                  {isExpanded ? (
                    <><span className="mr-2">Close Details</span><FaChevronUp /></>
                  ) : (
                    <><span className="mr-2">View Itinerary</span><FaChevronDown /></>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expandable Itinerary Panel */}
      <AnimatePresence>
        {expandedId && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{getExpandedTrip().destination}</h3>
                  <p className="text-slate-500">{getExpandedTrip().days} Days &bull; {getExpandedTrip().travelType} &bull; {getExpandedTrip().budget}</p>
                </div>
                <button
                  onClick={() => setExpandedId(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <FaChevronUp />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {getExpandedTrip().itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative">
                    <div className={`absolute top-0 left-0 w-2 h-full rounded-l-2xl ${getExpandedTrip().color}`} />
                    <h4 className="font-bold text-slate-800 mb-1 pl-2">Day {dayPlan.day}</h4>
                    <p className="text-sm font-medium text-slate-500 mb-4 pl-2">{dayPlan.title}</p>
                    <ul className="space-y-3 pl-2">
                      {dayPlan.activities.map((act, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                          <span className={`${getExpandedTrip().accent} font-bold mt-0.5`}>&bull;</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="mb-4 md:mb-0">
                  <p className="text-slate-500 text-sm">Estimated Total Cost</p>
                  <p className="text-2xl font-bold text-slate-900">{getExpandedTrip().estCost}</p>
                </div>
                <button
                  onClick={() => handleUseTemplate(getExpandedTrip())}
                  className="px-8 py-3 bg-[#378ADD] hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md transition-all transform hover:scale-[1.02] flex items-center gap-2"
                >
                  <FaMapMarkerAlt /> Use this template
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SampleTrips;
