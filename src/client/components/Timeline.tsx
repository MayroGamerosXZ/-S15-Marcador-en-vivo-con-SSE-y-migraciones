import React, { useMemo } from 'react';
import { MatchEvent } from '../types';
import { EventCard } from './EventCard';
import { History, ArrowDownUp, Clock, Zap } from 'lucide-react';

interface Props {
  events: MatchEvent[];
  localTeamName: string;
  awayTeamName: string;
}

export const Timeline: React.FC<Props> = ({ events, localTeamName, awayTeamName }) => {
  // Ordenar la línea de tiempo estrictamente por minuto y por fecha de creación (Requisito 1)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.minute !== b.minute) {
        return a.minute - b.minute; // Orden cronológico de juego
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Desempate por timestamp
    });
  }, [events]);

  return (
    <div className="stadium-border rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-700/70">
      <div className="flex flex-wrap items-center justify-between pb-5 mb-5 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider font-scoreboard leading-tight">
              Línea de Tiempo del Encuentro
            </h3>
            <p className="text-xs text-slate-400">
              Cronología de goles, amonestaciones y cambios transmitidos por SSE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-700 shadow-inner">
          <ArrowDownUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Orden: Minuto & Timestamp</span>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <div className="text-5xl mb-3 animate-pulse">⏱️</div>
          <p className="text-base font-bold text-slate-300">Aún no hay incidencias registradas en este partido.</p>
          <p className="text-xs text-slate-500 mt-1">Los goles y tarjetas aparecerán aquí en vivo tan pronto ocurran.</p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          {/* Línea vertical central brillante */}
          <div className="hidden sm:block absolute left-[32px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/60 via-slate-700 to-transparent pointer-events-none"></div>

          {sortedEvents.map((evt) => (
            <div key={evt.id} className="relative z-10">
              <EventCard
                event={evt}
                localTeamName={localTeamName}
                awayTeamName={awayTeamName}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
