import React, { useMemo } from 'react';
import { MatchEvent } from '../types';
import { EventCard } from './EventCard';
import { History, ArrowDownUp } from 'lucide-react';

interface Props {
  events: MatchEvent[];
  localTeamName: string;
  awayTeamName: string;
}

export const Timeline: React.FC<Props> = ({ events, localTeamName, awayTeamName }) => {
  // Ordenar la línea de tiempo estrictamente por minuto y luego por fecha de creación (Requisito 1)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.minute !== b.minute) {
        return a.minute - b.minute; // Orden cronológico por minuto ascendente
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Desempate por timestamp
    });
  }, [events]);

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Línea de Tiempo del Partido
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          <ArrowDownUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Orden: Minuto & Cronología</span>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <div className="text-4xl mb-3">⏱️</div>
          <p className="text-sm font-medium">Aún no se han registrado eventos para este partido.</p>
          <p className="text-xs text-slate-600 mt-1">Los goles, faltas y cambios aparecerán aquí en vivo por SSE.</p>
        </div>
      ) : (
        <div className="space-y-3 relative">
          {/* Línea vertical decorativa del timeline */}
          <div className="absolute left-[34px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500/50 via-slate-800 to-transparent pointer-events-none -z-0"></div>

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
