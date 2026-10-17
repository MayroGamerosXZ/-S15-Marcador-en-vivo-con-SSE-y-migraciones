import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { matches, matchEvents } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
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
  description: z.string().min(2, 'La descripción es requerida'),
  playerName: z.string().optional(),
  extraInfo: z.string().optional(),
  cardType: z.string().optional().default('none'),
});

/**
 * 1. GET /api/matches
 * Nombre: Obtener todos los partidos
 * Función: Retorna la lista de todos los partidos registrados en la base de datos
 */
matchesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const allMatches = await db.select().from(matches).orderBy(asc(matches.id));
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
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'ID de partido inválido' });
    }

    const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
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
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'ID de partido inválido' });
    }

    // Ordenar por minuto ascendente y luego por timestamp de creación (Requisito 1)
    const events = await db
      .select()
      .from(matchEvents)
      .where(eq(matchEvents.matchId, matchId))
      .orderBy(asc(matchEvents.minute), asc(matchEvents.createdAt));

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
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'ID de partido inválido' });
    }

    // Verificar que el partido exista
    const [existingMatch] = await db.select().from(matches).where(eq(matches.id, matchId));
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

    const { minute, eventType, team, description, playerName, extraInfo, cardType } = parseResult.data;

    // 1° Guardar el evento en la base de datos relacional (Requisito 2)
    const [createdEvent] = await db.insert(matchEvents).values({
      matchId,
      minute,
      eventType,
      team,
      description,
      playerName: playerName || null,
      extraInfo: extraInfo || null,
      cardType: cardType || 'none',
      createdAt: new Date(),
    }).returning();

    let updatedMatch = existingMatch;

    // Si el evento es un GOL, actualizar el marcador en la base de datos
    if (eventType === 'goal') {
      const isLocal = team === 'local';
      const newLocalScore = isLocal ? existingMatch.localScore + 1 : existingMatch.localScore;
      const newAwayScore = !isLocal ? existingMatch.awayScore + 1 : existingMatch.awayScore;

      const [updated] = await db.update(matches)
        .set({
          localScore: newLocalScore,
          awayScore: newAwayScore,
          updatedAt: new Date()
        })
        .where(eq(matches.id, matchId))
        .returning();

      updatedMatch = updated;
    }

    // 2° Transmitir por SSE ÚNICAMENTE DESPUÉS de haber guardado en la base de datos (Requisito 2)
    // Se transmite única y exclusivamente al canal del partido solicitado (Aislamiento - Requisito 3 y 5)
    sseManager.broadcastToMatch(matchId, 'match_event', createdEvent);

    if (eventType === 'goal') {
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
  const matchId = parseInt(req.params.id);
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
