import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-xl tracking-tight text-white">
              Smart<span className="text-primary-400">Travel</span>
            </span>
            <p className="text-slate-400 text-sm mt-1">
              AI-powered itineraries for modern explorers.
            </p>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Smart Travel Planner. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
