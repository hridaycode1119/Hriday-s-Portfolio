import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Stars } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

// Add type definitions for Three.js elements in JSX to fix missing intrinsic element errors
// Augmenting both global and module-scoped JSX namespaces to handle different TypeScript configurations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      spotLight: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      spotLight: any;
    }
  }
}

// Ensure type safety for the geometry inside Points
interface StarFieldProps {
  props?: any;
}

const StarField: React.FC<StarFieldProps> = (props) => {
  const ref = useRef<any>(null);
  // Generate random points in a sphere
  const [sphere] = useState(() => random.inSphere(new Float32Array(3000), { radius: 1.5 }));

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#6366f1"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const FloatingShape = () => {
    const meshRef = useRef<any>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = time * 0.3;
        meshRef.current.rotation.y = time * 0.4;
        const scale = hovered ? 1.2 : 1;
        meshRef.current.scale.lerp({ x: scale, y: scale, z: scale }, 0.1);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh 
                ref={meshRef} 
                onPointerOver={() => setHover(true)} 
                onPointerOut={() => setHover(false)}
            >
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial 
                    color={hovered ? "#ec4899" : "#4f46e5"} 
                    wireframe 
                    emissive={hovered ? "#ec4899" : "#4f46e5"}
                    emissiveIntensity={0.5}
                />
            </mesh>
        </Float>
    );
};

const Hero3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 h-screen w-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <StarField />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <FloatingShape />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default Hero3D;