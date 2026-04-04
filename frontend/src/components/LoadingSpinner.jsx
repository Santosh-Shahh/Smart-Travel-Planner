import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-48">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="h-12 w-12 border-4 border-slate-200 border-t-primary-600 rounded-full"
      />
    </div>
  );
};

export default LoadingSpinner;
