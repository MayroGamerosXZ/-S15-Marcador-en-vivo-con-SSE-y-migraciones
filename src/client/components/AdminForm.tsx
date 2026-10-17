import React, { useState } from 'react';
import { Match, EventType, TeamSide } from '../types';
import { TeamLogo } from './TeamLogo';
import { PlusCircle, Send, CheckCircle2, AlertCircle, Shield, Sparkles, User, FileText, Clock, Radio, Flame } from 'lucide-react';

interface Props {
  matches: Match[];
  selectedMatchId: number | null;
  onSelectMatch: (id: number) => void;
  onEventCreated?: () => void;
}

export const AdminForm: React.FC<Props> = ({ matches, selectedMatchId, onSelectMatch, onEventCreated }) => {
  const currentMatch = matches.find(m => m.id === selectedMatchId);

  // Estados del formulario
  const [eventType, setEventType] = useState<EventType>('goal');
  const [team, setTeam] = useState<TeamSide>('local');
  const [minute, setMinute] = useState<number>(68);
  const [playerName, setPlayerName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [extraInfo, setExtraInfo] = useState<string>('');

  // Estados de retroalimentación
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validación de formulario (Requisito 2)
  const validateForm = () => {
    if (!selectedMatchId) {
      setErrorMessage('Debes seleccionar un partido para registrar eventos.');
      return false;
    }
    if (!minute || minute < 1 || minute > 130) {
      setErrorMessage('El minuto debe ser un número válido entre 1 y 130.');
      return false;
    }
    if (!description.trim()) {
      setErrorMessage('La descripción del evento es obligatoria.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Petición HTTP POST al servidor (Requisito 2)
      const res = await fetch(`/api/matches/${selectedMatchId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minute: Number(minute),
          eventType,
          team,
          description: description.trim(),
          playerName: playerName.trim() || undefined,
          extraInfo: extraInfo.trim() || undefined,
          cardType: eventType === 'yellow_card' ? 'yellow' : eventType === 'red_card' ? 'red' : 'none',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar el evento en el servidor');
      }

      setSuccessMessage(`¡Evento registrado con éxito en PostgreSQL y transmitido por SSE a los espectadores! (Incidencia #${data.event.id})`);
      
      // Limpiar campos secundarios
      setDescription('');
      setExtraInfo('');
      if (onEventCreated) onEventCreated();
    } catch (err: any) {
      console.error('[AdminForm Error]:', err);
      setErrorMessage(err.message || 'Error inesperado al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Botones rápidos temáticos por club
  const setQuickGoal = (side: TeamSide) => {
    if (!currentMatch) return;
    const teamName = side === 'local' ? currentMatch.localTeam : currentMatch.awayTeam;
    setEventType('goal');
    setTeam(side);
    setMinute(Math.floor(Math.random() * 30) + 60);

    const norm = teamName.toLowerCase();
    if (norm.includes('madrid')) {
      setPlayerName('Vinicius Jr');
      setDescription('¡Golazo de Vinicius Jr gambeteando dentro del área y clavando el balón al ángulo!');
    } else if (norm.includes('barcelona') || norm.includes('barça')) {
      setPlayerName('Lamine Yamal');
      setDescription('¡Extraordinario remate con rosca de Lamine Yamal al segundo poste imposible para el arquero!');
    } else if (norm.includes('city')) {
      setPlayerName('Erling Haaland');
      setDescription('¡Potente disparo cruzado de zurda de Haaland tras un contraataque letal!');
    } else if (norm.includes('liverpool')) {
      setPlayerName('Mohamed Salah');
      setDescription('¡Gol de Salah definiendo con categoría tras asistencia al espacio!');
    } else {
      setPlayerName('Delantero Estrella');
      setDescription(`¡Gol de ${teamName} definiendo frente a la portería!`);
    }
  };

  return (
    <div className="stadium-border rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80">
      {/* Encabezado del Panel de Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2 font-scoreboard">
              Panel de Arbitraje & Operación de Partido
            </h2>
            <p className="text-xs text-slate-400">
              Registra incidencias validadas • Persistencia en PostgreSQL antes de emitir vía SSE
            </p>
          </div>
        </div>

        {/* Selector de Partido Activo */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-700">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-widest pl-2">
            Partido:
          </label>
          <select
            value={selectedMatchId || ''}
            onChange={(e) => onSelectMatch(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.localTeam} ({m.localScore}) vs ({m.awayScore}) {m.awayTeam}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjeta de Partido Seleccionado con Escudos y Marcador Rápido */}
      {currentMatch && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TeamLogo teamName={currentMatch.localTeam} size="sm" />
              <span className="font-bold text-sm text-white">{currentMatch.localTeam}</span>
              <span className="font-digital text-base font-black text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {currentMatch.localScore}
              </span>
            </div>
            <span className="text-slate-500 font-bold">VS</span>
            <div className="flex items-center gap-2">
              <span className="font-digital text-base font-black text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {currentMatch.awayScore}
              </span>
              <span className="font-bold text-sm text-white">{currentMatch.awayTeam}</span>
              <TeamLogo teamName={currentMatch.awayTeam} size="sm" />
            </div>
          </div>

          {/* Botones de Gol Rápido estilizados por equipo */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickGoal('local')}
              className="text-xs font-black uppercase px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              ⚽ Gol {currentMatch.localTeam}
            </button>
            <button
              type="button"
              onClick={() => setQuickGoal('away')}
              className="text-xs font-black uppercase px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              ⚽ Gol {currentMatch.awayTeam}
            </button>
            <button
              type="button"
              onClick={() => {
                setEventType('yellow_card');
                setTeam('away');
                setMinute(52);
                setPlayerName('Defensa');
                setDescription('Falta táctica reiterada cortando un avance peligroso.');
              }}
              className="text-xs font-black uppercase px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition-all"
            >
              🟨 Tarjeta
            </button>
            <button
              type="button"
              onClick={() => {
                setEventType('substitution');
                setTeam('local');
                setMinute(65);
                setPlayerName('Mediocampista');
                setExtraInfo('Sale: Titular #8 -> Entra: Suplente #14');
                setDescription('Cambio para refrescar el mediocampo.');
              }}
              className="text-xs font-black uppercase px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all"
            >
              🔄 Cambio
            </button>
          </div>
        </div>
      )}

      {/* Formulario Validado */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo de Evento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Tipo de Incidencia *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="goal">⚽ Gol</option>
              <option value="foul">⚠️ Falta / Infracción</option>
              <option value="yellow_card">🟨 Tarjeta Amarilla</option>
              <option value="red_card">🟥 Tarjeta Roja (Expulsión)</option>
              <option value="substitution">🔄 Sustitución / Cambio</option>
            </select>
          </div>

          {/* Equipo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Equipo Involucrado *
            </label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value as TeamSide)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="local">
                {currentMatch ? `Local (${currentMatch.localTeam})` : 'Equipo Local'}
              </option>
              <option value="away">
                {currentMatch ? `Visitante (${currentMatch.awayTeam})` : 'Equipo Visitante'}
              </option>
            </select>
          </div>

          {/* Minuto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Minuto (1 - 130) *
            </label>
            <input
              type="number"
              min="1"
              max="130"
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              required
              className="w-full bg-slate-950 border border-slate-700 text-white font-digital rounded-xl px-3.5 py-3 text-base font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Nombre del Jugador */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-400" /> Nombre del Jugador
            </label>
            <input
              type="text"
              placeholder="Ej: Vinicius Jr, Lewandowski..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Sustitución extra */}
        {eventType === 'substitution' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Detalle del Cambio (Entra / Sale)
            </label>
            <input
              type="text"
              placeholder="Ej: Sale: Modric #10 -> Entra: Bellingham #5"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" /> Descripción Detallada del Evento *
          </label>
          <textarea
            rows={3}
            placeholder="Describe qué ocurrió en la jugada con detalle..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-normal focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Banners de Retroalimentación */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/10 animate-pulse">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Botón de Envío */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all duration-300 ${
              isSubmitting
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30 hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <>Guardando en PostgreSQL y Transmitiendo...</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Registrar y Emitir vía SSE
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
