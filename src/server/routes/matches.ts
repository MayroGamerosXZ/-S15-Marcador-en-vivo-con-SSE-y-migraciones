import { Router, Request, Response } from 'express';
import { dbService } from '../db/dbService.js';
import { z } from 'zod';
import { sseManager } from '../sse/sseManager.js';

export const matchesRouter = Router();

// Esquema de validación con Zod para el formulario de administración (Requisito 2)
const createEventSchema = z.object({
  minute: z.number().int().min(1, 'El minuto debe ser al menos 1').max(130, 'El minuto no puede exceder 130'),
  eventType: z.enum(['goal', 'foul', 'substitution', 'yellow_card', 'red_card'], {
    errorMap: () => ({ message: 'Tipo de evento no válido' })
  }),
  team: z.enum(['local', 'away'], {
    errorMap: () => ({ message: 'El equipo debe ser local o away' })
  }),
  description: z.string().optional().default(''),
  playerName: z.string().optional(),
  extraInfo: z.string().optional(),
  cardType: z.string().optional().default('none'),
});

/**
 * 1. GET /api/matches
 * Nombre: Obtener todos los partidos
 * Función: Retorna la lista de todos los partidos registrados (Requisito 1)
 */
matchesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const allMatches = await dbService.getMatches();
    res.json(allMatches);
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Error al obtener la lista de partidos' });
  }
});

/**
 * 2. GET /api/matches/:id
 * Nombre: Obtener detalle de un partido
 * Función: Retorna la información y marcador de un partido específico por su ID
 */
matchesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id as string);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'ID de partido inválido' });
    }

    const match = await dbService.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    res.json(match);
  } catch (error: any) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Error al obtener el partido' });
  }
});

/**
 * 3. GET /api/matches/:id/events
 * Nombre: Obtener historial de eventos
 * Función: Carga inicial por HTTP tradicional del historial de eventos ordenados por minuto y fecha de creación (Requisito 1 y 5)
 */
matchesRouter.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id as string);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'ID de partido inválido' });
    }

    const events = await dbService.getMatchEvents(matchId);
    res.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error al obtener los eventos del partido' });
  }
});

/**
 * 4. POST /api/matches/:id/events
 * Nombre: Registrar nuevo evento de partido (Administración)
 * Función: Valida el formulario, guarda en base de datos ANTES de emitir por SSE (Requisito 2 y 5)
 */
matchesRouter.post('/:id/events', async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id as string);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'ID de partido inválido' });
    }

    const existingMatch = await dbService.getMatchById(matchId);
    if (!existingMatch) {
      return res.status(404).json({ error: 'El partido especificado no existe' });
    }

    // Validación rigurosa del formulario con Zod
    const parseResult = createEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    // Generar descripción automática profesional si no fue provista
    let eventDescription = parseResult.data.description?.trim();
    if (!eventDescription) {
      const teamName = parseResult.data.team === 'local' ? existingMatch.localTeam : existingMatch.awayTeam;
      const player = parseResult.data.playerName?.trim();

      switch (parseResult.data.eventType) {
        case 'goal':
          eventDescription = player
            ? `¡Golazo de ${player}! Gran definición al fondo de la red para ${teamName}.`
            : `¡Gol de ${teamName}! Gran remate directo a la portería.`;
          break;
        case 'foul':
          eventDescription = player
            ? `Falta cometida por ${player} (${teamName}) en disputa del balón.`
            : `Falta táctica sancionada a ${teamName}.`;
          break;
        case 'yellow_card':
          eventDescription = player
            ? `Tarjeta amarilla para ${player} (${teamName}) por juego peligroso.`
            : `Amonestación con tarjeta amarilla para ${teamName}.`;
          break;
        case 'red_card':
          eventDescription = player
            ? `¡Tarjeta roja para ${player} (${teamName})! Expulsión directa.`
            : `Expulsión con tarjeta roja para jugador de ${teamName}.`;
          break;
        case 'substitution':
          eventDescription = player
            ? `Cambio táctico en ${teamName}: entra ${player}.`
            : `Sustitución en las filas de ${teamName}.`;
          break;
        default:
          eventDescription = `Incidencia de juego registrada para ${teamName}.`;
      }
    }

    const eventPayload = {
      ...parseResult.data,
      description: eventDescription,
    };

    // 1° Guardar el evento en la base de datos relacional (Requisito 2)
    const { event: createdEvent, match: updatedMatch } = await dbService.createEvent(matchId, eventPayload);

    // 2° Transmitir por SSE ÚNICAMENTE DESPUÉS de haber guardado en la base de datos (Requisito 2)
    // Se transmite única y exclusivamente al canal del partido solicitado (Aislamiento - Requisito 3 y 5)
    sseManager.broadcastToMatch(matchId, 'match_event', createdEvent);

    if (parseResult.data.eventType === 'goal') {
      sseManager.broadcastToMatch(matchId, 'score_update', updatedMatch);
    }

    res.status(201).json({
      message: 'Evento registrado con éxito en la base de datos y transmitido por SSE',
      event: createdEvent,
      match: updatedMatch
    });
  } catch (error: any) {
    console.error('Error creating match event:', error);
    res.status(500).json({ error: 'Error al registrar el evento en el servidor' });
  }
});

/**
 * 5. GET /api/matches/:id/events/stream
 * Nombre: Conexión Server-Sent Events (SSE)
 * Función: Abre el stream en tiempo real exclusivo para el partido solicitado (Requisito 3)
 */
matchesRouter.get('/:id/events/stream', async (req: Request, res: Response) => {
  const matchId = parseInt(req.params.id as string);
  if (isNaN(matchId)) {
    return res.status(400).end('ID de partido inválido');
  }

  // Establecer cabeceras del protocolo Server-Sent Events (Requisito 3)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Evita buffering de Nginx/proxies
  });

  // Enviar flush inicial de cabeceras
  res.flushHeaders?.();

  // Registrar cliente en el gestor SSE aislado por partido
  sseManager.addClient(matchId, res);
});
