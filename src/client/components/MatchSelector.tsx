import React from 'react';
import { Match } from '../types';
import { Trophy, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  matches: Match[];
  selectedMatchId: number | null;
  onSelectMatch: (id: number) => void;
}

export const MatchSelector: React.FC<Props> = ({ matches, selectedMatchId, onSelectMatch }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          <span>Partidos de la Jornada (Selecciona para sintonizar)</span>
        </h2>
        <span className="text-xs text-slate-500 font-medium">{matches.length} partidos activos</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {matches.map((m) => {
          const isSelected = m.id === selectedMatchId;
          const isLive = m.status === 'live';

          return (
            <button
              key={m.id}
              onClick={() => onSelectMatch(m.id)}
              className={`relative text-left p-4 rounded-xl border transition-all duration-200 overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Barra superior de estado */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    isLive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : m.status === 'finished'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                    {isLive ? 'EN VIVO' : m.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO'}
                  </span>
                  {m.period && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {m.period === 'first_half' ? '1er Tiempo' : m.period === 'second_half' ? '2do Tiempo' : m.period === 'halftime' ? 'Entretiempo' : 'Final'}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Sintonizado
                  </span>
                )}
              </div>

              {/* Equipos y Marcador */}
              <div className="space-y-2">
                {/* Local */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                      {m.localTeam.substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {m.localTeam}
                    </span>
                  </div>
                  <span className="font-scoreboard text-2xl font-bold text-emerald-400 tabular-nums">
                    {m.localScore}
                  </span>
                </div>

                {/* Visitante */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                      {m.awayTeam.substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {m.awayTeam}
                    </span>
                  </div>
                  <span className="font-scoreboard text-2xl font-bold text-emerald-400 tabular-nums">
                    {m.awayScore}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
