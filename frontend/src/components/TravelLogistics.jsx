import { FaWalking, FaSubway, FaTaxi, FaBus, FaPlane, FaTrain, FaShip, FaMotorcycle } from 'react-icons/fa';

const MODE_CONFIG = {
  Walk: { icon: FaWalking, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Metro: { icon: FaSubway, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  Cab: { icon: FaTaxi, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  Auto: { icon: FaMotorcycle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  Bus: { icon: FaBus, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  Flight: { icon: FaPlane, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  Train: { icon: FaTrain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  Ferry: { icon: FaShip, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
};

const TravelLogistics = ({ travelFromPrevious }) => {
  if (!travelFromPrevious) return null;

  const { distance, duration, mode } = travelFromPrevious;
  if (!distance && !duration) return null;

  const config = MODE_CONFIG[mode] || MODE_CONFIG.Walk;
  const IconComp = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.color} shadow-sm border border-black/5 hover:border-black/10 transition-colors bg-white`}>
      <IconComp className="h-3 w-3" />
      <span>{distance}</span>
      <span className="text-slate-300">·</span>
      <span>{duration}</span>
      <span className="text-slate-300">·</span>
      <span className="capitalize">{mode}</span>
    </div>
  );
};

export default TravelLogistics;
