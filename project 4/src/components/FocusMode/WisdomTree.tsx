import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useTimer } from '../../contexts/TimerContext';
import { useFocusStore } from '../../stores/focusStore';

interface WisdomTreeProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const WisdomTree: React.FC<WisdomTreeProps> = ({ 
  isFullscreen = false,
  onToggleFullscreen 
}) => {
  const { totalFocusMinutes } = useFocusStore();
  const { isRunning } = useTimer();

  return (
    <div className="relative w-full h-full min-h-[500px] bg-violet-900 overflow-hidden">
      {/* Naruto running GIF */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: isRunning ? 1 : 0.3,
          transition: 'opacity 0.3s ease-in-out'
        }}
      >
        <img 
          src="https://media1.tenor.com/m/TZ9XSnk4ukgAAAAC/naruto-uzumaki.gif"
          alt="Naruto running"
          className="w-full h-full object-cover"
          style={{
            filter: isRunning ? 'none' : 'grayscale(100%)',
            transition: 'filter 0.3s ease-in-out'
          }}
        />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-900 via-transparent to-transparent opacity-60" />

      {/* Fullscreen toggle button */}
      {onToggleFullscreen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleFullscreen}
          className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-lg rounded-xl text-white hover:bg-white/20 transition-colors z-10"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </motion.button>
      )}

      {/* Focus minutes counter */}
      <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white z-10">
        <p className="text-sm font-medium">Minutes de concentration</p>
        <p className="text-2xl font-bold">{totalFocusMinutes}</p>
      </div>

      {/* Motivational message */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-xl px-6 py-3 text-white text-center z-10"
        >
          <p className="text-lg font-medium">Continuez comme ça !</p>
        </motion.div>
      )}
    </div>
  );
};

export default WisdomTree;