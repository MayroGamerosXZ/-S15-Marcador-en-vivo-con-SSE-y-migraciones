export interface Player {
  id: number;
  name: string;
  number: number;
  position: 'POR' | 'DEF' | 'MED' | 'DEL';
}

export interface TeamSquad {
  teamName: string;
  shortName: string;
  players: Player[];
}

export const SQUADS_DATA: Record<string, TeamSquad> = {
  'Real Madrid': {
    teamName: 'Real Madrid',
    shortName: 'RMA',
    players: [
      { id: 101, name: 'Thibaut Courtois', number: 1, position: 'POR' },
      { id: 102, name: 'Dani Carvajal', number: 2, position: 'DEF' },
      { id: 103, name: 'Éder Militão', number: 3, position: 'DEF' },
      { id: 104, name: 'Antonio Rüdiger', number: 22, position: 'DEF' },
      { id: 105, name: 'Ferland Mendy', number: 23, position: 'DEF' },
      { id: 106, name: 'Lucas Vázquez', number: 17, position: 'DEF' },
      { id: 107, name: 'Jude Bellingham', number: 5, position: 'MED' },
      { id: 108, name: 'Eduardo Camavinga', number: 6, position: 'MED' },
      { id: 109, name: 'Federico Valverde', number: 8, position: 'MED' },
      { id: 110, name: 'Luka Modrić', number: 10, position: 'MED' },
      { id: 111, name: 'Aurélien Tchouaméni', number: 14, position: 'MED' },
      { id: 112, name: 'Arda Güler', number: 15, position: 'MED' },
      { id: 113, name: 'Vinicius Jr', number: 7, position: 'DEL' },
      { id: 114, name: 'Kylian Mbappé', number: 9, position: 'DEL' },
      { id: 115, name: 'Rodrygo Goes', number: 11, position: 'DEL' },
      { id: 116, name: 'Endrick', number: 16, position: 'DEL' },
      { id: 117, name: 'Brahim Díaz', number: 21, position: 'DEL' },
    ]
  },
  'FC Barcelona': {
    teamName: 'FC Barcelona',
    shortName: 'FCB',
    players: [
      { id: 201, name: 'Marc-André ter Stegen', number: 1, position: 'POR' },
      { id: 202, name: 'Iñaki Peña', number: 13, position: 'POR' },
      { id: 203, name: 'Pau Cubarsí', number: 2, position: 'DEF' },
      { id: 204, name: 'Alejandro Balde', number: 3, position: 'DEF' },
      { id: 205, name: 'Ronald Araújo', number: 4, position: 'DEF' },
      { id: 206, name: 'Iñigo Martínez', number: 5, position: 'DEF' },
      { id: 207, name: 'Jules Koundé', number: 23, position: 'DEF' },
      { id: 208, name: 'Gavi', number: 6, position: 'MED' },
      { id: 209, name: 'Pedri González', number: 8, position: 'MED' },
      { id: 210, name: 'Fermín López', number: 16, position: 'MED' },
      { id: 211, name: 'Marc Casadó', number: 17, position: 'MED' },
      { id: 212, name: 'Dani Olmo', number: 20, position: 'MED' },
      { id: 213, name: 'Frenkie de Jong', number: 21, position: 'MED' },
      { id: 214, name: 'Robert Lewandowski', number: 9, position: 'DEL' },
      { id: 215, name: 'Raphinha', number: 11, position: 'DEL' },
      { id: 216, name: 'Ferran Torres', number: 7, position: 'DEL' },
      { id: 217, name: 'Lamine Yamal', number: 19, position: 'DEL' },
      { id: 218, name: 'Ansu Fati', number: 10, position: 'DEL' },
    ]
  },
  'Manchester City': {
    teamName: 'Manchester City',
    shortName: 'MCI',
    players: [
      { id: 301, name: 'Ederson Moraes', number: 31, position: 'POR' },
      { id: 302, name: 'Kyle Walker', number: 2, position: 'DEF' },
      { id: 303, name: 'Rúben Dias', number: 3, position: 'DEF' },
      { id: 304, name: 'John Stones', number: 5, position: 'DEF' },
      { id: 305, name: 'Joško Gvardiol', number: 24, position: 'DEF' },
      { id: 306, name: 'Manuel Akanji', number: 25, position: 'DEF' },
      { id: 307, name: 'Mateo Kovačić', number: 8, position: 'MED' },
      { id: 308, name: 'Rodri Hernández', number: 16, position: 'MED' },
      { id: 309, name: 'Kevin De Bruyne', number: 17, position: 'MED' },
      { id: 310, name: 'Ilkay Gündoğan', number: 19, position: 'MED' },
      { id: 311, name: 'Bernardo Silva', number: 20, position: 'MED' },
      { id: 312, name: 'Phil Foden', number: 47, position: 'MED' },
      { id: 313, name: 'Erling Haaland', number: 9, position: 'DEL' },
      { id: 314, name: 'Jack Grealish', number: 10, position: 'DEL' },
      { id: 315, name: 'Jérémy Doku', number: 11, position: 'DEL' },
      { id: 316, name: 'Savinho', number: 26, position: 'DEL' },
    ]
  },
  'Liverpool FC': {
    teamName: 'Liverpool FC',
    shortName: 'LIV',
    players: [
      { id: 401, name: 'Alisson Becker', number: 1, position: 'POR' },
      { id: 402, name: 'Virgil van Dijk', number: 4, position: 'DEF' },
      { id: 403, name: 'Ibrahima Konaté', number: 5, position: 'DEF' },
      { id: 404, name: 'Andy Robertson', number: 26, position: 'DEF' },
      { id: 405, name: 'Trent Alexander-Arnold', number: 66, position: 'DEF' },
      { id: 406, name: 'Dominik Szoboszlai', number: 8, position: 'MED' },
      { id: 407, name: 'Alexis Mac Allister', number: 10, position: 'MED' },
      { id: 408, name: 'Curtis Jones', number: 17, position: 'MED' },
      { id: 409, name: 'Ryan Gravenberch', number: 38, position: 'MED' },
      { id: 410, name: 'Mohamed Salah', number: 11, position: 'DEL' },
      { id: 411, name: 'Luis Díaz', number: 7, position: 'DEL' },
      { id: 412, name: 'Darwin Núñez', number: 9, position: 'DEL' },
      { id: 413, name: 'Cody Gakpo', number: 18, position: 'DEL' },
      { id: 414, name: 'Diogo Jota', number: 20, position: 'DEL' },
      { id: 415, name: 'Federico Chiesa', number: 14, position: 'DEL' },
    ]
  },
  'Bayern Múnich': {
    teamName: 'Bayern Múnich',
    shortName: 'BAY',
    players: [
      { id: 501, name: 'Manuel Neuer', number: 1, position: 'POR' },
      { id: 502, name: 'Dayot Upamecano', number: 2, position: 'DEF' },
      { id: 503, name: 'Kim Min-jae', number: 3, position: 'DEF' },
      { id: 504, name: 'Alphonso Davies', number: 19, position: 'DEF' },
      { id: 505, name: 'Raphaël Guerreiro', number: 22, position: 'DEF' },
      { id: 506, name: 'Joshua Kimmich', number: 6, position: 'MED' },
      { id: 507, name: 'Leon Goretzka', number: 8, position: 'MED' },
      { id: 508, name: 'João Palhinha', number: 16, position: 'MED' },
      { id: 509, name: 'Jamal Musiala', number: 42, position: 'MED' },
      { id: 510, name: 'Serge Gnabry', number: 7, position: 'DEL' },
      { id: 511, name: 'Harry Kane', number: 9, position: 'DEL' },
      { id: 512, name: 'Leroy Sané', number: 10, position: 'DEL' },
      { id: 513, name: 'Kingsley Coman', number: 11, position: 'DEL' },
      { id: 514, name: 'Michael Olise', number: 17, position: 'DEL' },
      { id: 515, name: 'Thomas Müller', number: 25, position: 'DEL' },
    ]
  },
  'Borussia Dortmund': {
    teamName: 'Borussia Dortmund',
    shortName: 'BVB',
    players: [
      { id: 601, name: 'Gregor Kobel', number: 1, position: 'POR' },
      { id: 602, name: 'Waldemar Anton', number: 3, position: 'DEF' },
      { id: 603, name: 'Nico Schlotterbeck', number: 4, position: 'DEF' },
      { id: 604, name: 'Ramy Bensebaini', number: 5, position: 'DEF' },
      { id: 605, name: 'Niklas Süle', number: 25, position: 'DEF' },
      { id: 606, name: 'Julian Ryerson', number: 26, position: 'DEF' },
      { id: 607, name: 'Felix Nmecha', number: 8, position: 'MED' },
      { id: 608, name: 'Julian Brandt', number: 10, position: 'MED' },
      { id: 609, name: 'Marcel Sabitzer', number: 20, position: 'MED' },
      { id: 610, name: 'Emre Can', number: 23, position: 'MED' },
      { id: 611, name: 'Serhou Guirassy', number: 9, position: 'DEL' },
      { id: 612, name: 'Maximilian Beier', number: 14, position: 'DEL' },
      { id: 613, name: 'Donyell Malen', number: 21, position: 'DEL' },
      { id: 614, name: 'Karim Adeyemi', number: 27, position: 'DEL' },
      { id: 615, name: 'Jamie Gittens', number: 43, position: 'DEL' },
    ]
  }
};

