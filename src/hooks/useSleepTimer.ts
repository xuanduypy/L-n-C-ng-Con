import { useState, useEffect, useRef, useCallback } from 'react';

export type SleepTimerOption = null | 15 | 30 | 45 | 60 | 'end_of_content';

interface UseSleepTimerProps {
  onTimerEnd: () => void;
}

export function useSleepTimer({ onTimerEnd }: UseSleepTimerProps) {
  const [timerOption, setTimerOption] = useState<SleepTimerOption>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Clear running countdown
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerOption(null);
    setSecondsRemaining(null);
  }, []);

  // Set timer to a specific option
  const setTimer = useCallback((option: SleepTimerOption) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerOption(option);

    if (option === null) {
      setSecondsRemaining(null);
      return;
    }

    if (option === 'end_of_content') {
      setSecondsRemaining(null);
      return;
    }

    // Number of minutes
    const totalSec = option * 60;
    setSecondsRemaining(totalSec);
  }, []);

  // Handle countdown tick
  useEffect(() => {
    if (typeof timerOption === 'number' && secondsRemaining !== null && secondsRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            setTimerOption(null);
            onTimerEnd();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [timerOption, secondsRemaining, onTimerEnd]);

  // Hook for when a chapter or track finishes
  const handleContentEnded = useCallback(() => {
    if (timerOption === 'end_of_content') {
      clearTimer();
      onTimerEnd();
      return true;
    }
    return false;
  }, [timerOption, clearTimer, onTimerEnd]);

  // Formatter for countdown (mm:ss)
  const formatRemaining = useCallback((): string => {
    if (timerOption === 'end_of_content') return 'Hết bài';
    if (secondsRemaining === null) return '';
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, [timerOption, secondsRemaining]);

  return {
    timerOption,
    secondsRemaining,
    setTimer,
    clearTimer,
    handleContentEnded,
    formattedTime: formatRemaining(),
    isActive: timerOption !== null,
  };
}
