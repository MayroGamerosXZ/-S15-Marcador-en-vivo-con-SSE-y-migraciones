import { useState, useEffect, useRef } from 'react';
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

        // 2. Abrir conexión SSE ÚNICAMENTE tras completar la carga inicial
        initSSE(matchId);
      } catch (err: any) {
        console.error('[HTTP Error]', err);
        setError(err.message || 'Error cargando datos');
        setLoading(false);
      }
    };

    fetchInitialData();

    // Función para inicializar Server-Sent Events
    const initSSE = (id: number) => {
      // Si existía una conexión previa, cerrarla de inmediato (Requisito 3)
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
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
          console.log('[SSE Frontend] Evento recibido:', newEvent);

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
          console.log('[SSE Frontend] Marcador actualizado:', updatedMatch);
          setMatch(updatedMatch);
        } catch (err) {
          console.error('[SSE Error al actualizar marcador]:', err);
        }
      });

      // Manejo de errores y reconexión automática del navegador
      es.onerror = () => {
        console.warn(`[SSE Frontend] Conexión interrumpida o reconectando para partido ${id}`);
        // EventSource intentará reconectar automáticamente, por lo que mostramos 'reconnecting'
        setConnectionStatus('reconnecting');
      };
    };

    // Función de limpieza al desmontar o cambiar de partido (Requisito 3)
    return () => {
      if (eventSourceRef.current) {
        console.log(`[SSE Frontend] Cerrando conexión SSE para partido ${matchId}`);
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnectionStatus('disconnected');
    };
  }, [matchId]);

  return { match, events, connectionStatus, loading, error, setMatch, setEvents };
}
