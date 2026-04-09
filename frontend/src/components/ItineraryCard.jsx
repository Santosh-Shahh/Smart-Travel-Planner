import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaLandmark, FaUtensils, FaPlane, FaHotel, FaLeaf, FaShoppingBag, FaGlassMartini, FaRoute } from 'react-icons/fa';
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

const ItineraryCard = ({ day, destination, totalDays }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6 hover:shadow-md transition-shadow">
      {/* Day header */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-xl h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/20">
            D{day.day}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{day.title}</h3>
            {totalDays && (
              <p className="text-sm text-slate-400 font-medium">Day {day.day} of {totalDays}</p>
            )}
          </div>
        </div>
        {day.dailyCost && (
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-200 shrink-0">
            {day.dailyCost}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {day.activities.map((activity, index) => {
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

          // Activity type config
          const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.attraction;
          const TypeIcon = typeConfig?.icon || FaLandmark;

          return (
            <div key={index}>
              {/* Travel logistics between activities */}
              {index > 0 && activity.travelFromPrevious && (
                <TravelLogistics travelFromPrevious={activity.travelFromPrevious} />
              )}

              {/* Activity card */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                {/* Image */}
                <PlaceImage locationName={fullQuery} imageIndex={imageIndex} />

                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 items-center text-xs font-semibold mb-3">
                  {/* Type badge */}
                  {typeConfig && (
                    <span className={`flex items-center gap-1 ${typeConfig.bg} ${typeConfig.color} px-2.5 py-1 rounded-md`}>
                      <TypeIcon className="h-3 w-3" /> {typeConfig.label}
                    </span>
                  )}
                  {/* Time badge */}
                  <span className="flex items-center gap-1 bg-primary-50 text-primary-600 px-2.5 py-1 rounded-md">
                    <FaClock className="h-3 w-3" /> {activity.time}
                  </span>
                  {/* Cost badge */}
                  {activity.estimatedCost && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                      <FaMoneyBillWave className="h-3 w-3" /> {activity.estimatedCost}
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-slate-800 mb-2">{activity.activity}</h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{activity.description}</p>
                
                {activity.location && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:shadow-md group/link"
                  >
                    <FaMapMarkerAlt className="shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-blue-800 group-hover/link:text-blue-600 transition-colors block truncate">
                        {activity.location}
                      </span>
                      <span className="text-xs font-semibold text-blue-600/70">View on Map ↗</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItineraryCard;
