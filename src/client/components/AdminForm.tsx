import React, { useState, useEffect, useMemo } from 'react';
import { Match, EventType, TeamSide, MatchEvent } from '../types';
import { TeamLogo } from './TeamLogo';
import { getSquadForTeam, Player } from '../data/squads';
import { MatchClockState } from '../hooks/useMatchClock';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  User,
  FileText,
  Clock,
  Radio,
  Flame,
  Users,
  AlertTriangle,
  Timer
} from 'lucide-react';

interface Props {
  matches: Match[];
  selectedMatchId: number | null;
  onSelectMatch: (id: number) => void;
  onEventCreated?: (updatedMatch?: Match, newEvent?: any) => void;
  events?: MatchEvent[];
  matchClock?: MatchClockState;
}

export const AdminForm: React.FC<Props> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
  onEventCreated,
  events = [],
  matchClock
}) => {
  const currentMatch = matches.find(m => m.id === selectedMatchId);

  // Estados del formulario
  const [eventType, setEventType] = useState<EventType>('goal');
  const [team, setTeam] = useState<TeamSide>('local');
  const [minute, setMinute] = useState<number>(matchClock?.currentMinute || 68);
  const [syncWithLiveClock, setSyncWithLiveClock] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [extraInfo, setExtraInfo] = useState<string>('');
  const [isDescriptionCustom, setIsDescriptionCustom] = useState<boolean>(false);
  const [squadFilter, setSquadFilter] = useState<'ALL' | 'DEL' | 'MED' | 'DEF' | 'POR'>('ALL');

  // Estados de retroalimentación
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reloj entrelazado: avanza el minuto del formulario conforme el reloj en vivo avanza
  useEffect(() => {
    if (syncWithLiveClock && matchClock) {
      setMinute(matchClock.currentMinute);
    }
  }, [matchClock?.currentMinute, syncWithLiveClock]);

  // Mapa de tarjetas acumuladas en el partido actual para detectar Doble Amarilla
  const playerCardMap = useMemo(() => {
    const map: Record<string, { yellow: number; isExpelled: boolean }> = {};
    events.forEach((evt) => {
      if (!evt.playerName) return;
      const norm = evt.playerName.trim().toLowerCase();
      if (!map[norm]) map[norm] = { yellow: 0, isExpelled: false };

      if (evt.eventType === 'yellow_card' || evt.cardType === 'yellow') {
        map[norm].yellow += 1;
        if (map[norm].yellow >= 2) map[norm].isExpelled = true;
      }
      if (evt.eventType === 'red_card' || evt.cardType === 'red') {
        map[norm].isExpelled = true;
      }
    });
    return map;
  }, [events]);

  // Verificar estado disciplinario del jugador escrito/seleccionado
  const currentPlayerStatus = useMemo(() => {
    if (!playerName.trim()) return null;
    const norm = playerName.trim().toLowerCase();
    return playerCardMap[norm] || null;
  }, [playerName, playerCardMap]);

  // Si tiene 1 tarjeta amarilla previa y se selecciona tarjeta amarilla, se activa la regla DOBLE AMARILLA = ROJA
  const isDoubleYellow = eventType === 'yellow_card' && currentPlayerStatus && currentPlayerStatus.yellow >= 1;

  // Plantilla oficial del equipo seleccionado (Real Madrid, FC Barcelona, City, Liverpool, etc.)
  const squadList = useMemo(() => {
    if (!currentMatch) return [];
    const teamName = team === 'local' ? currentMatch.localTeam : currentMatch.awayTeam;
    const players = getSquadForTeam(teamName);
    if (squadFilter === 'ALL') return players;
    return players.filter(p => p.position === squadFilter);
  }, [currentMatch, team, squadFilter]);

  // Función constructora de narrativa deportiva automática en tiempo real
  const buildNarrative = (player: string, type: EventType, side: TeamSide) => {
    const teamName = side === 'local' ? currentMatch?.localTeam : currentMatch?.awayTeam;
    const cleanPlayer = player.trim();

    switch (type) {
      case 'goal':
        return cleanPlayer
          ? `¡Golazo de ${cleanPlayer}! Gran remate directo a las redes para ${teamName}.`
          : `¡Gol de ${teamName}! Gran remate directo a las redes.`;
      case 'yellow_card':
        if (isDoubleYellow) {
          return `¡Segunda tarjeta amarilla para ${cleanPlayer} (${teamName}) y EXPULSIÓN! El jugador recibe la tarjeta roja por reiteración de faltas.`;
        }
        return cleanPlayer
          ? `Tarjeta amarilla para ${cleanPlayer} (${teamName}) por juego peligroso.`
          : `Tarjeta amarilla para ${teamName}.`;
      case 'red_card':
        return cleanPlayer
          ? `¡Tarjeta roja para ${cleanPlayer} (${teamName})! Expulsión directa del campo.`
          : `Tarjeta roja y expulsión para jugador de ${teamName}.`;
      case 'substitution':
        return cleanPlayer
          ? `Sustitución en ${teamName}: entra al terreno ${cleanPlayer}.`
          : `Sustitución táctica en ${teamName}.`;
      case 'foul':
      default:
        return cleanPlayer
          ? `Falta táctica cometida por ${cleanPlayer} (${teamName}) cortando la jugada.`
          : `Falta táctica de ${teamName} en disputa del balón.`;
    }
  };

  // Sincronización instantánea al tipear el nombre del jugador
  const handlePlayerNameChange = (newName: string) => {
    setPlayerName(newName);
    if (!isDescriptionCustom || !description.trim()) {
      setDescription(buildNarrative(newName, eventType, team));
    }
  };

  // Detección automática al hacer click en el recuadro de la descripción
  const handleDescriptionFocus = () => {
    if (!description.trim() || !isDescriptionCustom) {
      setDescription(buildNarrative(playerName, eventType, team));
    }
  };

  // Cambio de tipo de evento con actualización viva
  const handleEventTypeChange = (newType: EventType) => {
    setEventType(newType);
    if (!isDescriptionCustom || !description.trim()) {
      setDescription(buildNarrative(playerName, newType, team));
    }
  };

  // Cambio de equipo con actualización viva
  const handleTeamChange = (newTeam: TeamSide) => {
    setTeam(newTeam);
    if (!isDescriptionCustom || !description.trim()) {
      setDescription(buildNarrative(playerName, eventType, newTeam));
    }
  };

  // Selección rápida de jugador desde la plantilla oficial
  const handleSelectSquadPlayer = (player: Player) => {
    setPlayerName(player.name);
    setIsDescriptionCustom(false);
    setDescription(buildNarrative(player.name, eventType, team));
  };

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
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const cleanPlayer = playerName.trim();
      let finalDescription = description.trim();

      if (!finalDescription) {
        finalDescription = buildNarrative(cleanPlayer, eventType, team);
      }

      let finalEventType = eventType;
      let finalCardType = eventType === 'yellow_card' ? 'yellow' : eventType === 'red_card' ? 'red' : 'none';
      let finalExtraInfo = extraInfo.trim() || undefined;

      // REGLAMENTO: Si el jugador ya tenía amarilla y se le saca otra, se transforma en ROJA (Doble Amarilla)
      if (isDoubleYellow) {
        finalEventType = 'red_card';
        finalCardType = 'red';
        finalExtraInfo = 'Segunda tarjeta amarilla (Doble amonestación)';
        finalDescription = `¡Segunda tarjeta amarilla para ${cleanPlayer} y EXPULSIÓN! El jugador recibe la tarjeta roja por reiteración de faltas.`;
      }

      // Petición HTTP POST al servidor (Requisito 2)
      const res = await fetch(`/api/matches/${selectedMatchId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minute: Number(minute),
          eventType: finalEventType,
          team,
          description: finalDescription,
          playerName: cleanPlayer || undefined,
          extraInfo: finalExtraInfo,
          cardType: finalCardType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = data.error || 'Error al registrar el evento en el servidor';
        if (data.details) {
          const detailMsgs = Object.entries(data.details).map(([k, v]) => `${k}: ${(v as any[]).join(', ')}`).join(' | ');
          msg += ` (${detailMsgs})`;
        }
        throw new Error(msg);
      }

      const playerMention = cleanPlayer ? ` de ${cleanPlayer}` : '';
      const doubleMention = isDoubleYellow ? ' [DOBLE AMARILLA -> ROJA]' : '';
      setSuccessMessage(`¡Evento${playerMention}${doubleMention} registrado en PostgreSQL y transmitido por SSE! (Incidencia #${data.event.id})`);
      
      // Notificar con el partido actualizado y el evento para cambio inmediato del marcador
      if (onEventCreated) {
        onEventCreated(data.match, data.event);
      }

      // Limpiar campos del formulario para el siguiente evento
      setPlayerName('');
      setDescription('');
      setExtraInfo('');
      setIsDescriptionCustom(false);
    } catch (err: any) {
      console.error('[AdminForm Error]:', err);
      setErrorMessage(err.message || 'Error inesperado al enviar el formulario. Verifica que el servidor esté activo con "npm run dev".');
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

    const norm = teamName.toLowerCase();
    let player = 'Goleador';
    let text = `¡Golazo de ${teamName}!`;

    if (norm.includes('madrid')) {
      player = 'Vinicius Jr';
      text = '¡Golazo de Vinicius Jr gambeteando dentro del área y clavando el balón al ángulo!';
    } else if (norm.includes('barcelona') || norm.includes('barça')) {
      player = 'Lamine Yamal';
      text = '¡Extraordinario remate con rosca de Lamine Yamal al segundo poste imposible para el arquero!';
    } else if (norm.includes('city')) {
      player = 'Erling Haaland';
      text = '¡Potente disparo cruzado de zurda de Haaland tras un contraataque letal!';
    } else if (norm.includes('liverpool')) {
      player = 'Mohamed Salah';
      text = '¡Gol de Salah definiendo con categoría tras asistencia al espacio!';
    }

    setPlayerName(player);
    setDescription(text);
    setIsDescriptionCustom(true);
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
              Plantillas oficiales • Sincronización en vivo • Regla Doble Amarilla = Expulsión
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
          </div>
        </div>
      )}

      {/* PLANTILLA OFICIAL INTERACTIVA DEL EQUIPO */}
      {currentMatch && squadList.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Plantilla Oficial: <span className="text-emerald-400">{team === 'local' ? currentMatch.localTeam : currentMatch.awayTeam}</span>
              </h3>
              <span className="text-[10px] text-slate-400">(Toca cualquier jugador para seleccionarlo y redactar la jugada)</span>
            </div>

            {/* Filtro por Posición */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['ALL', 'DEL', 'MED', 'DEF', 'POR'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSquadFilter(pos)}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all ${
                    squadFilter === pos
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pos === 'ALL' ? 'TODOS' : pos}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Jugadores de la Plantilla */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {squadList.map((player) => {
              const status = playerCardMap[player.name.trim().toLowerCase()];
              const isSelected = playerName.trim().toLowerCase() === player.name.trim().toLowerCase();
              const hasYellow = status && status.yellow >= 1;
              const isExpelled = status && status.isExpelled;

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleSelectSquadPlayer(player)}
                  className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10'
                      : isExpelled
                      ? 'bg-rose-950/20 border-rose-900/50 opacity-60'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-digital text-xs font-black text-amber-400">#{player.number}</span>
                      <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-300 font-bold">{player.position}</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">
                      {player.name}
                    </div>
                  </div>

                  {/* Badges de Tarjetas en la Plantilla */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {hasYellow && !isExpelled && (
                      <span className="text-[10px]" title="Tiene 1 Tarjeta Amarilla">🟨</span>
                    )}
                    {isExpelled && (
                      <span className="text-[10px]" title="EXPULSADO">🟥</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerta Destacada si se detecta DOBLE AMARILLA = EXPULSIÓN */}
      {isDoubleYellow && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500 text-rose-300 flex items-start gap-3 shadow-xl shadow-rose-500/15 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-sm uppercase tracking-wider text-rose-200 flex items-center gap-2">
              <span>⚠️ REGLAMENTO OFICIAL: DOBLE AMARILLA = EXPULSIÓN (ROJA)</span>
            </div>
            <p className="text-xs text-rose-300 mt-1">
              El jugador <strong>{playerName}</strong> ya cuenta con una tarjeta amarilla previa en este partido.
              Al registrar esta amonestación, el sistema aplicará automáticamente la <strong>TARJETA ROJA</strong> y quedará expulsado del encuentro.
            </p>
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
              onChange={(e) => handleEventTypeChange(e.target.value as EventType)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="goal">⚽ Gol</option>
              <option value="foul">⚠️ Falta / Infracción</option>
              <option value="yellow_card">🟨 Tarjeta Amarilla (Doble = Roja)</option>
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
              onChange={(e) => handleTeamChange(e.target.value as TeamSide)}
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

          {/* Minuto con Reloj Entrelazado */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Minuto (1 - 130) *
              </label>
              {matchClock && (
                <button
                  type="button"
                  onClick={() => setSyncWithLiveClock(!syncWithLiveClock)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all ${
                    syncWithLiveClock
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Activa o desactiva el avance automático con el reloj del partido"
                >
                  <Timer className="w-3 h-3" />
                  {syncWithLiveClock ? 'Reloj Auto' : 'Manual'}
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              max="130"
              value={minute}
              onChange={(e) => {
                setMinute(Number(e.target.value));
                setSyncWithLiveClock(false);
              }}
              required
              className="w-full bg-slate-950 border border-slate-700 text-white font-digital rounded-xl px-3.5 py-3 text-base font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Nombre del Jugador con Auto-Sincronización */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" /> Jugador
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">● Sincronizado</span>
            </label>
            <input
              type="text"
              placeholder="Escribe jugador o toca la plantilla..."
              value={playerName}
              onChange={(e) => handlePlayerNameChange(e.target.value)}
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

        {/* Descripción con Auto-Detección y Sincronización al Tipear y al Hacer Clic */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> Descripción de la Incidencia (Recuadro Inteligente)
            </label>
            <button
              type="button"
              onClick={() => {
                setIsDescriptionCustom(false);
                setDescription(buildNarrative(playerName, eventType, team));
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-all bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
              title="Detectar texto de jugador y sincronizar descripción"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sincronizar Narración
            </button>
          </div>
          <textarea
            rows={2}
            placeholder="Al escribir un jugador o hacer clic en este recuadro, el texto cambia y se completa automáticamente..."
            value={description}
            onFocus={handleDescriptionFocus}
            onClick={handleDescriptionFocus}
            onPointerDown={handleDescriptionFocus}
            onChange={(e) => {
              setDescription(e.target.value);
              setIsDescriptionCustom(e.target.value.trim().length > 0);
            }}
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
