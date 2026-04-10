import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaLandmark, FaUtensils, FaPlane, FaHotel, FaLeaf, FaShoppingBag, FaGlassMartini, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import PlaceImage from './PlaceImage';
import TravelLogistics from './TravelLogistics';

const ACTIVITY_TYPE_CONFIG = {
  attraction: { icon: FaLandmark, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Attraction' },
  food: { icon: FaUtensils, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Food' },
  transport: { icon: FaPlane, color: 'text-sky-600', bg: 'bg-sky-50', label: 'Transport' },
  stay: { icon: FaHotel, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Stay' },
  nature: { icon: FaLeaf, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Nature' },
  shopping: { icon: FaShoppingBag, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Shopping' },
  nightlife: { icon: FaGlassMartini, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Nightlife' },
};

const ItineraryCard = ({ day, destination, totalDays, dayIndex }) => {
  return (
    <div className="relative w-full group/day mb-16 md:mb-24">
      {/* Centered Day Header */}
      <div className="flex justify-start md:justify-center mb-12 md:mb-16 relative z-10 w-full pl-[40px] sm:pl-[60px] md:pl-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-md border border-slate-200 flex items-center gap-4"
        >
          <div className="flex flex-col items-start md:items-center">
             <span className="text-primary-600 font-extrabold text-sm uppercase tracking-widest leading-none">{day.title}</span>
             <span className="text-slate-500 font-extrabold text-xs mt-1">DAY {day.day}</span>
          </div>
          {day.dailyCost && (
            <div className="pl-4 border-l border-slate-200 h-full flex items-center">
               <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 text-emerald-700 text-xs font-bold border border-emerald-100/50 shadow-sm">
                 <FaMoneyBillWave className="text-emerald-500" /> est {day.dailyCost}
               </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Activities Zigzag */}
      <div className="relative w-full flex flex-col space-y-12">
        {day.activities.map((activity, index) => {
          // Alternating sides logic
          const isLeft = index % 2 === 0;

          // Build image query
          const queryParts = [activity.activity];
          if (activity.location && !activity.activity.toLowerCase().includes(activity.location.toLowerCase())) {
            queryParts.push(activity.location);
          }
          if (destination && !queryParts.some(p => p.toLowerCase().includes(destination.toLowerCase()))) {
            queryParts.push(destination);
          }
          const fullQuery = queryParts.join(', ');
          const imageIndex = parseInt(day.day) * 10 + index;

          const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.attraction;
          const TypeIcon = typeConfig?.icon || FaLandmark;

          return (
            <div key={index} className="relative w-full">
              
              {/* Optional Logistics */}
              {index > 0 && activity.travelFromPrevious && (
                <div className="relative w-full flex mb-6 -mt-6 z-10 pl-[60px] md:pl-0 md:justify-center">
                  <div className="absolute left-[24px] top-1/2 -translate-y-1/2 -translate-x-1/2 md:static md:translate-x-0 md:translate-y-0 h-full flex items-center bg-[#F8FAFC] rounded-full ring-2 ring-white">
                    <TravelLogistics travelFromPrevious={activity.travelFromPrevious} />
                  </div>
                </div>
              )}

              {/* Zigzag Layout Wrapper */}
              <div className={`relative flex w-full ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
                 
                 {/* Card Container aligned to Left or Right on Desktop */}
                 <div className={`w-full md:w-1/2 relative group/timeline pl-[60px] pr-4 md:pr-0 
                    ${isLeft ? 'md:pl-0 md:pr-[3rem] lg:pr-[4rem]' : 'md:pr-0 md:pl-[3rem] lg:pl-[4rem]'}`}
                 >
                    
                    {/* Visual Marker Dot centered exactly on the line */}
                    <div className={`absolute top-[6rem] sm:top-[7rem] w-[20px] h-[20px] -translate-y-1/2 rounded-full bg-[#F8FAFC] border-[5px] border-slate-200 group-hover/timeline:border-primary-500 group-hover/timeline:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 z-20 
                      ${isLeft ? 'left-[24px] -translate-x-1/2 md:left-auto md:right-0 md:translate-x-1/2' : 'left-[24px] -translate-x-1/2 md:left-0 md:-translate-x-1/2'}
                    `} />

                    {/* Interactive Glass Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className="bg-white/90 backdrop-blur-lg rounded-[24px] overflow-hidden border border-slate-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col group/card relative"
                    >
                        {/* Premium 16:9 Featured Image */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0 bg-slate-100">
                          <div className="absolute inset-0 group-hover/card:scale-105 transition-transform duration-700 ease-out pointer-events-none">
                            <PlaceImage locationName={fullQuery} imageIndex={imageIndex} />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none" />
                          
                          {/* Image Text Overlay */}
                          <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 flex items-end justify-between gap-4 pointer-events-none">
                            <h4 className="text-2xl sm:text-[1.75rem] font-bold text-white leading-tight drop-shadow-md">
                              {activity.activity}
                            </h4>
                          </div>
                        </div>

                        {/* Card Content body */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col">
                           {/* Tags Row */}
                           <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wide ${typeConfig.bg} ${typeConfig.color} border border-transparent`}>
                                <TypeIcon className="h-3 w-3" /> {typeConfig.label}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200/50">
                                <FaClock className="h-3 w-3" /> {activity.time}
                              </span>
                              {activity.estimatedCost && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <FaMoneyBillWave className="h-3 w-3" /> {activity.estimatedCost}
                                </span>
                              )}
                           </div>

                           {/* Short description */}
                           <p className="text-slate-500 font-medium leading-relaxed mb-6 text-sm sm:text-[0.95rem] line-clamp-3 opacity-90">
                             {activity.description}
                           </p>

                           {/* Location Action block */}
                           {activity.location && (
                             <div className="mt-auto">
                               <a 
                                 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="flex items-center gap-3 bg-slate-50 hover:bg-primary-50 p-3 sm:p-4 rounded-xl transition-all duration-300 border border-slate-100 hover:border-primary-100 group/link"
                               >
                                 <div className="bg-white group-hover/link:bg-primary-100 p-2.5 rounded-lg shadow-sm border border-slate-100 group-hover/link:border-primary-200 transition-colors shrink-0">
                                   <FaMapMarkerAlt className="h-4 w-4 text-slate-400 group-hover/link:text-primary-600 transition-colors" />
                                 </div>
                                 <div className="min-w-0 pr-1">
                                   <span className="text-sm font-bold text-slate-700 group-hover/link:text-primary-800 transition-colors block truncate">
                                     {activity.location}
                                   </span>
                                   <span className="text-[11px] font-bold text-slate-400 group-hover/link:text-primary-600 transition-colors flex items-center gap-1 mt-0.5 uppercase tracking-wide">
                                     View on map <FaExternalLinkAlt className="h-2 w-2" />
                                   </span>
                                 </div>
                               </a>
                             </div>
                           )}
                        </div>
                    </motion.div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItineraryCard;
