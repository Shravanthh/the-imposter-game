import { ScoreBreakdown, Achievement } from './scoring';

export interface Player {
  id: string;
  name: string;
  role: 'civilian' | 'imposter';
  score: number;
  roundScore?: ScoreBreakdown;
  achievements?: Achievement[];
  hasVoted: boolean;
  vote?: string;
  isAdmin?: boolean;
  hasConfirmed?: boolean;
}

export interface Game {
  id: string;
  players: Player[];
  state: GameState;
  currentObject?: string;
  round: number;
  currentPlayerIndex?: number;
  discussionOrder?: Player[];
}

export enum GameState {
  LOBBY = 'LOBBY',
  REVEAL_ROLE = 'REVEAL_ROLE',
  DISCUSSION = 'DISCUSSION',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS'
}