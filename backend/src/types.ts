export interface Player {
  id: string;
  name: string;
  role: 'civilian' | 'imposter';
  score: number;
  hasVoted: boolean;
  vote?: string;
  isAdmin?: boolean;
  socketId?: string;
  hasConfirmed?: boolean;
}

export interface Game {
  id: string;
  players: Player[];
  state: GameState;
  currentObject?: string;
  round: number;
  votes: Record<string, string>;
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

export const WORD_BANK = [
  'Pizza', 'Burger', 'Sandwich', 'Coffee', 'Phone', 'Computer', 'Car', 'Tree', 'Book', 'Chair',
  'Apple', 'Water', 'Shirt', 'Clock', 'Mirror', 'Lamp', 'Flower', 'Bicycle', 'Camera', 'Guitar',
  'Bread', 'Tea', 'Shoes', 'Window', 'Pillow', 'Pen', 'Ball', 'Hat', 'Key', 'Bag',
  'Rice', 'Juice', 'Pants', 'Door', 'Blanket', 'Pencil', 'Toy', 'Glasses', 'Ring', 'Wallet',
  'Soup', 'Milk', 'Jacket', 'Table', 'Towel', 'Paper', 'Game', 'Watch', 'Coin', 'Bottle'
];