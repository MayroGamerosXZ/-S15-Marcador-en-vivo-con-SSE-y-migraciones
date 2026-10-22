import React from 'react';
import { Match, ConnectionStatus } from '../types';
import { MatchClockState } from '../hooks/useMatchClock';
import { ConnectionBadge } from './ConnectionBadge';
import { TeamLogo } from './TeamLogo';
import { Flame, Clock, Radio, Trophy, Activity, Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface Props {
  match: Match | null;
  connectionStatus: ConnectionStatus;
  eventsCount: number;
  onReconnect?: () => void;
  matchClock?: MatchClockState;
}

export const ScoreboardCard: React.FC<Props> = ({
  match,
  connectionStatus,
  eventsCount,
  onReconnect,
  matchClock
}) => {
  if (!match) {
    return (
      <div className="p-12 text-center stadium-border rounded-3xl">
        <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
        <p className="text-slate-300 text-base font-semibold">Selecciona un partido del fixture para sintonizar la transmisión en vivo.</p>
      </div>
    );
  }

  const isLive = match.status === 'live';

  // Configuración de atmósfera de color según los equipos
  const getTeamColorStyle = (teamName: string) => {
    const norm = teamName.toLowerCase();
    if (norm.includes('madrid')) return { bg: 'from-amber-500/10 to-transparent', text: 'text-amber-300', border: 'border-amber-500/30' };
    if (norm.includes('barcelona') || norm.includes('barça')) return { bg: 'from-rose-900/30 to-blue-900/30', text: 'text-rose-400', border: 'border-rose-500/30' };
    if (norm.includes('city')) return { bg: 'from-sky-500/20 to-transparent', text: 'text-sky-300', border: 'border-sky-500/30' };
    if (norm.includes('liverpool')) return { bg: 'from-red-600/20 to-transparent', text: 'text-red-400', border: 'border-red-500/30' };
    if (norm.includes('bayern')) return { bg: 'from-red-600/20 to-transparent', text: 'text-red-400', border: 'border-red-500/30' };
    if (norm.includes('dortmund')) return { bg: 'from-yellow-500/20 to-transparent', text: 'text-yellow-300', border: 'border-yellow-500/30' };
    return { bg: 'from-emerald-500/10 to-transparent', text: 'text-emerald-300', border: 'border-emerald-500/30' };
  };

  const localStyle = getTeamColorStyle(match.localTeam);
  const awayStyle = getTeamColorStyle(match.awayTeam);

  return (
    <div className="relative overflow-hidden rounded-3xl stadium-border p-6 sm:p-8 shadow-2xl border border-slate-700/60">
      {/* Luces y reflectores de fondo */}
      <div className="absolute -top-16 left-1/4 w-96 h-36 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute -top-16 right-1/4 w-96 h-36 bg-blue-500/15 blur-3xl rounded-full pointer-events-none"></div>

      {/* Barra superior de transmisión */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge de Estado del Partido */}
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-lg ${
            isLive
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/30 animate-pulse'
              : match.status === 'finished'
              ? 'bg-slate-800 text-slate-300'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
          }`}>
            {isLive ? <Flame className="w-4 h-4 fill-white" /> : <Clock className="w-4 h-4" />}
            {isLive ? 'EN VIVO' : match.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO'}
          </span>

          {/* Reloj Dinámico de Partido Acelerado (90 min en ~2.5 min) */}
          {matchClock && (
            <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-inner">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-digital text-amber-400 font-black text-sm tracking-widest tabular-nums">
                {matchClock.formattedTime}
              </span>
              <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                {matchClock.currentMinute}'
              </span>
              <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                <button
                  type="button"
                  onClick={matchClock.togglePlayPause}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-all"
                  title={matchClock.isRunning ? 'Pausar Reloj' : 'Reanudar Reloj'}
                >
                  {matchClock.isRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={matchClock.resetClock}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-all"
                  title="Reiniciar a Minuto 1'"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Período */}
          <span className="text-xs font-bold text-slate-200 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5 shadow-inner">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            {matchClock
              ? (matchClock.period === 'first_half' ? '1er Tiempo (1T)' : matchClock.period === 'halftime' ? 'Entretiempo (HT)' : matchClock.period === 'second_half' ? '2do Tiempo (2T)' : 'Finalizado')
              : (match.period === 'first_half' ? '1er Tiempo (1T)' : match.period === 'second_half' ? '2do Tiempo (2T)' : match.period === 'halftime' ? 'Entretiempo' : 'En Juego')}
          </span>
        </div>

        {/* Badge Oficial SSE */}
        <ConnectionBadge status={connectionStatus} matchId={match.id} onReconnect={onReconnect} />
      </div>

      {/* Escenario Central: Escudo Local, Marcador LED y Escudo Visitante */}
      <div className="grid grid-cols-1 lg:grid-cols-11 items-center gap-6 py-4">
        {/* Equipo Local */}
        <div className={`lg:col-span-4 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right sm:justify-end p-4 rounded-2xl bg-gradient-to-l ${localStyle.bg} border ${localStyle.border}`}>
          <div className="order-2 sm:order-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase font-scoreboard">
              {match.localTeam}
            </h2>
            <div className="flex items-center justify-center sm:justify-end gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Local</span>
            </div>
          </div>
          <div className="order-1 sm:order-2">
            <TeamLogo teamName={match.localTeam} size="xl" />
          </div>
        </div>

        {/* Pantalla LED del Marcador Central */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center">
          <div className="relative scoreboard-led px-8 py-4 rounded-3xl flex items-center justify-center gap-4 sm:gap-6">
            {/* Goles Local */}
            <div className="flex flex-col items-center">
              <span className="font-digital text-5xl sm:text-7xl font-black text-emerald-400 tabular-nums led-number">
                {match.localScore}
              </span>
            </div>

            {/* Separador Central Destellante */}
            <div className="flex flex-col items-center justify-center pb-2">
              <span className="font-digital text-3xl sm:text-5xl font-black text-slate-500 animate-pulse">
                :
              </span>
            </div>

            {/* Goles Visitante */}
            <div className="flex flex-col items-center">
              <span className="font-digital text-5xl sm:text-7xl font-black text-emerald-400 tabular-nums led-number">
                {match.awayScore}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-semibold text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Transmisión Oficial SSE • {eventsCount} incidencias</span>
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className={`lg:col-span-4 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left sm:justify-start p-4 rounded-2xl bg-gradient-to-r ${awayStyle.bg} border ${awayStyle.border}`}>
          <div className="order-1">
            <TeamLogo teamName={match.awayTeam} size="xl" />
          </div>
          <div className="order-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase font-scoreboard">
              {match.awayTeam}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Visitante</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
