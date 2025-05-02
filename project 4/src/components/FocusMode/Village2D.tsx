import React from 'react';
import { motion } from 'framer-motion';
import { useFocusStore } from '../../stores/focusStore';
import { useTimer } from '../../contexts/TimerContext';

interface Building {
  id: string;
  type: 'house' | 'shop' | 'garden' | 'fountain';
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const TILE_SIZE = 120;

const Village2D: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { totalFocusMinutes } = useFocusStore();
  const { duration } = useTimer();
  const buildingInterval = Math.floor(duration / 60 / 6);
  
  const generateBuildings = (): Building[] => {
    const buildingTypes: Building['type'][] = ['house', 'shop', 'garden', 'fountain'];
    const buildingsCount = Math.min(Math.floor(totalFocusMinutes / buildingInterval), 6);
    
    return Array.from({ length: buildingsCount }, (_, i) => {
      const type = buildingTypes[i % buildingTypes.length];
      const gridX = 2 + (i % 3) * 2 + (Math.random() * 0.5 - 0.25);
      const gridY = 2 + Math.floor(i / 3) * 2 + (Math.random() * 0.5 - 0.25);
      
      return {
        id: `building-${i}`,
        type,
        x: gridX * TILE_SIZE,
        y: gridY * TILE_SIZE,
        scale: 0.9 + Math.random() * 0.2,
        rotation: (Math.random() - 0.5) * 10
      };
    });
  };

  const buildings = generateBuildings();

  const renderBuilding = (type: Building['type']) => {
    switch (type) {
      case 'house':
        return (
          <div className="w-full h-full relative">
            {/* Toit */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/4 bg-[#8B4513]" 
                 style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }} />
            {/* Corps */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-[#DEB887]">
              {/* Fenêtre */}
              <div className="absolute top-1/4 left-1/4 w-2/4 h-2/4 bg-[#87CEEB]" />
              {/* Porte */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1/3 bg-[#8B4513]" />
            </div>
          </div>
        );
      
      case 'shop':
        return (
          <div className="w-full h-full relative">
            {/* Toit */}
            <div className="absolute top-1/4 left-0 w-full h-1/3 bg-[#CD853F]" />
            {/* Corps */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-[#F4A460]">
              {/* Vitrine */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[#B8860B]" />
            </div>
          </div>
        );

      case 'garden':
        return (
          <div className="w-full h-full relative">
            {/* Base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-2/3 bg-[#228B22]">
              {/* Fleurs */}
              <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-[#FF69B4]" 
                   style={{ borderRadius: '50%' }} />
              <div className="absolute top-1/4 right-1/4 w-1/4 h-1/4 bg-[#FFD700]"
                   style={{ borderRadius: '50%' }} />
            </div>
          </div>
        );

      case 'fountain':
        return (
          <div className="w-full h-full relative">
            {/* Base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-[#808080]"
                 style={{ borderRadius: '50%' }}>
              {/* Eau */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[#00CED1]"
                   style={{ borderRadius: '50%' }} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-3xl mx-auto rounded-xl overflow-hidden bg-[#90EE90] pixel-corners">
      {/* Motif d'herbe */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(#32CD32 15%, transparent 15%),
            radial-gradient(#32CD32 15%, transparent 15%)
          `,
          backgroundPosition: '0 0, 8px 8px',
          backgroundSize: '16px 16px',
          opacity: 0.3
        }}
      />

      {/* Bâtiments */}
      {buildings.map((building, index) => (
        <motion.div
          key={building.id}
          className="absolute transform-gpu"
          style={{
            left: building.x - TILE_SIZE / 2,
            top: building.y - TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            transform: `rotate(${building.rotation}deg) scale(${building.scale})`,
            transformOrigin: 'center center'
          }}
          initial={{ scale: 0, opacity: 0, y: -20 }}
          animate={{ 
            scale: building.scale, 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: index * 0.1
            }
          }}
        >
          {renderBuilding(building.type)}
        </motion.div>
      ))}

      {/* Particules quand actif */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: '100%',
                opacity: 0.2 + Math.random() * 0.3
              }}
              animate={{
                y: '-10%',
                opacity: 0
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Village2D;