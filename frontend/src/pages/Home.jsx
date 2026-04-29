import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TripForm from '../components/TripForm';
import SampleTrips from '../components/SampleTrips';
import BackgroundBlobs from '../components/BackgroundBlobs';
import HeroGlobe from '../components/HeroGlobe';
import { FaGlobeAmericas, FaMagic, FaCoins } from 'react-icons/fa';

const Home = () => {
  useEffect(() => {
    // -- Typewriter effect on hero headline --
    const wordSpan = document.getElementById('tw-word');
    const words = ['seconds', 'minutes', 'one click'];
    let wordIndex = 0;
    let charIndex = words[0].length; // start fully typed to avoid layout shift jump
    let isDeleting = true; 
    let timeoutId;

    const initTypewriter = () => {
      if (!wordSpan) return;
      const typeWriter = () => {
        const currentWord = words[wordIndex];

        if (!isDeleting) {
          wordSpan.textContent = currentWord.slice(0, charIndex + 1);
          charIndex++;
          if (charIndex === currentWord.length) {
            isDeleting = true;
            timeoutId = setTimeout(typeWriter, 2000);
            return;
          }
        } else {
          wordSpan.textContent = currentWord.slice(0, charIndex - 1);
          charIndex--;
          if (charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            timeoutId = setTimeout(typeWriter, 350);
            return;
          }
        }

        timeoutId = setTimeout(typeWriter, isDeleting ? 50 : 80);
      };

      timeoutId = setTimeout(() => {
        typeWriter();
      }, 2000);
    };

    initTypewriter();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
      <BackgroundBlobs />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 pb-32">
        <HeroGlobe />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 relative z-[20]"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-6 border border-primary-100">
            <FaMagic className="mr-1" /> AI-Powered Travel Planning
          </div>
          <style>{`
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            #tw-cursor { animation: blink 0.75s step-end infinite; }
            
            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
              }
            }
          `}</style>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Design your dream trip in <span id="tw-word" className="text-primary-600">seconds</span><span id="tw-cursor" className="text-primary-600">|</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Tell us where you want to go, and our AI will instantly generate a personalized day-by-day itinerary tailored to your budget and schedule.
          </p>
        </motion.div>

        <div className="mb-20 relative z-[20]">
          <TripForm />
        </div>

        <div className="mb-32 relative z-[20] bg-white/80 backdrop-blur-md shadow-xl shadow-slate-200/50 rounded-3xl py-10 my-10 border border-slate-100/50">
          <SampleTrips />
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 relative z-[20]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/50"
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
            className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/50"
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
            className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/50"
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
