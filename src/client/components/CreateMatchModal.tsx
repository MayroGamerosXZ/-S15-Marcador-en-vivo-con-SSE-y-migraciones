import React, { useState } from 'react';
import { Match } from '../types';
import { X, Trophy, Plus, Shield, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: (newMatch: Match) => void;
}

const POPULAR_TEAMS = [
  'Real Madrid',
  'FC Barcelona',
  'Manchester City',
  'Liverpool FC',
  'Bayern Múnich',
  'Borussia Dortmund',
  'Paris Saint-Germain',
  'Arsenal FC',
  'Inter de Milán',
  'Atlético de Madrid',
  'Juventus',
  'Chelsea FC'
];

export const CreateMatchModal: React.FC<Props> = ({ isOpen, onClose, onMatchCreated }) => {
  const [localTeam, setLocalTeam] = useState<string>('');
  const [awayTeam, setAwayTeam] = useState<string>('');
  const [status, setStatus] = useState<'scheduled' | 'live'>('scheduled');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanLocal = localTeam.trim();
    const cleanAway = awayTeam.trim();

    if (!cleanLocal || !cleanAway) {
      setErrorMessage('Ingresa los nombres del equipo local y visitante.');
      return;
    }

    if (cleanLocal.toLowerCase() === cleanAway.toLowerCase()) {
      setErrorMessage('El equipo local y visitante deben ser diferentes.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localTeam: cleanLocal,
          awayTeam: cleanAway,
          status,
          period: 'first_half',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el nuevo partido');
      }

      onMatchCreated(data);
      onClose();
    } catch (err: any) {
      console.error('Error creating match:', err);
      setErrorMessage(err.message || 'No se pudo crear el partido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Programar / Crear Nuevo Partido
              </h3>
              <p className="text-xs text-slate-400">
                Añade un nuevo encuentro a la jornada deportiva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Equipo Local */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Equipo Local</span>
              <span className="text-[10px] text-emerald-400 font-normal">Anfitrión</span>
            </label>
            <input
              type="text"
              required
              value={localTeam}
              onChange={(e) => setLocalTeam(e.target.value)}
              placeholder="Ej: Real Madrid, PSG, Boca Juniors..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
            {/* Sugerencias Rápidas */}
            <div className="flex flex-wrap gap-1 mt-2">
              {POPULAR_TEAMS.slice(0, 5).map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => setLocalTeam(team)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-semibold"
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {/* Equipo Visitante */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Equipo Visitante</span>
              <span className="text-[10px] text-blue-400 font-normal">Rival</span>
            </label>
            <input
              type="text"
              required
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              placeholder="Ej: FC Barcelona, Arsenal FC, River Plate..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
            {/* Sugerencias Rápidas */}
            <div className="flex flex-wrap gap-1 mt-2">
              {POPULAR_TEAMS.slice(1, 6).map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => setAwayTeam(team)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-semibold"
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {/* Estado Inicial */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Estado Inicial del Partido
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('scheduled')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  status === 'scheduled'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Programado</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Reloj detenido en 00:00 esperando silbatazo
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatus('live')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  status === 'live'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>En Vivo Directo</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Arranca inmediatamente en minuto 1'
                </p>
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Crear y Guardar Partido'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
