import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function HeroGlobe() {
  const canvasRef = useRef();

  useEffect(() => {
    let phi = 0;
    
    const markers = [
      { location: [27.7172, 85.3240], size: 0.05 }, // Kathmandu
      { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
      { location: [40.7128, -74.0060], size: 0.05 }, // NY
      { location: [51.5074, -0.1278], size: 0.05 }, // London
      { location: [48.8566, 2.3522], size: 0.05 }, // Paris
      { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
    ];

    let width = 0;
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth)
    window.addEventListener('resize', onResize)
    onResize()

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.2,
      dark: 0, // Light theme
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.95, 0.98, 1], // Light icy blue base
      markerColor: [0.14, 0.39, 0.92], // Tailwind blue-600
      glowColor: [0.85, 0.92, 1], // Soft blue outer glow
      markers: markers,
      onRender: (state) => {
        // Only update if dimensions change
        if (canvasRef.current && width !== canvasRef.current.offsetWidth) {
          width = canvasRef.current.offsetWidth;
          state.width = width * 2;
          state.height = width * 2;
        }
        state.phi = phi;
        phi += 0.003; // Slow rotation
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10 overflow-hidden opacity-50 mix-blend-multiply">
      <div className="w-full max-w-[800px] aspect-square relative translate-y-20 md:translate-x-32">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', contain: 'layout paint size' }}
          className="absolute inset-0 m-auto"
        />
      </div>
    </div>
  );
}
