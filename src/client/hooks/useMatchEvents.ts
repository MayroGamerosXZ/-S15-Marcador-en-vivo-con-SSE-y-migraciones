import { useState, useEffect, useRef, useCallback } from 'react';
import { Match, MatchEvent, ConnectionStatus } from '../types';

export function useMatchEvents(matchId: number | null) {
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Referencia a la instancia de EventSource para cerrarla adecuadamente
  const eventSourceRef = useRef<EventSource | null>(null);
  // Set para deduplicar eventos y evitar que aparezcan duplicados tras reconexión (Requisito 5)
  const eventIdsRef = useRef<Set<number>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para inicializar Server-Sent Events
  const initSSE = useCallback((id: number) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionStatus('reconnecting');
    const es = new EventSource(`/api/matches/${id}/events/stream`);
    eventSourceRef.current = es;

    // Evento de conexión abierta
    es.addEventListener('open', () => {
      console.log(`[SSE Frontend] Conexión establecida con partido ${id}`);
      setConnectionStatus('connected');
    });

    // Confirmación inicial enviada por el servidor
    es.addEventListener('connected', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('[SSE Frontend] Mensaje de bienvenida:', data);
        setConnectionStatus('connected');
      } catch {}
    });

    // Nuevo evento de partido en tiempo real
    es.addEventListener('match_event', (e: MessageEvent) => {
      try {
        const newEvent: MatchEvent = JSON.parse(e.data);
        console.log('[SSE Frontend] Evento recibido vía SSE:', newEvent);

        // Deduplicación estricta por ID
        if (!eventIdsRef.current.has(newEvent.id)) {
          eventIdsRef.current.add(newEvent.id);
          setEvents(prev => [...prev, newEvent]);
        }
      } catch (err) {
        console.error('[SSE Error al procesar evento]:', err);
      }
    });

    // Actualización de marcador en tiempo real
    es.addEventListener('score_update', (e: MessageEvent) => {
      try {
        const updatedMatch: Match = JSON.parse(e.data);
        console.log('[SSE Frontend] Marcador actualizado vía SSE:', updatedMatch);
        setMatch(updatedMatch);
      } catch (err) {
        console.error('[SSE Error al actualizar marcador]:', err);
      }
    });

    // Evento de reinicio de partido (goles, cambios y tarjetas reseteados)
    es.addEventListener('match_reset', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('[SSE Frontend] Partido reiniciado vía SSE:', data);
        // Limpiar registro de eventos para que no queden congelados / pasmados
        eventIdsRef.current.clear();
        setEvents([]);
        if (data.match) {
          setMatch(data.match);
        }
      } catch (err) {
        console.error('[SSE Error al reiniciar partido]:', err);
      }
    });

    // Manejo de errores y reconexión automática resiliente
    es.onerror = () => {
      console.warn(`[SSE Frontend] Conexión interrumpida para partido ${id}`);
      if (es.readyState === EventSource.CLOSED) {
        setConnectionStatus('disconnected');
        // Reintentar conexión automáticamente tras 3 segundos si el servidor se reinició
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`[SSE Frontend] Reintentando reconexión para partido ${id}...`);
          initSSE(id);
        }, 3000);
      } else {
        setConnectionStatus('reconnecting');
      }
    };
  }, []);

  // Carga inicial y suscripción SSE cuando cambia matchId
  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      setEvents([]);
      setConnectionStatus('disconnected');
      return;
    }

    setLoading(true);
    setError(null);
    eventIdsRef.current.clear();

    // 1. Carga inicial del partido y su historial de eventos vía HTTP tradicional (Requisito 5)
    const fetchInitialData = async () => {
      try {
        const [matchRes, eventsRes] = await Promise.all([
          fetch(`/api/matches/${matchId}`),
          fetch(`/api/matches/${matchId}/events`)
        ]);

        if (!matchRes.ok) throw new Error('No se pudo cargar la información del partido');
        if (!eventsRes.ok) throw new Error('No se pudo cargar los eventos del partido');

        const matchData: Match = await matchRes.json();
        const eventsData: MatchEvent[] = await eventsRes.json();

        setMatch(matchData);
        // Guardar IDs para deduplicación
        eventsData.forEach(evt => eventIdsRef.current.add(evt.id));
        setEvents(eventsData);
        setLoading(false);

        // 2. Abrir conexión SSE tras completar la carga inicial
        initSSE(matchId);
      } catch (err: any) {
        console.error('[HTTP Error]', err);
        setError(err.message || 'Error cargando datos');
        setLoading(false);
        setConnectionStatus('disconnected');

        // Reintentar si el servidor aún está arrancando
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          fetchInitialData();
        }, 3000);
      }
    };

    fetchInitialData();

    // Función de limpieza al desmontar o cambiar de partido (Requisito 3)
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        console.log(`[SSE Frontend] Cerrando conexión SSE para partido ${matchId}`);
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnectionStatus('disconnected');
    };
  }, [matchId, initSSE]);

  // Método manual para reconectar si el usuario lo desea
  const reconnect = useCallback(() => {
    if (matchId) {
      initSSE(matchId);
    }
  }, [matchId, initSSE]);

  // Método para reiniciar el partido en backend y frontend (borra goles, tarjetas y cambios)
  const resetMatch = useCallback(async () => {
    if (!matchId) return;
    try {
      // Limpieza preventiva instantánea para sensación de fluidez inmediata
      eventIdsRef.current.clear();
      setEvents([]);

      const res = await fetch(`/api/matches/${matchId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.match) {
          setMatch(data.match);
        }
      }
    } catch (err) {
      console.error('[Error al reiniciar partido]:', err);
    }
  }, [matchId]);

  // Método para actualizar el estado del partido (ej. al terminar a los 90 + extra)
  const finishMatch = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch(`/api/matches/${matchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'finished', period: 'finished' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.match) {
          setMatch(data.match);
        }
      }
    } catch (err) {
      console.error('[Error al finalizar partido]:', err);
    }
  }, [matchId]);

  return {
    match,
    events,
    connectionStatus,
    loading,
    error,
    setMatch,
    setEvents,
    reconnect,
    resetMatch,
    finishMatch
  };
}
