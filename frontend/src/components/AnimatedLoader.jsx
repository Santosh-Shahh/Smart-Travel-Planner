import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGlobeAmericas, FaRoute, FaMapMarkedAlt, FaStar, FaCloudSun } from 'react-icons/fa';

const STEPS = [
  { icon: FaGlobeAmericas, message: 'Planning your dream trip…', color: 'text-blue-500' },
  { icon: FaRoute, message: 'Finding the best routes…', color: 'text-purple-500' },
  { icon: FaMapMarkedAlt, message: 'Discovering hidden gems…', color: 'text-emerald-500' },
  { icon: FaStar, message: 'Optimizing your itinerary…', color: 'text-amber-500' },
  { icon: FaCloudSun, message: 'Checking weather forecasts…', color: 'text-sky-500' },
];

const AnimatedLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const step = STEPS[currentStep];
  const IconComponent = step.icon;

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      {/* Animated globe container */}
      <div className="relative mb-10">
        {/* Orbiting ring */}
        <motion.div
          className="absolute inset-[-20px] border-2 border-dashed border-primary-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Pulsing background */}
        <motion.div
          className="absolute inset-[-10px] bg-primary-100 rounded-full"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Icon container */}
        <motion.div
          className={`relative h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center ${step.color}`}
          key={currentStep}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <IconComponent className="h-10 w-10" />
        </motion.div>
        {/* Orbiting dot */}
        <motion.div
          className="absolute h-3 w-3 bg-primary-500 rounded-full shadow-lg"
          style={{ top: '-8px', left: '50%', marginLeft: '-6px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          initial={false}
        />
      </div>

      {/* Animated message */}
      <motion.p
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-xl font-semibold text-slate-700 mb-4 text-center"
      >
        {step.message}
      </motion.p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-2">
        {STEPS.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentStep ? 'w-8 bg-primary-500' : 'w-2 bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Subtitle */}
      <p className="text-sm text-slate-400 mt-6">This usually takes 2-4 seconds</p>
    </div>
  );
};

export default AnimatedLoader;
