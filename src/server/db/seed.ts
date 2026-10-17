import { db, pool } from './index.js';
import { matches, matchEvents } from './schema.js';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('====================================================');
  console.log('🌱 Sembrando datos iniciales de prueba (Seed)...');
  console.log('====================================================');

  try {
    // Limpiar tablas para tener estado limpio reproducible
    await db.execute(sql`TRUNCATE TABLE match_events, matches RESTART IDENTITY CASCADE;`);

    // 1. Insertar al menos dos partidos (Requisito 1)
    const insertedMatches = await db.insert(matches).values([
      {
        localTeam: 'Real Madrid',
        awayTeam: 'FC Barcelona',
        status: 'live',
        period: 'second_half',
        localScore: 2,
        awayScore: 1,
      },
      {
        localTeam: 'Manchester City',
        awayTeam: 'Liverpool FC',
        status: 'live',
        period: 'first_half',
        localScore: 1,
        awayScore: 1,
      },
      {
        localTeam: 'Bayern Múnich',
        awayTeam: 'Borussia Dortmund',
        status: 'scheduled',
        period: 'first_half',
        localScore: 0,
        awayScore: 0,
      }
    ]).returning();

    const match1 = insertedMatches[0];
    const match2 = insertedMatches[1];

    console.log(`✅ ${insertedMatches.length} partidos creados:`);
    insertedMatches.forEach(m => console.log(`   - [#${m.id}] ${m.localTeam} vs ${m.awayTeam} (${m.status})`));

    // 2. Insertar eventos iniciales para Partido 1 (Real Madrid vs Barcelona)
    await db.insert(matchEvents).values([
      {
        matchId: match1.id,
        minute: 12,
        eventType: 'foul',
        team: 'away',
        playerName: 'Gavi',
        cardType: 'none',
        description: 'Falta táctica en el centro del campo.',
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        matchId: match1.id,
        minute: 24,
        eventType: 'goal',
        team: 'local',
        playerName: 'Vinicius Jr',
        cardType: 'none',
        description: '¡Golazo de Vinicius Jr definiendo cruzado al poste derecho!',
        createdAt: new Date(Date.now() - 3000000),
      },
      {
        matchId: match1.id,
        minute: 38,
        eventType: 'yellow_card',
        team: 'local',
        playerName: 'Dani Carvajal',
        cardType: 'yellow',
        description: 'Tarjeta amarilla por entrada a destiempo.',
        createdAt: new Date(Date.now() - 2400000),
      },
      {
        matchId: match1.id,
        minute: 43,
        eventType: 'goal',
        team: 'away',
        playerName: 'Robert Lewandowski',
        cardType: 'none',
        description: '¡Gol del empate de Robert Lewandowski con remate de cabeza potente!',
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        matchId: match1.id,
        minute: 55,
        eventType: 'goal',
        team: 'local',
        playerName: 'Jude Bellingham',
        cardType: 'none',
        description: '¡Gol de Jude Bellingham aprovechando un rebote en el área chica!',
        createdAt: new Date(Date.now() - 1200000),
      },
      {
        matchId: match1.id,
        minute: 61,
        eventType: 'substitution',
        team: 'away',
        playerName: 'Frenkie de Jong',
        extraInfo: 'Sale: Fermín López #16 -> Entra: Frenkie de Jong #21',
        cardType: 'none',
        description: 'Sustitución en el mediocampo del FC Barcelona.',
        createdAt: new Date(Date.now() - 600000),
      }
    ]);

    // 3. Insertar eventos iniciales para Partido 2 (Man City vs Liverpool)
    await db.insert(matchEvents).values([
      {
        matchId: match2.id,
        minute: 18,
        eventType: 'goal',
        team: 'local',
        playerName: 'Erling Haaland',
        cardType: 'none',
        description: '¡Remate imparable de zurda de Haaland tras pase filtrado!',
        createdAt: new Date(Date.now() - 2000000),
      },
      {
        matchId: match2.id,
        minute: 32,
        eventType: 'yellow_card',
        team: 'away',
        playerName: 'Virgil van Dijk',
        cardType: 'yellow',
        description: 'Tarjeta amarilla por cortar jugada manifiesta de peligro.',
        createdAt: new Date(Date.now() - 1500000),
      },
      {
        matchId: match2.id,
        minute: 40,
        eventType: 'goal',
        team: 'away',
        playerName: 'Mohamed Salah',
        cardType: 'none',
        description: '¡Definición magistral de Salah picando el balón sobre el portero!',
        createdAt: new Date(Date.now() - 900000),
      }
    ]);

    console.log('✅ Eventos de prueba insertados con éxito.');
    console.log('🏁 Proceso de Seed finalizado.');
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
