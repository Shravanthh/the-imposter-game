import { Injectable } from '@nestjs/common';
import { Player, Game, GameState, WORD_BANK } from '../types/game.types';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();
  private usedWords: Set<string> = new Set(); // Track used words globally

  generateGameCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  createGame(): Game {
    const gameId = this.generateGameCode();
    const game: Game = {
      id: gameId,
      players: [],
      state: GameState.LOBBY,
      round: 1,
      timer: 0,
      votes: {}
    };
    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  addPlayer(gameId: string, playerName: string): Player | null {
    const game = this.games.get(gameId);
    if (!game || game.players.length >= 15) return null;

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

  private getUniqueWord(): string {
    // Get available words (not used yet)
    const availableWords = WORD_BANK.filter(word => !this.usedWords.has(word));
    
    // If all words are used, reset the used words set
    if (availableWords.length === 0) {
      this.usedWords.clear();
      return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    }
    
    // Select a random word from available words
    const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Mark this word as used
    this.usedWords.add(selectedWord);
    
    return selectedWord;
  }

  assignRoles(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const total = game.players.length;
    let imposterCount = 1;
    if (total >= 6) imposterCount = 2;
    if (total >= 10) imposterCount = 3;

    const shuffled = [...game.players].sort(() => Math.random() - 0.5);
    
    shuffled.forEach((player, index) => {
      player.role = index < imposterCount ? 'imposter' : 'civilian';
      player.hasConfirmed = false; // Reset confirmation status
      // Don't change admin status - it's already set for the creator
    });

    // Use the unique word selection method
    game.currentObject = this.getUniqueWord();
    game.state = GameState.REVEAL_ROLE;
    game.currentPlayerIndex = 0;
    game.timer = 0;
  }

  castVote(gameId: string, playerId: string, targetId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (player) {
      player.hasVoted = true;
      player.vote = targetId;
      game.votes[playerId] = targetId;
    }
  }

  calculateResults(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const imposters = game.players.filter(p => p.role === 'imposter');
    const imposterIds = imposters.map(imp => imp.id);

    // Count votes for each player
    const voteCount: Record<string, number> = {};
    Object.values(game.votes).forEach(vote => {
      voteCount[vote] = (voteCount[vote] || 0) + 1;
    });

    // Check if any imposter was caught (received votes)
    const caughtImposters = imposters.filter(imp => voteCount[imp.id] > 0);
    const impostersWon = caughtImposters.length === 0;

    game.players.forEach(player => {
      if (player.role === 'imposter') {
        // Imposter scoring
        if (voteCount[player.id] > 0) {
          // This imposter was caught
          player.score -= 50;
        } else {
          // This imposter was not caught
          player.score += 100;
        }
      } else {
        // Civilian scoring
        if (player.vote && imposterIds.includes(player.vote)) {
          // Voted for an imposter (correct)
          player.score += 50;
        } else if (player.vote) {
          // Voted for a civilian (wrong)
          player.score -= 30;
        } else {
          // Didn't vote
          player.score += 0;
        }
      }
    });

    game.state = GameState.RESULTS;
  }

  nextPhase(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    switch (game.state) {
      case GameState.REVEAL_ROLE:
        game.state = GameState.DISCUSSION_ROUND_1;
        break;
      case GameState.DISCUSSION_ROUND_1:
        game.state = GameState.DISCUSSION_ROUND_2;
        break;
      case GameState.DISCUSSION_ROUND_2:
        game.state = GameState.VOTING;
        break;
      case GameState.VOTING:
        this.calculateResults(gameId);
        break;
      case GameState.RESULTS:
        this.nextRound(gameId);
        break;
      case GameState.LEADERBOARD:
        this.nextRound(gameId);
        break;
    }
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
    game.state = GameState.LOBBY;
  }

  finishPlayerTurn(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game || game.state !== GameState.DISCUSSION) return;

    if (game.currentPlayerIndex < (game.discussionOrder?.length || game.players.length) - 1) {
      game.currentPlayerIndex++;
      // No timer reset - manual progression only
    } else {
      game.state = GameState.VOTING;
      game.votes = {};
      game.players.forEach(p => p.hasVoted = false);
    }
  }

  startDiscussion(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;
    
    // Create randomized discussion order
    game.discussionOrder = [...game.players].sort(() => Math.random() - 0.5);
    
    game.state = GameState.DISCUSSION;
    game.currentPlayerIndex = 0;
    // Remove timer - no automatic countdown
  }

  kickPlayer(gameId: string, playerId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    // Remove player from game
    game.players.splice(playerIndex, 1);
    
    // Update discussion order if it exists
    if (game.discussionOrder) {
      game.discussionOrder = game.discussionOrder.filter(p => p.id !== playerId);
    }
    
    return true;
  }

  // Method to get word bank statistics (for debugging/admin purposes)
  getWordBankStats(): { total: number; used: number; remaining: number } {
    return {
      total: WORD_BANK.length,
      used: this.usedWords.size,
      remaining: WORD_BANK.length - this.usedWords.size
    };
  }

  // Method to reset used words (for admin purposes)
  resetUsedWords(): void {
    this.usedWords.clear();
  }
}
