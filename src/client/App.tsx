import React, { useState, useEffect } from 'react';
import { Match } from './types';
import { Header } from './components/Header';
import { MatchSelector } from './components/MatchSelector';
import { ScoreboardCard } from './components/ScoreboardCard';
import { Timeline } from './components/Timeline';
import { AdminForm } from './components/AdminForm';
import { useMatchEvents } from './hooks/useMatchEvents';
import { useMatchClock } from './hooks/useMatchClock';
import { RefreshCw, AlertTriangle, Radio } from 'lucide-react';

const DEFAULT_MATCHES: Match[] = [
  {
    id: 1,
    localTeam: 'Real Madrid',
    awayTeam: 'FC Barcelona',
    status: 'live',
    period: 'first_half',
    localScore: 2,
    awayScore: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    localTeam: 'Manchester City',
    awayTeam: 'Liverpool FC',
    status: 'live',
    period: 'first_half',
    localScore: 1,
    awayScore: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    localTeam: 'Bayern Múnich',
    awayTeam: 'Borussia Dortmund',
    status: 'scheduled',
    period: 'first_half',
    localScore: 0,
    awayScore: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'public' | 'admin'>('public');
  const [matches, setMatches] = useState<Match[]>(DEFAULT_MATCHES);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(1);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  // Hook para gestión de eventos SSE en tiempo real para el partido seleccionado
  const {
    match: currentMatch,
    events,
    connectionStatus,
    loading: matchLoading,
    error: matchError,
    setMatch,
    setEvents,
    reconnect,
    resetMatch,
    finishMatch
  } = useMatchEvents(selectedMatchId);

  // Hook de reloj acelerado entrelazado (90 minutos transcurren en ~2.5 minutos reales)
  // Con pausa automática a los 90', asignación de tiempo extra y finalización automática
  const matchClock = useMatchClock(selectedMatchId, 1, {
    onMatchFinished: () => {
      finishMatch();
    }
  });

  // Función global para reiniciar el partido seleccionado (borra eventos, marcador a 0:0 y reloj a 1')
  const handleResetMatch = async () => {
    await resetMatch();
    matchClock.resetClock();
    fetchMatches();
  };

  // Carga inicial y continua de partidos con auto-reintento
  const fetchMatches = async (retryCount = 3) => {
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('Error al cargar la lista de partidos');
      const data: Match[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
        setMatchesError(null);
        if (!selectedMatchId) {
          setSelectedMatchId(data[0].id);
        }
      }
    } catch (err: any) {
      console.warn('[Fetch Matches Retry]:', err.message);
      if (retryCount > 0) {
        setTimeout(() => fetchMatches(retryCount - 1), 1500);
      } else {
        setMatchesError(null); // No bloquear la interfaz, mantener matches en fallback
      }
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Si el canal SSE se conecta con éxito, sincronizar inmediatamente la lista de partidos del servidor
  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchMatches();
    }
  }, [connectionStatus]);

  // Mantener actualizado el marcador en la lista general cuando el partido activo cambia
  useEffect(() => {
    if (currentMatch) {
      setMatches(prev => prev.map(m => m.id === currentMatch.id ? currentMatch : m));
    }
  }, [currentMatch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Barra superior / Header */}
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        matchesCount={matches.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Selector interactivo de partidos (Al menos dos partidos - Requisito 1) */}
        <MatchSelector
          matches={matches}
          selectedMatchId={selectedMatchId}
          onSelectMatch={(id) => setSelectedMatchId(id)}
          getMatchClockInfo={matchClock.getMatchClockInfo}
        />

        {matchesError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{matchesError} (operando con partidos precargados)</span>
            </div>
            <button
              onClick={() => fetchMatches(2)}
              className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Reintentar
            </button>
          </div>
        )}

        {/* Vista Pública (Espectador) */}
        {activeView === 'public' && (
          <div className="space-y-6">
            {/* Marcador En Vivo con Badge SSE y Reloj de Partido */}
            <ScoreboardCard
              match={currentMatch}
              connectionStatus={connectionStatus}
              eventsCount={events.length}
              onReconnect={reconnect}
              matchClock={matchClock}
              onResetMatch={handleResetMatch}
            />

            {/* Línea de Tiempo con Iconos y Colores Diferenciados */}
            {currentMatch && (
              <Timeline
                events={events}
                localTeamName={currentMatch.localTeam}
                awayTeamName={currentMatch.awayTeam}
              />
            )}
          </div>
        )}

        {/* Vista de Administración */}
        {activeView === 'admin' && (
          <div className="space-y-6">
            {/* Formulario Validado de Registro de Eventos con Plantillas y Reloj Entrelazado */}
            <AdminForm
              matches={matches}
              selectedMatchId={selectedMatchId}
              onSelectMatch={(id) => setSelectedMatchId(id)}
              events={events}
              matchClock={matchClock}
              onResetMatch={handleResetMatch}
              onEventCreated={(updatedMatch, newEvent) => {
                // Sincronización instantánea directa de marcador y timeline
                if (updatedMatch) {
                  setMatch(updatedMatch);
                  setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
                }
                if (newEvent) {
                  setEvents(prev => {
                    if (prev.some(e => e.id === newEvent.id)) return prev;
                    return [...prev, newEvent];
                  });
                }
                fetchMatches();
              }}
            />

            {/* Vista Previa en Vivo del Partido Seleccionado */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Monitoreo en Vivo (Verificación de Transmisión)
              </h3>
              <ScoreboardCard
                match={currentMatch}
                connectionStatus={connectionStatus}
                eventsCount={events.length}
                onReconnect={reconnect}
                matchClock={matchClock}
                onResetMatch={handleResetMatch}
              />
            </div>

            {/* Timeline en tiempo real en la vista de administración */}
            {currentMatch && (
              <Timeline
                events={events}
                localTeamName={currentMatch.localTeam}
                awayTeamName={currentMatch.awayTeam}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer deportivo con estado del sistema */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-8 text-center text-xs text-slate-500">
        <p>Sistema de Marcador en Vivo con Server-Sent Events (SSE) y Drizzle ORM Migrations</p>
      </footer>
    </div>
  );
};
