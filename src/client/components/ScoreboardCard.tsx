import React from 'react';
import { Match, ConnectionStatus } from '../types';
import { ConnectionBadge } from './ConnectionBadge';
import { Shield, Clock, Flame } from 'lucide-react';

interface Props {
  match: Match | null;
  connectionStatus: ConnectionStatus;
  eventsCount: number;
}

export const ScoreboardCard: React.FC<Props> = ({ match, connectionStatus, eventsCount }) => {
  if (!match) {
    return (
      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
        <p className="text-slate-400">Selecciona un partido para visualizar el marcador en vivo.</p>
      </div>
    );
  }

  const isLive = match.status === 'live';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl scoreboard-glow">
      {/* Luz ambiental de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

      {/* Barra superior con Estado SSE y Estado del Partido */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
            isLive
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : match.status === 'finished'
              ? 'bg-slate-700 text-slate-300'
              : 'bg-blue-600 text-white'
          }`}>
            {isLive && <Flame className="w-3.5 h-3.5 animate-bounce" />}
            {isLive ? 'EN VIVO' : match.status === 'finished' ? 'FINALIZADO' : 'PRÓXIMO'}
          </span>

          <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            {match.period === 'first_half' && 'Primer Tiempo (1T)'}
            {match.period === 'second_half' && 'Segundo Tiempo (2T)'}
            {match.period === 'halftime' && 'Medio Tiempo'}
            {match.period === 'extra_time' && 'Tiempo Extra'}
            {match.period === 'finished' && 'Tiempo Cumplido'}
            {!match.period && 'En Juego'}
          </span>
        </div>

        {/* Badge obligatorio de estado de conexión SSE */}
        <ConnectionBadge status={connectionStatus} matchId={match.id} />
      </div>

      {/* Marcador Central Estilo Transmisión Deportiva */}
      <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6 py-4">
        {/* Equipo Local */}
        <div className="md:col-span-3 flex flex-col md:flex-row items-center gap-4 text-center md:text-right md:justify-end">
          <div className="order-2 md:order-1">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">{match.localTeam}</h3>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Equipo Local</span>
          </div>
          <div className="order-1 md:order-2 w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-600/20 border-2 border-emerald-400/30">
            {match.localTeam.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Display del Marcador Central */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="bg-slate-950/90 px-6 py-2 rounded-2xl border-2 border-slate-700/80 shadow-2xl flex items-center gap-3">
            <span className="font-scoreboard text-5xl sm:text-6xl font-black text-emerald-400 tabular-nums">
              {match.localScore}
            </span>
            <span className="font-scoreboard text-3xl font-light text-slate-500">:</span>
            <span className="font-scoreboard text-5xl sm:text-6xl font-black text-emerald-400 tabular-nums">
              {match.awayScore}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            {eventsCount} eventos registrados
          </span>
        </div>

        {/* Equipo Visitante */}
        <div className="md:col-span-3 flex flex-col md:flex-row items-center gap-4 text-center md:text-left md:justify-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-600/20 border-2 border-blue-400/30">
            {match.awayTeam.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">{match.awayTeam}</h3>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Equipo Visitante</span>
          </div>
        </div>
      </div>
    </div>
  );
};