// Almacén en memoria y persistente de jugadores añadidos dinámicamente por el usuario
let customPlayersStore: Record<string, Player[]> = {};

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('marcador_custom_players');
    if (saved) customPlayersStore = JSON.parse(saved);
  } catch {}
}

/**
 * Añade un jugador con número y posición a la plantilla de un equipo
 */
export function addPlayerToTeam(
  teamName: string,
  player: { name: string; number: number; position: 'POR' | 'DEF' | 'MED' | 'DEL' }
): Player {
  const normKey = teamName.trim();
  if (!customPlayersStore[normKey]) {
    customPlayersStore[normKey] = [];
  }
  const newPlayer: Player = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: player.name.trim(),
    number: player.number,
    position: player.position,
  };
  customPlayersStore[normKey].push(newPlayer);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('marcador_custom_players', JSON.stringify(customPlayersStore));
    } catch {}
  }

  return newPlayer;
}

export function getSquadForTeam(teamName: string): Player[] {
  const norm = teamName.toLowerCase().trim();
  let basePlayers: Player[] = [];

  for (const [key, squad] of Object.entries(SQUADS_DATA)) {
    if (norm.includes(key.toLowerCase()) || key.toLowerCase().includes(norm)) {
      basePlayers = [...squad.players];
      break;
    }
  }

  // Búsquedas por palabras clave
  if (basePlayers.length === 0) {
    if (norm.includes('madrid')) basePlayers = [...SQUADS_DATA['Real Madrid'].players];
    else if (norm.includes('barca') || norm.includes('barça') || norm.includes('barcelona')) basePlayers = [...SQUADS_DATA['FC Barcelona'].players];
    else if (norm.includes('city')) basePlayers = [...SQUADS_DATA['Manchester City'].players];
    else if (norm.includes('liverpool')) basePlayers = [...SQUADS_DATA['Liverpool FC'].players];
    else if (norm.includes('bayern')) basePlayers = [...SQUADS_DATA['Bayern Múnich'].players];
    else if (norm.includes('dortmund') || norm.includes('bvb')) basePlayers = [...SQUADS_DATA['Borussia Dortmund'].players];
  }

  // Incorporar jugadores personalizados añadidos por el usuario
  const custom = customPlayersStore[teamName.trim()] || [];
  const extraCustom: Player[] = [];
  for (const [k, list] of Object.entries(customPlayersStore)) {
    if (k.toLowerCase() === norm || norm.includes(k.toLowerCase())) {
      extraCustom.push(...list);
    }
  }

  // Deduplicar por id
  const map = new Map<number, Player>();
  basePlayers.forEach((p) => map.set(p.id, p));
  custom.forEach((p) => map.set(p.id, p));
  extraCustom.forEach((p) => map.set(p.id, p));

  return Array.from(map.values());
}
