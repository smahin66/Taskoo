import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useFocusStore } from '../../stores/focusStore';
import { useTimer } from '../../contexts/TimerContext';
import Village2D from './Village2D';

interface BuildingProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type: 'house' | 'tree' | 'garden' | 'pond' | 'cabin';
}

const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
        color="#4a8505"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
};

const Paths: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
        color="#8B6D3C"
        roughness={1}
        metalness={0}
        opacity={0.7}
        transparent
      />
    </mesh>
  );
};

const Village3D: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  // Since we're having issues with 3D models, let's fallback to 2D for now
  return <Village2D isActive={isActive} />;
};

export default Village3D;