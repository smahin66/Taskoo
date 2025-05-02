import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFocusStore } from '../stores/focusStore';
import toast from 'react-hot-toast';

interface TimerContextType {
  duration: number;
  timeLeft: number;
  isRunning: boolean;
  startTime: number | null;
  showRating: boolean;
  setShowRating: (show: boolean) => void;
  setDuration: (duration: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  adjustTime: (minutes: number) => void;
  handleSessionRating: (rating: number, notes: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [duration, setDuration] = useState(() => {
    const saved = localStorage.getItem('timer_duration');
    return saved ? parseInt(saved, 10) : 25 * 60;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('timer_timeLeft');
    return saved ? parseInt(saved, 10) : duration;
  });
  const [isRunning, setIsRunning] = useState(() => {
    return localStorage.getItem('timer_isRunning') === 'true';
  });
  const [startTime, setStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('timer_startTime');
    return saved ? parseInt(saved, 10) : null;
  });
  const [showRating, setShowRating] = useState(false);

  const { addFocusMinutes, setActive } = useFocusStore();

  useEffect(() => {
    let interval: number;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        const newTimeLeft = Math.max(0, timeLeft - 1);
        setTimeLeft(newTimeLeft);
        localStorage.setItem('timer_timeLeft', newTimeLeft.toString());

        if (timeLeft % 60 === 0 && timeLeft > 0) {
          addFocusMinutes(1);
        }

        if (newTimeLeft === 0) {
          const minutesCompleted = Math.floor(duration / 60);
          addFocusMinutes(minutesCompleted);
          
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
          
          toast.success('Une nouvelle planète a été découverte dans votre système solaire !');
          setIsRunning(false);
          setActive(false);
          setShowRating(true);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, duration, addFocusMinutes, setActive]);

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setActive(true);
    localStorage.setItem('timer_isRunning', 'true');
    localStorage.setItem('timer_startTime', Date.now().toString());
    toast.success('Le travail commence');
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setActive(false);
    localStorage.setItem('timer_isRunning', 'false');
    toast.success('Voyage en pause');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setStartTime(null);
    setActive(false);
    setShowRating(false);
    localStorage.setItem('timer_isRunning', 'false');
    localStorage.setItem('timer_timeLeft', duration.toString());
    localStorage.setItem('timer_startTime', '');
    toast.success('Retour au point de départ');
  };

  const adjustTime = (minutes: number) => {
    const newTime = Math.max(0, timeLeft + (minutes * 60));
    setTimeLeft(newTime);
    if (!isRunning) {
      setDuration(newTime);
      localStorage.setItem('timer_duration', newTime.toString());
    }
    localStorage.setItem('timer_timeLeft', newTime.toString());
  };

  const handleSetDuration = (newDuration: number) => {
    setDuration(newDuration);
    setTimeLeft(newDuration);
    localStorage.setItem('timer_duration', newDuration.toString());
    localStorage.setItem('timer_timeLeft', newDuration.toString());
  };

  const handleSessionRating = (rating: number, notes: string) => {
    const ratings = JSON.parse(localStorage.getItem('session_ratings') || '[]');
    ratings.push({
      date: new Date().toISOString(),
      duration: duration,
      rating,
      notes,
    });
    localStorage.setItem('session_ratings', JSON.stringify(ratings));
    
    setShowRating(false);
    toast.success('Merci pour votre évaluation !');
  };

  return (
    <TimerContext.Provider
      value={{
        duration,
        timeLeft,
        isRunning,
        startTime,
        showRating,
        setShowRating,
        setDuration: handleSetDuration,
        startTimer,
        pauseTimer,
        resetTimer,
        adjustTime,
        handleSessionRating,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};