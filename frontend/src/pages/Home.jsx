import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TripForm from '../components/TripForm';
import SampleTrips from '../components/SampleTrips';
import { FaGlobeAmericas, FaMagic, FaCoins } from 'react-icons/fa';

const Home = () => {
  useEffect(() => {
    // -- Change 1: Flight route lines canvas --
    const canvas = document.getElementById('frc');
    const heroDiv = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    
    let frame = 0;
    let animationId;

    const initRoutes = () => {
      canvas.width = heroDiv.offsetWidth;
      canvas.height = heroDiv.offsetHeight;
      
      const cityRatios = [
        {x:0.06,y:0.52}, {x:0.17,y:0.25}, {x:0.27,y:0.68}, {x:0.40,y:0.18}, 
        {x:0.52,y:0.48}, {x:0.63,y:0.22}, {x:0.75,y:0.60}, {x:0.88,y:0.32}, 
        {x:0.33,y:0.78}, {x:0.58,y:0.75}
      ];
      const routePairs = [[0,1],[0,2],[1,3],[2,4],[3,7],[4,5],[5,6],[6,7],[0,4],[2,8],[8,9],[9,6],[1,4],[3,5],[0,3],[4,7]];

      const draw = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        
        const cities = cityRatios.map(r => ({ x: r.x * w, y: r.y * h }));

        routePairs.forEach((pair, routeIndex) => {
          const a = cities[pair[0]];
          const b = cities[pair[1]];
          const cpx = (a.x + b.x) / 2;
          const cpy = Math.min(a.y, b.y) - h * 0.15;

          ctx.beginPath();
          ctx.setLineDash([3, 8]);
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
          ctx.strokeStyle = 'rgba(96,200,255,0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

          const p = ((frame * 0.4 + routeIndex * 20) % 100) / 100;
          const px = Math.pow(1 - p, 2) * a.x + 2 * (1 - p) * p * cpx + Math.pow(p, 2) * b.x;
          const py = Math.pow(1 - p, 2) * a.y + 2 * (1 - p) * p * cpy + Math.pow(p, 2) * b.y;

          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(96,200,255,0.95)';
          ctx.shadowColor = '#60c8ff';
          ctx.shadowBlur = 7;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        });

        cities.forEach(city => {
          ctx.beginPath();
          ctx.arc(city.x, city.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.fill();
        });

        frame++;
        animationId = requestAnimationFrame(draw);
      };

      draw();
    };

    initRoutes();

    const handleResize = () => {
      cancelAnimationFrame(animationId);
      initRoutes();
    };
    window.addEventListener('resize', handleResize);

    // -- Change 2: Typewriter effect on hero headline --
    const wordSpan = document.getElementById('tw-word');
    const words = ['seconds', 'minutes', 'one click'];
    let wordIndex = 0;
    let charIndex = words[0].length; // start fully typed to avoid layout shift jump
    let isDeleting = true; 
    let timeoutId;

    const initTypewriter = () => {
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
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
      <canvas id="frc" style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0}}></canvas>
      
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
            AI-Powered Travel Planning
          </div>
          <style>{`
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            #tw-cursor { animation: blink 0.75s step-end infinite; }
          `}</style>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Design your dream trip in <span id="tw-word" className="text-primary-600">seconds</span><span id="tw-cursor" className="text-primary-600">|</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Tell us where you want to go, and our AI will instantly generate a personalized day-by-day itinerary tailored to your budget and schedule.
          </p>
        </motion.div>

        <div className="mb-20">
          <TripForm />
        </div>

        <div className="mb-32 relative z-10 bg-white shadow-xl shadow-slate-200/50 rounded-3xl py-10 my-10 border border-slate-100/50">
          <SampleTrips />
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
