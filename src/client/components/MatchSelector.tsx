import React from 'react';
import { Match } from '../types';
import { TeamLogo } from './TeamLogo';
import { MatchClockInfo } from '../hooks/useMatchClock';
import { Trophy, CheckCircle2, Flame, Calendar, Timer, Plus } from 'lucide-react';

interface Props {
  matches: Match[];
  selectedMatchId: number | null;
  onSelectMatch: (id: number) => void;
  getMatchClockInfo?: (id: number) => MatchClockInfo;
  onCreateMatchClick?: () => void;
}

export const MatchSelector: React.FC<Props> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
  getMatchClockInfo,
  onCreateMatchClick,
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>Partidos de la Jornada (Haz clic para sintonizar en vivo)</span>
        </h2>
        
        <div className="flex items-center gap-2">
          {onCreateMatchClick && (
            <button
              type="button"
              onClick={onCreateMatchClick}
              className="text-xs text-white font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 py-1 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              title="Crear y programar un nuevo partido"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar Nuevo Partido</span>
            </button>
          )}
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            {matches.length} Partidos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {matches.map((m) => {
          const isSelected = m.id === selectedMatchId;
          const isLive = m.status === 'live';

          return (
            <button
              key={m.id}
              onClick={() => onSelectMatch(m.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 hover:scale-[1.01]'
              }`}
            >
              {/* Barra superior de la tarjeta del partido */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    isLive
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : m.status === 'finished'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {isLive && <Flame className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />}
                    {!isLive && <Calendar className="w-3 h-3" />}
                    {isLive ? 'EN VIVO' : m.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO'}
                  </span>

                  {getMatchClockInfo ? (
                    <span className="text-[10px] text-amber-400 font-digital font-black bg-slate-950 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${getMatchClockInfo(m.id).isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                      <span className="text-slate-400 font-sans font-bold text-[9px]">{getMatchClockInfo(m.id).period}</span>
                      <span className="text-amber-400 tracking-wider tabular-nums font-black">{getMatchClockInfo(m.id).time}</span>
                    </span>
                  ) : (
                    m.period && (
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                        {m.period === 'first_half' ? '1T' : m.period === 'second_half' ? '2T' : m.period === 'halftime' ? 'ET' : 'FIN'}
                      </span>
                    )
                  )}
                </div>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sintonizado
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-semibold group-hover:text-slate-300 transition-colors">
                    Ver partido →
                  </span>
                )}
              </div>

              {/* Equipos con escudos oficiales y marcador */}
              <div className="space-y-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                {/* Equipo Local */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamLogo teamName={m.localTeam} size="sm" />
                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {m.localTeam}
                    </span>
                  </div>
                  <span className="font-digital text-xl font-black text-emerald-400 tabular-nums px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {m.localScore}
                  </span>
                </div>

                {/* Equipo Visitante */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamLogo teamName={m.awayTeam} size="sm" />
                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {m.awayTeam}
                    </span>
                  </div>
                  <span className="font-digital text-xl font-black text-emerald-400 tabular-nums px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
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
