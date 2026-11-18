import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { CosmicParticles } from './components/CosmicParticles';
import { ShapeType } from './types';

const App: React.FC = () => {
  const shapes = Object.values(ShapeType);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-switch logic
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setCurrentShapeIndex((prev) => (prev + 1) % shapes.length);
    }, 6000); // Switch every 6 seconds

    return () => clearInterval(interval);
  }, [autoRotate, shapes.length]);

  return (
    <div className="relative w-full h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 70], fov: 45 }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 2]} // Handle high DPI screens
      >
        <color attach="background" args={['#050510']} />
        
        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Core Particle System */}
        <CosmicParticles currentShape={shapes[currentShapeIndex]} />

        {/* Post Processing for the "Glow" */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* Controls */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={10} 
          maxDistance={150} 
          autoRotate={false}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex flex-col justify-between h-full z-10">
        
        {/* Header */}
        <header className="flex flex-col items-start gap-2">
          <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
            COSMIC MATH
          </h1>
          <p className="text-sm text-blue-200 opacity-80 max-w-md">
            Interactive 3D particle system showcasing the beauty of mathematical curves.
            30,000 particles rendering in real-time.
          </p>
        </header>

        {/* Active Shape Display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <h2 className="text-6xl font-thin text-white opacity-10 tracking-[1rem] uppercase animate-pulse">
             {shapes[currentShapeIndex].split(' ')[0]}
          </h2>
        </div>

        {/* Footer Controls */}
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between w-full pointer-events-auto gap-4">
          
          <div className="flex flex-wrap gap-2 max-w-2xl">
            {shapes.map((shape, idx) => (
              <button
                key={shape}
                onClick={() => {
                  setCurrentShapeIndex(idx);
                  setAutoRotate(false);
                }}
                className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 backdrop-blur-sm
                  ${currentShapeIndex === idx 
                    ? 'bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                    : 'bg-black/30 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {shape}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Autoplay</span>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${autoRotate ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${autoRotate ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
