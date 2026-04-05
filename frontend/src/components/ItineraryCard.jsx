import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaExternalLinkAlt } from 'react-icons/fa';
import PlaceImage from './PlaceImage';

const ItineraryCard = ({ day, destination }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
        <div className="bg-primary-50 text-primary-600 font-bold text-xl h-14 w-14 rounded-2xl flex items-center justify-center shrink-0">
          D{day.day}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">{day.title}</h3>
        </div>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {day.activities.map((activity, index) => {
          // Smartly combine activity context with location for incredibly accurate Google Places search
          const queryParts = [activity.activity];
          if (activity.location && !activity.activity.toLowerCase().includes(activity.location.toLowerCase())) {
            queryParts.push(activity.location);
          }
          if (destination && !queryParts.some(p => p.toLowerCase().includes(destination.toLowerCase()))) {
            queryParts.push(destination);
          }
          const fullQuery = queryParts.join(', ');

          // Deterministic unique seed (e.g. Day 1 Activity 2 = 12) to ensure unique images
          const imageIndex = parseInt(day.day) * 10 + index;

          return (
          <div key={index} className="relative flex items-start justify-end md:items-center md:justify-normal md:odd:flex-row-reverse group">
            {/* Timeline dot */}
            <div className="absolute left-0 md:relative flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:bg-primary-600 group-hover:text-white transition-colors z-10 font-bold text-sm">
              {index + 1}
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-3rem)] bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Dynamic Google Places API Image Component */}
              <PlaceImage locationName={fullQuery} imageIndex={imageIndex} />

              <div className="flex flex-wrap gap-2 items-center text-xs font-semibold text-primary-600 mb-3">
                <span className="flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-md"><FaClock /> {activity.time}</span>
                {activity.estimatedCost && (
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md"><FaMoneyBillWave /> {activity.estimatedCost}</span>
                )}
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">{activity.activity}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{activity.description}</p>
              
              {activity.location && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 flex flex-col w-full bg-blue-50 hover:bg-blue-100 px-4 py-3.5 rounded-xl transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:shadow-md group/link cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="mt-0.5 shrink-0 text-blue-600" />
                    <span className="text-sm font-bold text-blue-800 leading-snug group-hover/link:text-blue-600 transition-colors whitespace-normal break-words">
                      {activity.location}
                    </span>
                  </div>
                  <span className="text-xs font-semibold tracking-wide text-blue-600/70 group-hover/link:text-blue-600 ml-6 mt-1.5 transition-colors">
                    View on Map ↗
                  </span>
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
