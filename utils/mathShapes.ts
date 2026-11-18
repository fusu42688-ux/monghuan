import * as THREE from 'three';
import { ShapeType } from '../types';

const COUNT = 30000;
const SCALE = 25;

// Helper to fill array with random sphere for initial state
const makeSphere = (arr: Float32Array) => {
  for (let i = 0; i < COUNT; i++) {
    const r = SCALE * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
};

// 1. Galaxy / Chaos
const makeGalaxy = (arr: Float32Array) => {
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const angle = i * 0.02;
    const radius = SCALE * 1.5 * Math.random();
    const spiralAngle = angle + radius * 0.1;
    
    arr[i3] = Math.cos(spiralAngle) * radius;
    arr[i3 + 1] = (Math.random() - 0.5) * (SCALE / 2); // vertical chaos
    arr[i3 + 2] = Math.sin(spiralAngle) * radius;
  }
};

// 2. Cardioid (Heart) 3D Rotation
const makeCardioid = (arr: Float32Array) => {
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const t = (i / COUNT) * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2; // Rotation around Y
    
    // 2D Cardioid formula
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    
    // Extrude/Rotate to 3D
    const r = Math.abs(x) * 1.5; // Slight distortion for volume
    
    arr[i3] = r * Math.sin(phi) * 0.8;
    arr[i3 + 1] = y * 1.2;
    arr[i3 + 2] = r * Math.cos(phi) * 0.8;
  }
};

// 3. Butterfly Curve
const makeButterfly = (arr: Float32Array) => {
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    // Iterate multiple cycles to fill lines
    const t = (i / COUNT) * 12 * Math.PI; 
    
    const r = Math.exp(Math.sin(t)) - 2 * Math.cos(4*t) + Math.pow(Math.sin(t/12), 5);
    
    // Add some random scatter (thickness) to the line
    const scatter = (Math.random() - 0.5) * 1.5;

    arr[i3] = (r * Math.cos(t) * 8) + scatter;
    arr[i3 + 1] = (r * Math.sin(t) * 8) + scatter;
    arr[i3 + 2] = (i / COUNT - 0.5) * SCALE * 2; // Spread along Z
  }
};

// 4. Archimedean Spiral (Helix Cylinder)
const makeSpiral = (arr: Float32Array) => {
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const t = (i / COUNT) * 50; // Multiple windings
    const a = 0.5;
    const b = 0.5;
    
    // r = a + b*theta
    const r = (a + b * t) * 0.8; 
    
    // Map to a conical spiral
    arr[i3] = r * Math.cos(t);
    arr[i3 + 1] = (i / COUNT - 0.5) * SCALE * 2; // Height
    arr[i3 + 2] = r * Math.sin(t);
  }
};

// 5. Catenary (Hanging Chain / Surface of Revolution - Catenoid)
const makeCatenary = (arr: Float32Array) => {
  const c = 8; // scaling factor
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    // v ranges from -1 to 1 (height)
    const v = (i / COUNT - 0.5) * 3;
    const u = Math.random() * Math.PI * 2; // Rotation
    
    const r = c * Math.cosh(v / c);
    
    arr[i3] = r * Math.cos(u) * 2;
    arr[i3 + 1] = v * SCALE;
    arr[i3 + 2] = r * Math.sin(u) * 2;
  }
};

// 6. Lemniscate of Bernoulli (Infinity)
const makeLemniscate = (arr: Float32Array) => {
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const t = (i / COUNT) * 2 * Math.PI;
    const a = SCALE * 1.5;
    
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const x = (a * Math.cos(t)) / denom;
    const y = (a * Math.sin(t) * Math.cos(t)) / denom;
    
    // Add volume
    const zOffset = (Math.random() - 0.5) * 6;
    
    arr[i3] = x;
    arr[i3 + 1] = y;
    arr[i3 + 2] = x * Math.sin(t) * 0.5 + zOffset; // Twist it slightly in 3D
  }
};

// 7. Rose Curve
const makeRose = (arr: Float32Array) => {
  const k = 7; // Number of petals
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const theta = (i / COUNT) * 2 * Math.PI;
    const r = Math.cos(k * theta) * SCALE * 1.2;
    
    // Spherical projection of rose
    const phi = (i / COUNT) * Math.PI * k;

    arr[i3] = r * Math.cos(phi) * Math.sin(theta);
    arr[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i3 + 2] = r * Math.cos(theta);
  }
};

// 8. Koch Snowflake (Fractal Approximation)
// We use a simplified iterative approach to generate points on a fractal-like path
const makeKoch = (arr: Float32Array) => {
   // A randomized Sierpinski-ish tetrahedron for 3D fractal feel
   // as pure Koch is 2D. 
   const p = [
     new THREE.Vector3(SCALE, SCALE, SCALE),
     new THREE.Vector3(-SCALE, -SCALE, SCALE),
     new THREE.Vector3(-SCALE, SCALE, -SCALE),
     new THREE.Vector3(SCALE, -SCALE, -SCALE)
   ];

   let curr = new THREE.Vector3(0,0,0);
   
   for(let i=0; i<COUNT; i++) {
     const i3 = i * 3;
     // Jump halfway to a random vertex (Chaos game)
     const target = p[Math.floor(Math.random() * 4)];
     curr.lerp(target, 0.5);
     
     arr[i3] = curr.x;
     arr[i3 + 1] = curr.y;
     arr[i3 + 2] = curr.z;
   }
};

// Manager to generate all data
export const generateShapes = () => {
  const shapes: Record<ShapeType, Float32Array> = {
    [ShapeType.Galaxy]: new Float32Array(COUNT * 3),
    [ShapeType.Cardioid]: new Float32Array(COUNT * 3),
    [ShapeType.Butterfly]: new Float32Array(COUNT * 3),
    [ShapeType.Archimedean]: new Float32Array(COUNT * 3),
    [ShapeType.Catenary]: new Float32Array(COUNT * 3),
    [ShapeType.Lemniscate]: new Float32Array(COUNT * 3),
    [ShapeType.Rose]: new Float32Array(COUNT * 3),
    [ShapeType.Koch]: new Float32Array(COUNT * 3),
  };

  makeGalaxy(shapes[ShapeType.Galaxy]);
  makeCardioid(shapes[ShapeType.Cardioid]);
  makeButterfly(shapes[ShapeType.Butterfly]);
  makeSpiral(shapes[ShapeType.Archimedean]);
  makeCatenary(shapes[ShapeType.Catenary]);
  makeLemniscate(shapes[ShapeType.Lemniscate]);
  makeRose(shapes[ShapeType.Rose]);
  makeKoch(shapes[ShapeType.Koch]);

  return shapes;
};
