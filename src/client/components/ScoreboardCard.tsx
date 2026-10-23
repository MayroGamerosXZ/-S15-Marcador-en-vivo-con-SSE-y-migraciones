import React, { useState } from 'react';
import { Match, ConnectionStatus } from '../types';
import { MatchClockState } from '../hooks/useMatchClock';
import { ConnectionBadge } from './ConnectionBadge';
import { TeamLogo } from './TeamLogo';
import {
  Flame,
  Clock,
  Radio,
  Trophy,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle2,
  FastForward
} from 'lucide-react';

interface Props {
  match: Match | null;
  connectionStatus: ConnectionStatus;
  eventsCount: number;
  onReconnect?: () => void;
  matchClock?: MatchClockState;
  onResetMatch?: () => Promise<void> | void;
  onStartMatch?: () => Promise<void> | void;
}

export const ScoreboardCard: React.FC<Props> = ({
  match,
  connectionStatus,
  eventsCount,
  onReconnect,
  matchClock,
  onResetMatch,
  onStartMatch,
}) => {
  const [customExtra, setCustomExtra] = useState<string>('3');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  if (!match) {
    return (
      <div className="p-12 text-center stadium-border rounded-3xl">
        <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
        <p className="text-slate-300 text-base font-semibold">
          Selecciona un partido del fixture para sintonizar la transmisión en vivo.
        </p>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished' || matchClock?.period === 'finished';

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

  const handleResetMatch = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      if (onResetMatch) {
        await onResetMatch();
      }
      if (matchClock) {
        matchClock.resetClock();
      }
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    } catch (err) {
      console.error('Error al reiniciar:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCustomExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customExtra, 10);
    if (!isNaN(val) && matchClock) {
      matchClock.assignExtraTime(val);
    }
  };

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
            isFinished
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : isLive
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/30 animate-pulse'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
          }`}>
            {isFinished ? (
              <>🏁 FINALIZADO</>
            ) : isLive ? (
              <>
                <Flame className="w-4 h-4 fill-white" /> EN VIVO
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" /> PROGRAMADO
              </>
            )}
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
                  onClick={() => matchClock.resetClock()}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-all"
                  title="Reiniciar Reloj a 1'"
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
              ? (matchClock.period === 'first_half'
                  ? '1er Tiempo (1T)'
                  : matchClock.period === 'halftime'
                  ? 'Entretiempo (HT)'
                  : matchClock.period === 'second_half'
                  ? (matchClock.extraMinutes > 0 ? `2T +${matchClock.extraMinutes}' Extra` : '2do Tiempo (2T)')
                  : 'Finalizado')
              : (match.period === 'first_half'
                  ? '1er Tiempo (1T)'
                  : match.period === 'second_half'
                  ? '2do Tiempo (2T)'
                  : match.period === 'halftime'
                  ? 'Entretiempo'
                  : 'En Juego')}
          </span>

          {/* Atajos de prueba rápida para evaluación (1', 45', 89') */}
          {matchClock && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-full text-[11px] text-slate-400">
              <FastForward className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Saltar:</span>
              <button
                type="button"
                onClick={() => matchClock.setSpecificMinute(1)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 font-bold"
                title="Ir al inicio"
              >
                1'
              </button>
              <button
                type="button"
                onClick={() => matchClock.setSpecificMinute(45)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 font-bold"
                title="Ir al Entretiempo"
              >
                45'
              </button>
              <button
                type="button"
                onClick={() => matchClock.setSpecificMinute(89)}
                className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30"
                title="Probar pausa en minuto 90'"
              >
                89' ⏱️
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción derecha: Iniciar Partido Programado, Reinicio Completo y Badge SSE */}
        <div className="flex flex-wrap items-center gap-2">
          {match.status === 'scheduled' && onStartMatch && (
            <button
              type="button"
              onClick={onStartMatch}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 animate-pulse"
              title="Iniciar partido programado: pasar a EN VIVO y arrancar reloj"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>▶️ Iniciar Partido</span>
            </button>
          )}

          {onResetMatch && (
            <button
              type="button"
              onClick={handleResetMatch}
              disabled={isResetting}
              className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              title="Reiniciar marcador a 0:0, eliminar goles, cambios y tarjetas"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Reiniciando...' : 'Reiniciar Partido'}</span>
            </button>
          )}

          {/* Badge Oficial SSE */}
          <ConnectionBadge status={connectionStatus} matchId={match.id} onReconnect={onReconnect} />
        </div>
      </div>

      {/* Alerta de confirmación de reinicio */}
      {resetSuccess && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Partido reiniciado exitosamente! Goles, tarjetas y cambios eliminados. Marcador en 0:0 y reloj en minuto 1'.</span>
        </div>
      )}

      {/* BANNER 0: PARTIDO PROGRAMADO (EN ESPERA DE SILBATAZO INICIAL) */}
      {match.status === 'scheduled' && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-blue-500/15 via-blue-600/10 to-blue-500/15 border-2 border-blue-500/40 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-black text-blue-300 uppercase tracking-wide flex items-center gap-2">
                <span>🗓️ Partido Programado • En Espera de Inicio</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                El reloj permanece detenido en 00:00 hasta que des el silbatazo inicial para comenzar la transmisión en vivo.
              </p>
            </div>
          </div>
          {onStartMatch && (
            <button
              type="button"
              onClick={onStartMatch}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Dar Silbatazo Inicial (Pasar a EN VIVO)</span>
            </button>
          )}
        </div>
      )}

      {/* BANNER 1: ALERTA DE MINUTO 90 CUMPLIDO (PAUSA AUTOMÁTICA Y ASIGNACIÓN DE TIEMPO EXTRA) */}
      {matchClock?.isWaitingForExtraTime && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-500/15 border-2 border-amber-500/50 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-amber-300 font-black text-sm uppercase tracking-wider mb-1">
                <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>⏱️ ¡Minuto 90 Cumplido! Reloj Pausado Automáticamente</span>
              </div>
              <p className="text-xs text-slate-300">
                El tiempo reglamentario ha finalizado. Asigna cuántos minutos de descuento/tiempo extra se jugarán:
              </p>
            </div>

            {/* Selector de minutos extra predefinidos y personalizado */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[2, 3, 4, 5, 6].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => matchClock.assignExtraTime(mins)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/60 text-amber-200 font-black text-xs transition-all shadow-md active:scale-95 hover:scale-105"
                >
                  +{mins}' min
                </button>
              ))}

              <form onSubmit={handleCustomExtraSubmit} className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={customExtra}
                  onChange={(e) => setCustomExtra(e.target.value)}
                  className="w-14 px-2 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold text-center focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow active:scale-95"
                >
                  Fijar
                </button>
              </form>

              <button
                type="button"
                onClick={() => matchClock.assignExtraTime(0)}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold text-xs transition-all active:scale-95"
                title="Pitar el final sin descuento"
              >
                🏁 Finalizar (0')
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BANNER 2: TIEMPO EXTRA EN CURSO */}
      {matchClock && matchClock.extraMinutes > 0 && !isFinished && !matchClock.isWaitingForExtraTime && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Timer className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              ⚡ Tiempo Añadido en Juego: <span className="underline font-black">+{matchClock.extraMinutes} minutos</span> (El partido terminará automáticamente al cumplirse el minuto {90 + matchClock.extraMinutes}')
            </span>
          </div>
          <button
            type="button"
            onClick={() => matchClock.assignExtraTime(0)}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] border border-rose-500/30"
          >
            Pitar Final Anticipado
          </button>
        </div>
      )}

      {/* BANNER 3: PARTIDO FINALIZADO OFICIALMENTE */}
      {isFinished && (
        <div className="mb-6 p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-700 shadow-2xl text-center animate-fadeIn">
          <div className="text-base sm:text-lg font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <span>🏁 ¡FINAL DEL PARTIDO! • TIEMPO CUMPLIDO</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Los 90 minutos reglamentarios {matchClock?.extraMinutes ? `más los ${matchClock.extraMinutes} minutos añadidos` : ''} han concluido. El marcador queda fijado.
          </p>
          {onResetMatch && (
            <button
              type="button"
              onClick={handleResetMatch}
              disabled={isResetting}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Partido (Nuevo Encuentro 0:0 y Borrar Eventos)</span>
            </button>
          )}
        </div>
      )}

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
