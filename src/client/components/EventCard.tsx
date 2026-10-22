import React from 'react';
import { MatchEvent } from '../types';
import { TeamLogo } from './TeamLogo';
import { AlertTriangle, ArrowRightLeft, User, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface Props {
  event: MatchEvent;
  localTeamName: string;
  awayTeamName: string;
}

export const EventCard: React.FC<Props> = ({ event, localTeamName, awayTeamName }) => {
  const isLocal = event.team === 'local';
  const teamName = isLocal ? localTeamName : awayTeamName;

  // Visuales diferenciados por tipo de evento deportivo (Requisito 1)
  const getEventVisuals = () => {
    switch (event.eventType) {
      case 'goal':
        return {
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          cardBorder: 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-950/90 shadow-xl shadow-emerald-500/15 animate-goal-pulse',
          icon: <span className="text-2xl animate-bounce">⚽</span>,
          title: '¡GOOOOOOOOL!',
          colorAccent: 'text-emerald-400 font-black tracking-widest',
          tagText: 'Anotación',
          tagColor: 'bg-emerald-500 text-slate-950 font-black'
        };
      case 'yellow_card':
        return {
          badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          cardBorder: 'border-yellow-500/50 bg-gradient-to-r from-yellow-950/40 via-slate-900/80 to-slate-950/90 shadow-lg shadow-yellow-500/10',
          icon: (
            <div className="w-5 h-7 bg-yellow-400 rounded-sm shadow-md shadow-yellow-500/50 border border-yellow-200"></div>
          ),
          title: 'Tarjeta Amarilla',
          colorAccent: 'text-yellow-400 font-extrabold',
          tagText: 'Amonestación',
          tagColor: 'bg-yellow-500 text-slate-950 font-black'
        };
      case 'red_card':
        const isDoubleYellow = event.extraInfo?.toLowerCase().includes('segunda') || event.extraInfo?.toLowerCase().includes('doble');
        return {
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          cardBorder: 'border-rose-500/70 bg-gradient-to-r from-rose-950/50 via-slate-900/80 to-slate-950/90 shadow-xl shadow-rose-500/20',
          icon: isDoubleYellow ? (
            <div className="flex items-center -space-x-2">
              <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-md border border-yellow-200"></div>
              <div className="w-4 h-6 bg-rose-600 rounded-sm shadow-lg border border-rose-300 animate-pulse"></div>
            </div>
          ) : (
            <div className="w-5 h-7 bg-rose-600 rounded-sm shadow-lg shadow-rose-600/60 border border-rose-300 animate-pulse"></div>
          ),
          title: isDoubleYellow ? '¡Doble Tarjeta Amarilla (Expulsión)!' : '¡Tarjeta Roja Directa (Expulsión)!',
          colorAccent: 'text-rose-400 font-black tracking-wide',
          tagText: isDoubleYellow ? 'Doble Amarilla' : 'Expulsión',
          tagColor: 'bg-rose-600 text-white font-black'
        };
      case 'foul':
        return {
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          cardBorder: 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/70 to-slate-950/80',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          title: 'Infracción / Falta',
          colorAccent: 'text-amber-400 font-extrabold',
          tagText: 'Falta Táctica',
          tagColor: 'bg-amber-500 text-slate-950 font-bold'
        };
      case 'substitution':
        return {
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          cardBorder: 'border-sky-500/50 bg-gradient-to-r from-sky-950/40 via-slate-900/70 to-slate-950/80 shadow-lg shadow-sky-500/10',
          icon: <ArrowRightLeft className="w-6 h-6 text-sky-400" />,
          title: 'Sustitución Táctica',
          colorAccent: 'text-sky-400 font-extrabold',
          tagText: 'Cambio',
          tagColor: 'bg-sky-500 text-slate-950 font-bold'
        };
      default:
        return {
          badgeBg: 'bg-slate-700 text-slate-300 border-slate-600',
          cardBorder: 'border-slate-800 bg-slate-900',
          icon: <Sparkles className="w-5 h-5 text-slate-400" />,
          title: 'Incidencia del Partido',
          colorAccent: 'text-slate-300 font-bold',
          tagText: 'Incidencia',
          tagColor: 'bg-slate-700 text-white'
        };
    }
  };

  const visuals = getEventVisuals();

  return (
    <div className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${visuals.cardBorder}`}>
      {/* Columna Izquierda: Minuto en Pantalla Digital */}
      <div className="flex sm:flex-col items-center justify-center min-w-[65px] px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 shadow-inner">
        <span className="font-digital text-2xl font-black text-white tabular-nums tracking-wider">
          {event.minute}'
        </span>
        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold sm:mt-0.5 ml-2 sm:ml-0">
          Minuto
        </span>
      </div>

      {/* Icono Gráfico Representativo */}
      <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-800 shadow-md shrink-0">
        {visuals.icon}
      </div>

      {/* Contenido Central */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="sm:hidden">{visuals.icon}</span>
            <h4 className={`text-base uppercase ${visuals.colorAccent}`}>
              {visuals.title}
            </h4>
            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${visuals.tagColor}`}>
              {visuals.tagText}
            </span>
          </div>

          {/* Badge del Club con Escudo Oficial */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-slate-700/80 shadow-md">
            <TeamLogo teamName={teamName} size="sm" />
            <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
              {teamName}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              isLocal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isLocal ? 'LOCAL' : 'VISITA'}
            </span>
          </div>
        </div>

        {/* Nombre del Jugador Destacado */}
        {event.playerName && (
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span>
              Jugador: <span className="text-emerald-300 font-extrabold underline decoration-emerald-500/40">{event.playerName}</span>
            </span>
            {event.extraInfo && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {event.extraInfo}
              </span>
            )}
          </div>
        )}

        {/* Descripción de la Jugada */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {event.description}
        </p>

        {/* Timestamp de persistencia */}
        <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
          <span>✔ Persistido en PostgreSQL:</span>
          <span>{new Date(event.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
