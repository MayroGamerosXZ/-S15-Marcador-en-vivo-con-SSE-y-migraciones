import { useState, useEffect, useRef } from 'react';

export interface MatchClockState {
  currentMinute: number;
  currentSecond: number;
  period: 'first_half' | 'halftime' | 'second_half' | 'finished';
  isRunning: boolean;
  formattedTime: string;
  progressPercent: number;
  togglePlayPause: () => void;
  resetClock: () => void;
  setSpecificMinute: (min: number) => void;
}

/**
 * Hook de Reloj de Partido Acelerado (90 minutos transcurren en ~2.5 minutos reales)
 * 1 minuto de partido = 1.66 segundos reales (100 segundos por tiempo de 45 minutos)
 */
export function useMatchClock(matchId: number | null, initialMinute: number = 1): MatchClockState {
  // Minuto actual del partido (1 a 90+)
  const [currentMinute, setCurrentMinute] = useState<number>(initialMinute);
  const [currentSecond, setCurrentSecond] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [period, setPeriod] = useState<'first_half' | 'halftime' | 'second_half' | 'finished'>('first_half');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reiniciar o ajustar cuando cambia el partido
  useEffect(() => {
    if (!matchId) return;
    setCurrentMinute(initialMinute > 0 ? initialMinute : 1);
    setCurrentSecond(0);
    setIsRunning(true);
    setPeriod(initialMinute >= 45 ? 'second_half' : 'first_half');
  }, [matchId]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Intervalo de actualización: cada 27.7ms avanza 1 segundo de partido de fútbol simulado
    // 60 segundos de partido = 1666ms reales (~1.66 segundos)
    const tickMs = 28;

    intervalRef.current = setInterval(() => {
      setCurrentSecond((prevSec) => {
        if (prevSec >= 59) {
          setCurrentMinute((prevMin) => {
            const nextMin = prevMin + 1;

            if (nextMin === 45) {
              setPeriod('halftime');
            } else if (nextMin >= 46 && nextMin < 90) {
              setPeriod('second_half');
            } else if (nextMin >= 90) {
              setPeriod('finished');
            }

            return nextMin;
          });
          return 0;
        }
        return prevSec + 1;
      });
    }, tickMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const togglePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  const resetClock = () => {
    setCurrentMinute(1);
    setCurrentSecond(0);
    setPeriod('first_half');
    setIsRunning(true);
  };

  const setSpecificMinute = (min: number) => {
    setCurrentMinute(min);
    setCurrentSecond(0);
    if (min < 45) setPeriod('first_half');
    else if (min === 45) setPeriod('halftime');
    else if (min < 90) setPeriod('second_half');
    else setPeriod('finished');
  };

  const formattedTime = `${String(Math.min(currentMinute, 90)).padStart(2, '0')}:${String(currentSecond).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.round((currentMinute / 90) * 100));

  return {
    currentMinute,
    currentSecond,
    period,
    isRunning,
    formattedTime,
    progressPercent,
    togglePlayPause,
    resetClock,
    setSpecificMinute,
  };
}
