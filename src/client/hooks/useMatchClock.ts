import { useState, useEffect, useRef, useCallback } from 'react';

export interface SingleMatchClockState {
  matchId: number;
  currentMinute: number;
  currentSecond: number;
  period: 'first_half' | 'halftime' | 'second_half' | 'finished';
  isRunning: boolean;
  extraMinutes: number;
  isWaitingForExtraTime: boolean;
}

export interface MatchClockInfo {
  time: string;
  minute: number;
  second: number;
  isRunning: boolean;
  period: string;
}

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
  getMatchClockInfo: (matchId: number) => MatchClockInfo;
}

interface UseMatchClockOptions {
  onMatchFinished?: (matchId: number) => void;
}

/**
 * Formateador de tiempo digital (ej: "30:05", "90:12 (+3')")
 */
export function formatClockTime(minute: number, second: number, extraMinutes: number = 0): string {
  if (minute >= 90) {
    if (extraMinutes > 0) {
      return `${minute}:${String(second).padStart(2, '0')} (+${extraMinutes}')`;
    }
    return `90:00`;
  }
  return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

// Estado inicial con relojes independientes escalonados para la jornada
const DEFAULT_INITIAL_CLOCKS: Record<number, SingleMatchClockState> = {
  1: {
    matchId: 1,
    currentMinute: 30,
    currentSecond: 5,
    period: 'first_half',
    isRunning: true,
    extraMinutes: 0,
    isWaitingForExtraTime: false,
  },
  2: {
    matchId: 2,
    currentMinute: 18,
    currentSecond: 20,
    period: 'first_half',
    isRunning: true,
    extraMinutes: 0,
    isWaitingForExtraTime: false,
  },
  3: {
    matchId: 3,
    currentMinute: 5,
    currentSecond: 10,
    period: 'first_half',
    isRunning: true,
    extraMinutes: 0,
    isWaitingForExtraTime: false,
  },
};

/**
 * Hook de Reloj Multipartido Concurrente e Independiente
 *
 * Características clave:
 * 1. Cada partido tiene su propio cronómetro avanzando continuamente en segundo plano.
 * 2. Cambiar de partido NO resetea ni congela el reloj del partido anterior.
 * 3. Al volver a un partido, este ha seguido avanzando de forma natural e independiente.
 * 4. Pausa automática en el minuto 90:00 solo para el partido que alcanza los 90'.
 * 5. Asignación de tiempo extra independiente por partido.
 */
export function useMatchClock(
  selectedMatchId: number | null,
  initialMinute: number = 1,
  options?: UseMatchClockOptions
): MatchClockState {
  const [clocks, setClocks] = useState<Record<number, SingleMatchClockState>>(DEFAULT_INITIAL_CLOCKS);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Asegurar que cualquier partido nuevo tenga su propio reloj sin sobreescribir los existentes
  useEffect(() => {
    if (!selectedMatchId) return;

    setClocks((prev) => {
      if (prev[selectedMatchId]) return prev; // Ya existe y está corriendo, NO resetear
      return {
        ...prev,
        [selectedMatchId]: {
          matchId: selectedMatchId,
          currentMinute: initialMinute > 0 ? initialMinute : 1,
          currentSecond: 0,
          period: initialMinute >= 45 ? 'second_half' : 'first_half',
          isRunning: true,
          extraMinutes: 0,
          isWaitingForExtraTime: false,
        },
      };
    });
  }, [selectedMatchId, initialMinute]);

  // Motor central de reloj acelerado: avanza TODOS los partidos activos en paralelo
  useEffect(() => {
    // 28ms por segundo simulado (~1.68s reales por cada minuto de partido)
    const tickMs = 28;

    intervalRef.current = setInterval(() => {
      setClocks((prevClocks) => {
        let hasActiveClock = false;
        const nextClocks: Record<number, SingleMatchClockState> = {};

        for (const idStr of Object.keys(prevClocks)) {
          const id = Number(idStr);
          const clock = prevClocks[id];

          if (!clock.isRunning) {
            nextClocks[id] = clock;
            continue;
          }

          hasActiveClock = true;

          if (clock.currentSecond >= 59) {
            const nextMin = clock.currentMinute + 1;
            let nextPeriod: 'first_half' | 'halftime' | 'second_half' | 'finished' = clock.period;
            let nextIsRunning: boolean = clock.isRunning;
            let nextWaiting: boolean = clock.isWaitingForExtraTime;

            if (nextMin === 45) {
              nextPeriod = 'halftime';
            } else if (nextMin >= 46 && nextMin < 90) {
              nextPeriod = 'second_half';
            } else if (nextMin === 90) {
              // Pausa automática a los 90 minutos para asignar tiempo extra
              if (clock.extraMinutes === 0) {
                nextIsRunning = false;
                nextWaiting = true;
                nextClocks[id] = {
                  ...clock,
                  currentMinute: 90,
                  currentSecond: 0,
                  isRunning: false,
                  isWaitingForExtraTime: true,
                  period: 'second_half',
                };
                continue;
              }
            }

            // Fin de tiempo reglamentario + tiempo extra
            const targetEndMinute = 90 + clock.extraMinutes;
            if (clock.extraMinutes > 0 && nextMin >= targetEndMinute) {
              nextClocks[id] = {
                ...clock,
                currentMinute: targetEndMinute,
                currentSecond: 0,
                isRunning: false,
                period: 'finished',
                isWaitingForExtraTime: false,
              };
              optionsRef.current?.onMatchFinished?.(id);
              continue;
            }

            nextClocks[id] = {
              ...clock,
              currentMinute: nextMin,
              currentSecond: 0,
              period: nextPeriod,
              isRunning: nextIsRunning,
              isWaitingForExtraTime: nextWaiting,
            };
          } else {
            nextClocks[id] = {
              ...clock,
              currentSecond: clock.currentSecond + 1,
            };
          }
        }

        return hasActiveClock ? nextClocks : prevClocks;
      });
    }, tickMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Pausar / Reanudar únicamente el partido seleccionado
  const togglePlayPause = useCallback(() => {
    if (!selectedMatchId) return;
    setClocks((prev) => {
      const cur = prev[selectedMatchId];
      if (!cur) return prev;
      return {
        ...prev,
        [selectedMatchId]: {
          ...cur,
          isRunning: !cur.isRunning,
        },
      };
    });
  }, [selectedMatchId]);

  // Reiniciar a minuto 1 únicamente el partido seleccionado
  const resetClock = useCallback(() => {
    if (!selectedMatchId) return;
    setClocks((prev) => {
      const cur = prev[selectedMatchId];
      if (!cur) return prev;
      return {
        ...prev,
        [selectedMatchId]: {
          ...cur,
          currentMinute: 1,
          currentSecond: 0,
          period: 'first_half',
          extraMinutes: 0,
          isWaitingForExtraTime: false,
          isRunning: true,
        },
      };
    });
  }, [selectedMatchId]);

  // Saltar a minuto específico únicamente en el partido seleccionado (ej: 89' para pruebas)
  const setSpecificMinute = useCallback((min: number) => {
    if (!selectedMatchId) return;
    setClocks((prev) => {
      const cur = prev[selectedMatchId];
      if (!cur) return prev;

      let period = cur.period;
      let isWaiting = false;
      let isRunning = true;

      if (min < 45) {
        period = 'first_half';
      } else if (min === 45) {
        period = 'halftime';
      } else if (min < 90) {
        period = 'second_half';
      } else if (min === 90 && cur.extraMinutes === 0) {
        isWaiting = true;
        isRunning = false;
      } else {
        period = 'finished';
        isRunning = false;
      }

      return {
        ...prev,
        [selectedMatchId]: {
          ...cur,
          currentMinute: min,
          currentSecond: 0,
          period,
          isWaitingForExtraTime: isWaiting,
          isRunning,
        },
      };
    });
  }, [selectedMatchId]);

  // Asignar tiempo extra únicamente al partido seleccionado
  const assignExtraTime = useCallback((minutes: number) => {
    if (!selectedMatchId) return;
    setClocks((prev) => {
      const cur = prev[selectedMatchId];
      if (!cur) return prev;

      if (minutes <= 0) {
        optionsRef.current?.onMatchFinished?.(selectedMatchId);
        return {
          ...prev,
          [selectedMatchId]: {
            ...cur,
            extraMinutes: 0,
            isWaitingForExtraTime: false,
            period: 'finished',
            isRunning: false,
          },
        };
      }

      return {
        ...prev,
        [selectedMatchId]: {
          ...cur,
          extraMinutes: minutes,
          isWaitingForExtraTime: false,
          period: 'second_half',
          isRunning: true,
        },
      };
    });
  }, [selectedMatchId]);

  // Obtener estado del reloj para cualquier partido (usado en MatchSelector para mostrar los tiempos en vivo)
  const getMatchClockInfo = useCallback(
    (matchId: number): MatchClockInfo => {
      const c = clocks[matchId];
      if (!c) {
        return {
          time: '01:00',
          minute: 1,
          second: 0,
          isRunning: true,
          period: '1T',
        };
      }
      const periodLabel =
        c.period === 'first_half'
          ? '1T'
          : c.period === 'halftime'
          ? 'ET'
          : c.period === 'second_half'
          ? c.extraMinutes > 0
            ? `2T+${c.extraMinutes}'`
            : '2T'
          : 'FIN';

      return {
        time: formatClockTime(c.currentMinute, c.currentSecond, c.extraMinutes),
        minute: c.currentMinute,
        second: c.currentSecond,
        isRunning: c.isRunning,
        period: periodLabel,
      };
    },
    [clocks]
  );

  // Reloj del partido actualmente seleccionado
  const activeClock = (selectedMatchId && clocks[selectedMatchId]) || {
    matchId: selectedMatchId || 1,
    currentMinute: 1,
    currentSecond: 0,
    period: 'first_half' as const,
    isRunning: true,
    extraMinutes: 0,
    isWaitingForExtraTime: false,
  };

  const formattedTime = formatClockTime(
    activeClock.currentMinute,
    activeClock.currentSecond,
    activeClock.extraMinutes
  );

  const maxMinutes = 90 + (activeClock.extraMinutes > 0 ? activeClock.extraMinutes : 0);
  const progressPercent = Math.min(100, Math.round((activeClock.currentMinute / maxMinutes) * 100));

  return {
    currentMinute: activeClock.currentMinute,
    currentSecond: activeClock.currentSecond,
    period: activeClock.period,
    isRunning: activeClock.isRunning,
    formattedTime,
    progressPercent,
    extraMinutes: activeClock.extraMinutes,
    isWaitingForExtraTime: activeClock.isWaitingForExtraTime,
    togglePlayPause,
    resetClock,
    setSpecificMinute,
    assignExtraTime,
    getMatchClockInfo,
  };
}
