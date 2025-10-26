import { Player, Game, GameState, WORD_BANK } from './types';

export class GameService {
  private games = new Map<string, Game>();
  private usedWords = new Set<string>();

  generateGameCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  createGame(): Game {
    const game: Game = {
      id: this.generateGameCode(),
      players: [],
      state: GameState.LOBBY,
      round: 1,
      votes: {}
    };
    this.games.set(game.id, game);
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  addPlayer(gameId: string, playerName: string, isCreator = false): Player | null {
    const game = this.games.get(gameId);
    if (!game || game.players.length >= 15) return null;

    if (!isCreator && game.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      return null;
    }

    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      role: 'civilian',
      score: 0,
      hasVoted: false
    };

    game.players.push(player);
    return player;
  }

  assignRoles(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const imposterCount = Math.min(3, Math.max(1, Math.floor(game.players.length / 3)));
    const shuffled = [...game.players].sort(() => Math.random() - 0.5);
    
    shuffled.forEach((player, index) => {
      player.role = index < imposterCount ? 'imposter' : 'civilian';
      player.hasConfirmed = false;
    });

    game.currentObject = this.getUniqueWord();
    game.state = GameState.REVEAL_ROLE;
  }

  private getUniqueWord(): string {
    const available = WORD_BANK.filter(word => !this.usedWords.has(word));
    if (available.length === 0) {
      this.usedWords.clear();
      return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    }
    
    const word = available[Math.floor(Math.random() * available.length)];
    this.usedWords.add(word);
    return word;
  }

  castVote(gameId: string, playerId: string, targetId: string): void {
    const game = this.games.get(gameId);
    const player = game?.players.find(p => p.id === playerId);
    if (player) {
      player.hasVoted = true;
      player.vote = targetId;
      game!.votes[playerId] = targetId;
    }
  }

  calculateResults(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const imposters = game.players.filter(p => p.role === 'imposter');
    const voteCount: Record<string, number> = {};
    
    Object.values(game.votes).forEach(vote => {
      voteCount[vote] = (voteCount[vote] || 0) + 1;
    });

    game.players.forEach(player => {
      if (player.role === 'imposter') {
        player.score += voteCount[player.id] > 0 ? -50 : 100;
      } else if (player.vote) {
        player.score += imposters.some(imp => imp.id === player.vote) ? 50 : -30;
      }
    });

    game.state = GameState.RESULTS;
  }

  nextRound(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.round++;
    game.votes = {};
    game.players.forEach(player => {
      player.hasVoted = false;
      player.vote = undefined;
    });
    this.assignRoles(gameId);
  }

  kickPlayer(gameId: string, playerId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;

    const index = game.players.findIndex(p => p.id === playerId);
    if (index === -1) return false;

    game.players.splice(index, 1);
    return true;
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }
}