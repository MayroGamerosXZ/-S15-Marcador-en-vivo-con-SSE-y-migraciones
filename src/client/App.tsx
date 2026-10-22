import React, { useState, useEffect } from 'react';
import { Match } from './types';
import { Header } from './components/Header';
import { MatchSelector } from './components/MatchSelector';
import { ScoreboardCard } from './components/ScoreboardCard';
import { Timeline } from './components/Timeline';
import { AdminForm } from './components/AdminForm';
import { useMatchEvents } from './hooks/useMatchEvents';
import { RefreshCw, AlertTriangle, Radio } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'public' | 'admin'>('public');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);
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
    reconnect
  } = useMatchEvents(selectedMatchId);

  // Carga inicial de partidos
  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('Error al cargar la lista de partidos');
      const data: Match[] = await res.json();
      setMatches(data);
      if (data.length > 0 && !selectedMatchId) {
        setSelectedMatchId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setMatchesError(err.message || 'Error de conexión');
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

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
        {loadingMatches ? (
          <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Cargando partidos de la jornada...</span>
          </div>
        ) : matchesError ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{matchesError}</span>
            </div>
            <button
              onClick={fetchMatches}
              className="px-4 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reintentar Conexión
            </button>
          </div>
        ) : (
          <MatchSelector
            matches={matches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={(id) => setSelectedMatchId(id)}
          />
        )}

        {/* Vista Pública (Espectador) */}
        {activeView === 'public' && (
          <div className="space-y-6">
            {/* Marcador En Vivo con Badge SSE */}
            <ScoreboardCard
              match={currentMatch}
              connectionStatus={connectionStatus}
              eventsCount={events.length}
              onReconnect={reconnect}
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
            {/* Formulario Validado de Registro de Eventos */}
            <AdminForm
              matches={matches}
              selectedMatchId={selectedMatchId}
              onSelectMatch={(id) => setSelectedMatchId(id)}
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
