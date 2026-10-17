export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type MatchPeriod = 'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'finished';
export type EventType = 'goal' | 'foul' | 'substitution' | 'yellow_card' | 'red_card';
export type TeamSide = 'local' | 'away';

export interface Match {
  id: number;
  localTeam: string;
  awayTeam: string;
  status: MatchStatus;
  period: MatchPeriod;
  localScore: number;
  awayScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchEvent {
  id: number;
  matchId: number;
  minute: number;
  eventType: EventType;
  team: TeamSide;
  description: string;
  playerName?: string | null;
  cardType?: string | null;
  extraInfo?: string | null;
  createdAt: string;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
