import React from 'react';
import { MatchEvent } from '../types';
import { Repeat, AlertTriangle, ArrowRightLeft, User, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  event: MatchEvent;
  localTeamName: string;
  awayTeamName: string;
}

export const EventCard: React.FC<Props> = ({ event, localTeamName, awayTeamName }) => {
  const isLocal = event.team === 'local';
  const teamName = isLocal ? localTeamName : awayTeamName;

  // Configuración de estilo visual diferenciado según el tipo de evento (Requisito 1)
  const getEventVisuals = () => {
    switch (event.eventType) {
      case 'goal':
        return {
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          cardBorder: 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 shadow-lg shadow-emerald-500/10',
          icon: <span className="text-xl animate-bounce">⚽</span>,
          title: '¡GOOOOOL!',
          colorAccent: 'text-emerald-400',
        };
      case 'foul':
        return {
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          cardBorder: 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900/60 shadow-lg shadow-amber-500/5',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          title: 'Falta Cometida',
          colorAccent: 'text-amber-400',
        };
      case 'yellow_card':
        return {
          badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          cardBorder: 'border-yellow-500/50 bg-gradient-to-r from-yellow-950/30 to-slate-900/60',
          icon: <span className="text-lg">🟨</span>,
          title: 'Tarjeta Amarilla',
          colorAccent: 'text-yellow-400',
        };
      case 'red_card':
        return {
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          cardBorder: 'border-rose-500/60 bg-gradient-to-r from-rose-950/40 to-slate-900/60 shadow-lg shadow-rose-500/10',
          icon: <span className="text-lg">🟥</span>,
          title: 'Tarjeta Roja (Expulsión)',
          colorAccent: 'text-rose-400',
        };
      case 'substitution':
        return {
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          cardBorder: 'border-sky-500/40 bg-gradient-to-r from-sky-950/30 to-slate-900/60 shadow-lg shadow-sky-500/5',
          icon: <ArrowRightLeft className="w-5 h-5 text-sky-400" />,
          title: 'Sustitución / Cambio',
          colorAccent: 'text-sky-400',
        };
      default:
        return {
          badgeBg: 'bg-slate-700 text-slate-300 border-slate-600',
          cardBorder: 'border-slate-800 bg-slate-900',
          icon: <Sparkles className="w-5 h-5 text-slate-400" />,
          title: 'Incidencia',
          colorAccent: 'text-slate-300',
        };
    }
  };

  const visuals = getEventVisuals();

  return (
    <div className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${visuals.cardBorder}`}>
      {/* Minuto del evento */}
      <div className="flex flex-col items-center justify-center min-w-[50px] py-1 px-2 rounded-lg bg-slate-950 border border-slate-800 shadow-inner">
        <span className="font-scoreboard text-2xl font-black text-white tabular-nums tracking-wide">
          {event.minute}'
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Minuto</span>
      </div>

      {/* Contenido principal del evento */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-slate-950/80 border border-slate-800">
              {visuals.icon}
            </div>
            <h4 className={`text-sm font-extrabold uppercase tracking-wide ${visuals.colorAccent}`}>
              {visuals.title}
            </h4>
          </div>

          {/* Badge del equipo al que pertenece el evento */}
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            isLocal
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
          }`}>
            {teamName} ({isLocal ? 'Local' : 'Visita'})
          </span>
        </div>

        {/* Jugador involucrado si aplica */}
        {event.playerName && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Jugador: <strong className="text-white">{event.playerName}</strong></span>
            {event.extraInfo && (
              <span className="text-slate-400 text-[11px]">({event.extraInfo})</span>
            )}
          </div>
        )}

        {/* Descripción detallada */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {event.description}
        </p>

        {/* Hora de registro en base de datos */}
        <div className="mt-2 text-[10px] text-slate-500 font-mono">
          Registrado: {new Date(event.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
