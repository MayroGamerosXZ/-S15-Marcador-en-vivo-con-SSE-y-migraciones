import { db, pool } from './index.js';
import { matches, matchEvents, Match, MatchEvent } from './schema.js';
import { eq, asc } from 'drizzle-orm';

// Estado inicial en memoria para garantizar resiliencia absoluta si Docker está iniciando o apagado
const fallbackMatches: Match[] = [
  {
    id: 1,
    localTeam: 'Real Madrid',
    awayTeam: 'FC Barcelona',
    status: 'live',
    period: 'second_half',
    localScore: 2,
    awayScore: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    localTeam: 'Manchester City',
    awayTeam: 'Liverpool FC',
    status: 'live',
    period: 'first_half',
    localScore: 1,
    awayScore: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    localTeam: 'Bayern Múnich',
    awayTeam: 'Borussia Dortmund',
    status: 'scheduled',
    period: 'first_half',
    localScore: 0,
    awayScore: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

let nextEventId = 10;
const fallbackEvents: MatchEvent[] = [
  {
    id: 1,
    matchId: 1,
    minute: 12,
    eventType: 'foul',
    team: 'away',
    playerName: 'Gavi',
    cardType: 'none',
    extraInfo: null,
    description: 'Falta táctica en el centro del campo.',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    matchId: 1,
    minute: 24,
    eventType: 'goal',
    team: 'local',
    playerName: 'Vinicius Jr',
    cardType: 'none',
    extraInfo: null,
    description: '¡Golazo de Vinicius Jr definiendo cruzado al poste derecho!',
    createdAt: new Date(Date.now() - 3000000),
  },
  {
    id: 3,
    matchId: 1,
    minute: 38,
    eventType: 'yellow_card',
    team: 'local',
    playerName: 'Dani Carvajal',
    cardType: 'yellow',
    extraInfo: null,
    description: 'Tarjeta amarilla por entrada a destiempo.',
    createdAt: new Date(Date.now() - 2400000),
  },
  {
    id: 4,
    matchId: 1,
    minute: 43,
    eventType: 'goal',
    team: 'away',
    playerName: 'Robert Lewandowski',
    cardType: 'none',
    extraInfo: null,
    description: '¡Gol del empate de Robert Lewandowski con remate de cabeza potente!',
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: 5,
    matchId: 1,
    minute: 55,
    eventType: 'goal',
    team: 'local',
    playerName: 'Jude Bellingham',
    cardType: 'none',
    extraInfo: null,
    description: '¡Gol de Jude Bellingham aprovechando un rebote en el área chica!',
    createdAt: new Date(Date.now() - 1200000),
  },
  {
    id: 6,
    matchId: 1,
    minute: 61,
    eventType: 'substitution',
    team: 'away',
    playerName: 'Frenkie de Jong',
    cardType: 'none',
    extraInfo: 'Sale: Fermín López #16 -> Entra: Frenkie de Jong #21',
    description: 'Sustitución en el mediocampo del FC Barcelona.',
    createdAt: new Date(Date.now() - 600000),
  },
  {
    id: 7,
    matchId: 2,
    minute: 18,
    eventType: 'goal',
    team: 'local',
    playerName: 'Erling Haaland',
    cardType: 'none',
    extraInfo: null,
    description: '¡Remate imparable de zurda de Haaland tras pase filtrado!',
    createdAt: new Date(Date.now() - 2000000),
  },
  {
    id: 8,
    matchId: 2,
    minute: 32,
    eventType: 'yellow_card',
    team: 'away',
    playerName: 'Virgil van Dijk',
    cardType: 'yellow',
    extraInfo: null,
    description: 'Tarjeta amarilla por cortar jugada manifiesta de peligro.',
    createdAt: new Date(Date.now() - 1500000),
  },
  {
    id: 9,
    matchId: 2,
    minute: 40,
    eventType: 'goal',
    team: 'away',
    playerName: 'Mohamed Salah',
    cardType: 'none',
    extraInfo: null,
    description: '¡Definición magistral de Salah picando el balón sobre el portero!',
    createdAt: new Date(Date.now() - 900000),
  }
];

class DBService {
  private postgresAvailable: boolean | null = null;
  private warnedOffline: boolean = false;

  public async isPostgresOnline(): Promise<boolean> {
    try {
      const client = await pool.connect();
      client.release();
      this.postgresAvailable = true;
      this.warnedOffline = false;
      return true;
    } catch {
      this.postgresAvailable = false;
      if (!this.warnedOffline) {
        console.log('⚠️ [DB Info] PostgreSQL en localhost:5434 no está accesible en este momento.');
        console.log('   -> Operando en Modo Resiliente con almacenamiento local para garantizar que la app funcione siempre.');
        console.log('   -> Para usar PostgreSQL en Docker: abre Docker Desktop y ejecuta: docker compose up -d');
        this.warnedOffline = true;
      }
      return false;
    }
  }

  public async getMatches(): Promise<Match[]> {
    const isOnline = await this.isPostgresOnline();
    if (isOnline) {
      try {
        const rows = await db.select().from(matches).orderBy(asc(matches.id));
        if (rows.length > 0) return rows;
      } catch (err) {
        console.warn('Error leyendo matches de Postgres, usando fallback:', err);
      }
    }
    return fallbackMatches;
  }

  public async getMatchById(id: number): Promise<Match | null> {
    const isOnline = await this.isPostgresOnline();
    if (isOnline) {
      try {
        const [row] = await db.select().from(matches).where(eq(matches.id, id));
        if (row) return row;
      } catch {}
    }
    return fallbackMatches.find(m => m.id === id) || null;
  }

  public async getMatchEvents(matchId: number): Promise<MatchEvent[]> {
    const isOnline = await this.isPostgresOnline();
    if (isOnline) {
      try {
        const rows = await db
          .select()
          .from(matchEvents)
          .where(eq(matchEvents.matchId, matchId))
          .orderBy(asc(matchEvents.minute), asc(matchEvents.createdAt));
        return rows;
      } catch {}
    }
    return fallbackEvents
      .filter(e => e.matchId === matchId)
      .sort((a, b) => a.minute !== b.minute ? a.minute - b.minute : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async createEvent(matchId: number, data: {
    minute: number;
    eventType: string;
    team: 'local' | 'away';
    description: string;
    playerName?: string | null;
    extraInfo?: string | null;
    cardType?: string | null;
  }): Promise<{ event: MatchEvent; match: Match }> {
    const isOnline = await this.isPostgresOnline();
    let createdEvent: MatchEvent | null = null;
    let updatedMatch: Match | null = null;

    if (isOnline) {
      try {
        const [inserted] = await db.insert(matchEvents).values({
          matchId,
          minute: data.minute,
          eventType: data.eventType,
          team: data.team,
          description: data.description,
          playerName: data.playerName || null,
          extraInfo: data.extraInfo || null,
          cardType: data.cardType || 'none',
          createdAt: new Date(),
        }).returning();

        createdEvent = inserted;

        const [existing] = await db.select().from(matches).where(eq(matches.id, matchId));
        if (existing) {
          updatedMatch = existing;
          if (data.eventType === 'goal') {
            const isLocal = data.team === 'local';
            const [upd] = await db.update(matches)
              .set({
                localScore: isLocal ? existing.localScore + 1 : existing.localScore,
                awayScore: !isLocal ? existing.awayScore + 1 : existing.awayScore,
                updatedAt: new Date()
              })
              .where(eq(matches.id, matchId))
              .returning();
            updatedMatch = upd;
          }
        }
      } catch (err) {
        console.warn('Error guardando en Postgres, aplicando en fallback:', err);
      }
    }

    // Si falló Postgres o está offline, aplicar en fallback en memoria
    if (!createdEvent) {
      createdEvent = {
        id: nextEventId++,
        matchId,
        minute: data.minute,
        eventType: data.eventType as any,
        team: data.team,
        description: data.description,
        playerName: data.playerName || null,
        extraInfo: data.extraInfo || null,
        cardType: data.cardType || 'none',
        createdAt: new Date(),
      };
      fallbackEvents.push(createdEvent);
    }

    if (!updatedMatch) {
      const matchIndex = fallbackMatches.findIndex(m => m.id === matchId);
      if (matchIndex !== -1) {
        if (data.eventType === 'goal') {
          if (data.team === 'local') fallbackMatches[matchIndex].localScore += 1;
          else fallbackMatches[matchIndex].awayScore += 1;
          fallbackMatches[matchIndex].updatedAt = new Date();
        }
        updatedMatch = fallbackMatches[matchIndex];
      } else {
        updatedMatch = fallbackMatches[0];
      }
    }

    return { event: createdEvent, match: updatedMatch };
  }

  /**
   * Reinicia un partido: limpia goles, tarjetas, cambios y restablece marcador a 0:0
   */
  public async resetMatch(matchId: number): Promise<Match> {
    const isOnline = await this.isPostgresOnline();
    let updatedMatch: Match | null = null;

    if (isOnline) {
      try {
        // Borrar eventos del partido en PostgreSQL
        await db.delete(matchEvents).where(eq(matchEvents.matchId, matchId));

        // Restablecer marcador y período a 0:0, live y first_half
        const [upd] = await db.update(matches)
          .set({
            localScore: 0,
            awayScore: 0,
            status: 'live',
            period: 'first_half',
            updatedAt: new Date()
          })
          .where(eq(matches.id, matchId))
          .returning();
        updatedMatch = upd;
      } catch (err) {
        console.warn('Error reiniciando en Postgres, aplicando en fallback:', err);
      }
    }

    // Limpiar en memoria fallback
    for (let i = fallbackEvents.length - 1; i >= 0; i--) {
      if (fallbackEvents[i].matchId === matchId) {
        fallbackEvents.splice(i, 1);
      }
    }

    const matchIndex = fallbackMatches.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      fallbackMatches[matchIndex].localScore = 0;
      fallbackMatches[matchIndex].awayScore = 0;
      fallbackMatches[matchIndex].status = 'live';
      fallbackMatches[matchIndex].period = 'first_half';
      fallbackMatches[matchIndex].updatedAt = new Date();
      if (!updatedMatch) updatedMatch = fallbackMatches[matchIndex];
    }

    return updatedMatch || fallbackMatches[0];
  }

  /**
   * Actualiza el estado o período de un partido (por ejemplo al finalizar a los 90+ extra)
   */
  public async updateMatchStatus(matchId: number, status: string, period: string): Promise<Match> {
    const isOnline = await this.isPostgresOnline();
    let updatedMatch: Match | null = null;

    if (isOnline) {
      try {
        const [upd] = await db.update(matches)
          .set({
            status,
            period,
            updatedAt: new Date()
          })
          .where(eq(matches.id, matchId))
          .returning();
        updatedMatch = upd;
      } catch (err) {
        console.warn('Error actualizando estado en Postgres, aplicando en fallback:', err);
      }
    }

    const matchIndex = fallbackMatches.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      fallbackMatches[matchIndex].status = status;
      fallbackMatches[matchIndex].period = period;
      fallbackMatches[matchIndex].updatedAt = new Date();
      if (!updatedMatch) updatedMatch = fallbackMatches[matchIndex];
    }

    return updatedMatch || fallbackMatches[0];
  }
}

export const dbService = new DBService();
