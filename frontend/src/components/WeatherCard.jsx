const WeatherCard = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6">5-Day Weather Forecast</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {forecast.map((day, index) => {
          // Format date from "YYYY-MM-DD" to "Mon 14"
          const dateObj = new Date(day.date);
          const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          
          return (
            <div key={index} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 hover:border-blue-200 transition-colors">
              <p className="text-sm font-medium text-slate-500 mb-2">{formattedDate}</p>
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-50 rounded-full flex items-center justify-center">
                <img 
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                  alt={day.description} 
                  className="w-12 h-12"
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-bold text-slate-800">{day.tempMax}°</span>
                <span className="text-sm font-medium text-slate-400">{day.tempMin}°</span>
              </div>
              <p className="text-xs text-slate-500 capitalize line-clamp-1" title={day.description}>{day.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherCard;
