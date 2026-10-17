import { pgTable, serial, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';

/**
 * Tabla: matches (Partidos)
 * Evolucionada en Migración 0001 con la columna 'period'
 */
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  localTeam: varchar('local_team', { length: 100 }).notNull(),
  awayTeam: varchar('away_team', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('scheduled'), // scheduled, live, finished
  period: varchar('period', { length: 50 }).notNull().default('first_half'), // first_half, halftime, second_half, extra_time, finished
  localScore: integer('local_score').notNull().default(0),
  awayScore: integer('away_score').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabla: match_events (Eventos del Partido)
 * Evolucionada en Migración 0001 con:
 * - player_name: Jugador que ejecutó la acción
 * - card_type: Tipo de amonestación (none, yellow, red)
 * - extra_info: Información de cambio (jugador saliente/entrante)
 */
export const matchEvents = pgTable('match_events', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  minute: integer('minute').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // goal, foul, substitution, yellow_card, red_card
  team: varchar('team', { length: 10 }).notNull(), // 'local' | 'away'
  description: text('description').notNull(),
  playerName: varchar('player_name', { length: 100 }),
  cardType: varchar('card_type', { length: 20 }).default('none'),
  extraInfo: varchar('extra_info', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type MatchEvent = typeof matchEvents.$inferSelect;
export type NewMatchEvent = typeof matchEvents.$inferInsert;
