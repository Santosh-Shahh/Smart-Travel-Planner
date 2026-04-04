import { motion } from 'framer-motion';
import TripForm from '../components/TripForm';
import { FaGlobeAmericas, FaMagic, FaCoins } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-6 border border-primary-100">
            <FaMagic className="mr-1" /> AI-Powered Travel Planning
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Design your dream trip in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">seconds.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Tell us where you want to go, and our AI will instantly generate a personalized day-by-day itinerary tailored to your budget and schedule.
          </p>
        </motion.div>

        <div className="mb-32">
          <TripForm />
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white"
          >
            <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
              <FaMagic className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Personalization</h3>
            <p className="text-slate-600">Smart itineraries that adapt to your exact needs, travel style, and duration.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white"
          >
            <div className="h-12 w-12 bg-secondary-100 text-secondary-600 rounded-2xl flex items-center justify-center mb-6">
              <FaGlobeAmericas className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Map Data</h3>
            <p className="text-slate-600">Integrated with Google Maps to find the best local attractions, restaurants, and spots.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white"
          >
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <FaCoins className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Budgeting</h3>
            <p className="text-slate-600">Get a realistic breakdown of expected costs tailored to your specified budget tier.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
