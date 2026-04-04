import { FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';

const ItineraryCard = ({ day }) => {
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

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {day.activities.map((activity, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:bg-primary-600 group-hover:text-white transition-colors z-10 font-bold text-sm">
              {index + 1}
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap gap-2 items-center text-xs font-semibold text-primary-600 mb-2">
                <span className="flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-md"><FaClock /> {activity.time}</span>
                {activity.estimatedCost && (
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md"><FaMoneyBillWave /> {activity.estimatedCost}</span>
                )}
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">{activity.activity}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">{activity.description}</p>
              
              {activity.location && (
                <div className="flex items-start gap-1.5 text-sm font-medium text-slate-500 mt-3 pt-3 border-t border-slate-200">
                  <FaMapMarkerAlt className="mt-0.5 shrink-0 text-slate-400" />
                  <span>{activity.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryCard;
