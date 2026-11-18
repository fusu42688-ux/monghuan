import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateShapes } from '../utils/mathShapes';
import { ShapeType } from '../types';

interface CosmicParticlesProps {
  currentShape: ShapeType;
}

const PARTICLE_COUNT = 30000;

export const CosmicParticles: React.FC<CosmicParticlesProps> = ({ currentShape }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Pre-calculate all shapes once
  const shapeData = useMemo(() => generateShapes(), []);
  
  // Current positions buffer (mutable)
  const [positions] = useState(() => new Float32Array(PARTICLE_COUNT * 3));
  
  // Color attribute
  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Initialize with a cool cosmic palette (blue/purple/cyan)
      const mix = Math.random();
      color.setHSL(0.6 + mix * 0.2, 0.9, 0.6 + Math.random() * 0.4);
      arr[i * 3] = color.r;
      arr[i * 3 + 1] = color.g;
      arr[i * 3 + 2] = color.b;
    }
    return arr;
  }, []);

  // Animation constants
  const lerpSpeed = 0.03; // Smoothness of transition
  const rotationSpeed = 0.05;

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    const targetPositions = shapeData[currentShape];
    const currentPositions = positionsAttribute.array as Float32Array;

    const time = state.clock.getElapsedTime();

    // Morphing Logic: Lerp current positions towards target positions CPU-side
    // While a Vertex Shader is more performant, CPU lerp allows easier complex logic later
    // and 30k particles is well within modern JS limits.
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Linear interpolation
      currentPositions[i3] += (targetPositions[i3] - currentPositions[i3]) * lerpSpeed;
      currentPositions[i3 + 1] += (targetPositions[i3 + 1] - currentPositions[i3 + 1]) * lerpSpeed;
      currentPositions[i3 + 2] += (targetPositions[i3 + 2] - currentPositions[i3 + 2]) * lerpSpeed;
      
      // Add a subtle breathing/wobble effect based on noise/time to make it feel "alive"
      // Optimization: Only do this when close to target or always for chaos?
      // Keeping it simple for performance.
    }

    positionsAttribute.needsUpdate = true;

    // Rotate the entire cloud slowly
    pointsRef.current.rotation.y = time * rotationSpeed;
    pointsRef.current.rotation.z = Math.sin(time * 0.2) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};
