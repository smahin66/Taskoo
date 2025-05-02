import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Focus, Maximize2, Minimize2, Plus, Minus, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import Button from '../components/ui/Button';

const FocusPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const gifContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { 
    duration,
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTime
  } = useTimer();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isRunning) {
        event.preventDefault();
        event.returnValue = "Voulez-vous vraiment arrêter de travailler alors que votre timer n'est pas fini ?";
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning]);

  const toggleFullscreen = async () => {
    if (!gifContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await gifContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

  return (
    <div className="relative min-h-screen bg-violet-950">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3"
        loop
      />

      {/* GIF Container */}
      <div 
        ref={gifContainerRef}
        className={`
          relative overflow-hidden
          ${isFullscreen 
            ? 'fixed inset-0 z-50 bg-black' 
            : 'w-full h-[calc(100vh-4rem)]'
          }
        `}
      >
        {/* Background GIF */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://i.pinimg.com/originals/e8/5d/db/e85ddba8a747c4e8c885fa05e4ac3cd7.gif"
            alt="Rain in forest"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Overlay sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Timer en superposition */}
        <div className="absolute top-6 right-6 z-50">
          <div className="text-4xl font-bold text-white text-shadow-lg">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Contrôles */}
        <div className="absolute top-6 left-6 z-50 flex items-center space-x-3">
          {!isRunning ? (
            <Button
              variant="ghost"
              size="lg"
              onClick={startTimer}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <Play className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              onClick={pauseTimer}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <Pause className="w-6 h-6" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="lg"
            onClick={resetTimer}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={toggleFullscreen}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={toggleAudio}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            {isAudioPlaying ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>

        {/* Message de motivation */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-xl px-6 py-3 text-white text-center z-50"
            >
              <p className="text-lg font-medium">Restez concentré...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Style pour l'ombre du texte */}
      <style jsx global>{`
        .text-shadow-lg {
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default FocusPage;