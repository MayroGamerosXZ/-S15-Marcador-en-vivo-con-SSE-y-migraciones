import { useState, useEffect, useRef, useCallback } from 'react';

export interface MatchClockState {
  currentMinute: number;
  currentSecond: number;
  period: 'first_half' | 'halftime' | 'second_half' | 'finished';
  isRunning: boolean;
  formattedTime: string;
  progressPercent: number;
  extraMinutes: number;
  isWaitingForExtraTime: boolean;
  togglePlayPause: () => void;
  resetClock: () => void;
  setSpecificMinute: (min: number) => void;
  assignExtraTime: (minutes: number) => void;
}

interface UseMatchClockOptions {
  onMatchFinished?: () => void;
}

/**
 * Hook de Reloj de Partido Acelerado (90 minutos transcurren en ~2.5 minutos reales)
 * 1 minuto de partido = 1.66 segundos reales (100 segundos por tiempo de 45 minutos)
 *
 * Características solicitadas:
 * 1. Pausa automática en el minuto 90:00 para asignar tiempo extra / agregado.
 * 2. Posibilidad de asignar cuántos minutos extra (+2', +3', +4', +5', etc.).
 * 3. Al cumplirse el tiempo reglamentario + tiempo extra, el partido termina automáticamente.
 * 4. Reinicio limpio a minuto 1 sin eventos pasmados.
 */
export function useMatchClock(
  matchId: number | null,
  initialMinute: number = 1,
  options?: UseMatchClockOptions
): MatchClockState {
  const [currentMinute, setCurrentMinute] = useState<number>(initialMinute);
  const [currentSecond, setCurrentSecond] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [period, setPeriod] = useState<'first_half' | 'halftime' | 'second_half' | 'finished'>('first_half');
  const [extraMinutes, setExtraMinutes] = useState<number>(0);
  const [isWaitingForExtraTime, setIsWaitingForExtraTime] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Reiniciar o ajustar cuando cambia el partido
  useEffect(() => {
    if (!matchId) return;
    setCurrentMinute(initialMinute > 0 ? initialMinute : 1);
    setCurrentSecond(0);
    setExtraMinutes(0);
    setIsWaitingForExtraTime(false);
    setIsRunning(true);
    setPeriod(initialMinute >= 45 ? 'second_half' : 'first_half');
  }, [matchId]);

  // Manejo del avance del reloj acelerado
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Intervalo de actualización: cada 28ms avanza 1 segundo de partido simulado
    // 60 segundos de partido = 1680ms reales (~1.68 segundos)
    const tickMs = 28;

    intervalRef.current = setInterval(() => {
      setCurrentSecond((prevSec) => {
        if (prevSec >= 59) {
          // Ha transcurrido un minuto completo
          setCurrentMinute((prevMin) => {
            const nextMin = prevMin + 1;

            // Gestión de períodos
            if (nextMin === 45) {
              setPeriod('halftime');
            } else if (nextMin >= 46 && nextMin < 90) {
              setPeriod('second_half');
            } else if (nextMin === 90) {
              // AL LLEGAR A LOS 90 MINUTOS:
              // Si aún no se ha asignado tiempo extra, pausar automáticamente y activar la solicitud
              if (extraMinutes === 0) {
                setIsRunning(false);
                setIsWaitingForExtraTime(true);
                return 90;
              }
            }

            // Si ya hay tiempo extra asignado y se alcanza el límite (90 + extraMinutes)
            const targetEndMinute = 90 + extraMinutes;
            if (nextMin >= targetEndMinute && extraMinutes > 0) {
              setIsRunning(false);
              setPeriod('finished');
              setIsWaitingForExtraTime(false);
              optionsRef.current?.onMatchFinished?.();
              return targetEndMinute;
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
  }, [isRunning, extraMinutes]);

  const togglePlayPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetClock = useCallback(() => {
    setCurrentMinute(1);
    setCurrentSecond(0);
    setExtraMinutes(0);
    setIsWaitingForExtraTime(false);
    setPeriod('first_half');
    setIsRunning(true);
  }, []);

  const setSpecificMinute = useCallback((min: number) => {
    setCurrentMinute(min);
    setCurrentSecond(0);
    if (min < 45) {
      setPeriod('first_half');
      setIsWaitingForExtraTime(false);
      setIsRunning(true);
    } else if (min === 45) {
      setPeriod('halftime');
      setIsWaitingForExtraTime(false);
      setIsRunning(true);
    } else if (min < 90) {
      setPeriod('second_half');
      setIsWaitingForExtraTime(false);
      setIsRunning(true);
    } else if (min === 90 && extraMinutes === 0) {
      setIsWaitingForExtraTime(true);
      setIsRunning(false);
    } else {
      setPeriod('finished');
      setIsRunning(false);
    }
  }, [extraMinutes]);

  /**
   * Asignar tiempo extra cuando el partido llega a los 90 minutos
   * @param minutes Cantidad de minutos agregados (+1, +2, +3, +4, +5, etc.)
   */
  const assignExtraTime = useCallback((minutes: number) => {
    if (minutes <= 0) {
      // Finalizar sin tiempo extra
      setExtraMinutes(0);
      setIsWaitingForExtraTime(false);
      setPeriod('finished');
      setIsRunning(false);
      optionsRef.current?.onMatchFinished?.();
      return;
    }

    setExtraMinutes(minutes);
    setIsWaitingForExtraTime(false);
    setPeriod('second_half');
    setIsRunning(true); // Reanudar el reloj para que transcurra el tiempo añadido
  }, []);

  // Formato digital con visualización de tiempo extra
  let formattedTime = '';
  if (currentMinute >= 90) {
    if (extraMinutes > 0) {
      formattedTime = `${currentMinute}:${String(currentSecond).padStart(2, '0')} (+${extraMinutes}')`;
    } else {
      formattedTime = `90:00`;
    }
  } else {
    formattedTime = `${String(currentMinute).padStart(2, '0')}:${String(currentSecond).padStart(2, '0')}`;
  }

  const maxMinutes = 90 + (extraMinutes > 0 ? extraMinutes : 0);
  const progressPercent = Math.min(100, Math.round((currentMinute / maxMinutes) * 100));

  return {
    currentMinute,
    currentSecond,
    period,
    isRunning,
    formattedTime,
    progressPercent,
    extraMinutes,
    isWaitingForExtraTime,
    togglePlayPause,
    resetClock,
    setSpecificMinute,
    assignExtraTime,
  };
}
