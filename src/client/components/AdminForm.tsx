import React, { useState } from 'react';
import { Match, EventType, TeamSide } from '../types';
import { PlusCircle, Send, CheckCircle2, AlertCircle, Shield, Sparkles, User, FileText, Clock } from 'lucide-react';

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
  const [minute, setMinute] = useState<number>(45);
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

      // Éxito: Guardado en BD y transmitido por SSE
      setSuccessMessage(`¡Evento registrado exitosamente en la base de datos y transmitido por SSE a los espectadores! (ID: #${data.event.id})`);
      
      // Limpiar campos secundarios para siguiente entrada rápida
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

  // Helper de eventos rápidos para agilizar pruebas y toma de capturas
  const setQuickEvent = (type: EventType, side: TeamSide, defaultPlayer: string, defaultDesc: string) => {
    setEventType(type);
    setTeam(side);
    setPlayerName(defaultPlayer);
    setDescription(defaultDesc);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Panel de Control de Arbitraje & Administración
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Los eventos se guardan en PostgreSQL y se transmiten inmediatamente por SSE.
          </p>
        </div>

        {/* Selector de partido para el Administrador (Requisito 2) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Partido:</label>
          <select
            value={selectedMatchId || ''}
            onChange={(e) => onSelectMatch(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.localTeam} ({m.localScore}) vs ({m.awayScore}) {m.awayTeam}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de acción rápida para demostración rápida */}
      {currentMatch && (
        <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Plantillas Rápidas para Demostración:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQuickEvent('goal', 'local', 'Goleador Local', `¡Gol de ${currentMatch.localTeam} tras un gran remate cruzado!`)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
            >
              ⚽ Gol {currentMatch.localTeam}
            </button>
            <button
              type="button"
              onClick={() => setQuickEvent('goal', 'away', 'Goleador Visita', `¡Gol de ${currentMatch.awayTeam} de cabeza al ángulo!`)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
            >
              ⚽ Gol {currentMatch.awayTeam}
            </button>
            <button
              type="button"
              onClick={() => setQuickEvent('yellow_card', 'local', 'Defensa Central', 'Falta táctica para cortar un contragolpe peligroso.')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-600/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-600/30 transition-all"
            >
              🟨 Tarjeta Amarilla
            </button>
            <button
              type="button"
              onClick={() => setQuickEvent('substitution', 'away', 'Delantero Saliente', 'Cambio táctico en el ataque.')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 transition-all"
            >
              🔄 Sustitución
            </button>
          </div>
        </div>
      )}

      {/* Formulario Validado */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo de Evento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Tipo de Evento *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="goal">⚽ Gol</option>
              <option value="foul">⚠️ Falta</option>
              <option value="yellow_card">🟨 Tarjeta Amarilla</option>
              <option value="red_card">🟥 Tarjeta Roja</option>
              <option value="substitution">🔄 Sustitución / Cambio</option>
            </select>
          </div>

          {/* Equipo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Equipo Involucrado *
            </label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value as TeamSide)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Minuto del Partido *
            </label>
            <input
              type="number"
              min="1"
              max="130"
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Nombre del Jugador */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-400" /> Nombre del Jugador
            </label>
            <input
              type="text"
              placeholder="Ej: Vinicius Jr, Messi..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Información Adicional para cambios o detalles */}
        {eventType === 'substitution' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Detalle de Sustitución (Entra / Sale)
            </label>
            <input
              type="text"
              placeholder="Ej: Sale: Modric #10 -> Entra: Bellingham #5"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Descripción del Evento *
          </label>
          <textarea
            rows={3}
            placeholder="Describe qué ocurrió en la jugada..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-normal focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
          />
        </div>

        {/* Mensajes de Alerta y Validación */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Botón de Enviar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
              isSubmitting
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30 hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <>Guardando en BD y Transmitiendo...</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Registrar y Transmitir Evento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
