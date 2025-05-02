import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Maximize2, Minimize2, Play, Pause, RotateCcw, Settings, Plus, Minus, Star } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useTimer } from '../../contexts/TimerContext';
import SessionRating from './SessionRating';

interface TimerPageProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface CosmicParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

const TimerPage: React.FC<TimerPageProps> = ({ 
  isFullscreen = false,
  onToggleFullscreen 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [particles, setParticles] = useState<CosmicParticle[]>([]);
  const {
    duration,
    timeLeft,
    isRunning,
    showRating,
    setShowRating,
    setDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTime,
    handleSessionRating
  } = useTimer();

  // Gestion des particules cosmiques
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        // Augmenter la fréquence des particules en fonction du progrès
        const progress = ((duration - timeLeft) / duration) * 100;
        const spawnChance = 0.3 + (progress / 100) * 0.4; // 30% à 70% de chance

        if (Math.random() < spawnChance) {
          setParticles(prev => [
            ...prev,
            {
              id: Date.now(),
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.5
            }
          ]);
        }
      }, 500); // Réduire l'intervalle pour plus de particules

      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft, duration]);

  // Nettoyage des particules
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles(prev => prev.filter(p => Date.now() - p.id < 5000));
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className={`
      ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-violet-50 via-violet-50/50 to-violet-50 dark:from-dark-900 dark:via-dark-950 dark:to-dark-900' : ''}
      flex flex-col items-center justify-center p-6 relative overflow-hidden
    `}>
      {/* Particules cosmiques */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                opacity: 0,
                scale: 0,
                x: `${particle.x}%`,
                y: `${particle.y}%`
              }}
              animate={{ 
                opacity: [0, particle.opacity, 0],
                scale: [0, particle.scale, particle.scale * 1.5],
                y: `${particle.y - 30}%`
              }}
              transition={{ 
                duration: 5,
                ease: "easeOut",
                opacity: { times: [0, 0.2, 1] },
                scale: { times: [0, 0.2, 1] }
              }}
              className="absolute"
            >
              <Star className="w-4 h-4 text-violet-400 dark:text-violet-300" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Card glass className="w-full max-w-lg p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Timer className="w-6 h-6 text-violet-500 mr-2" />
            <h2 className="text-xl font-semibold text-violet-900 dark:text-violet-100">
              Timer
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            {onToggleFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-300 mb-2">
                  Durée (minutes)
                </label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDuration = Math.max(1, Math.floor(duration / 60) - 1) * 60;
                      setDuration(newDuration);
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <input
                    type="number"
                    value={Math.floor(duration / 60)}
                    onChange={(e) => {
                      const newDuration = Math.max(1, parseInt(e.target.value)) * 60;
                      setDuration(newDuration);
                    }}
                    className="w-24 px-4 py-2 text-center bg-violet-50 dark:bg-violet-900/30 border-2 border-violet-200 dark:border-violet-700 rounded-xl"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDuration = (Math.floor(duration / 60) + 1) * 60;
                      setDuration(newDuration);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="relative w-48 h-48 mx-auto mb-8">
                {/* Cercle de progression */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-violet-200 dark:text-violet-900"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                    className="text-violet-500 dark:text-violet-400 transition-all duration-200"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="space-y-2">
                    <span className="text-4xl font-bold text-violet-900 dark:text-violet-100">
                      {formatTime(timeLeft)}
                    </span>
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => adjustTime(-1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => adjustTime(1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre de progression cosmique */}
              <div className="mb-6">
                <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="mt-2 text-sm text-violet-600 dark:text-violet-400">
                  {Math.round(progress)}% complété
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                {!isRunning ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startTimer}
                    leftIcon={<Play className="w-5 h-5" />}
                  >
                    Démarrer
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={pauseTimer}
                    leftIcon={<Pause className="w-5 h-5" />}
                  >
                    Pause
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetTimer}
                  leftIcon={<RotateCcw className="w-5 h-5" />}
                >
                  Réinitialiser
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <AnimatePresence>
        {showRating && (
          <SessionRating
            onSubmit={handleSessionRating}
            onClose={() => setShowRating(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimerPage;