import { Server, Socket } from 'socket.io';
import { GameService } from './game-service';
import { GameState } from './types';

export class SocketHandler {
  private gameService = new GameService();

  handleConnection(io: Server, socket: Socket) {
    const emitError = (message: string) => socket.emit('error', { message });
    const getPlayerData = () => {
      const gameId = socket.data?.gameId;
      const playerId = socket.data?.playerId;
      const game = gameId ? this.gameService.getGame(gameId) : null;
      const player = game?.players.find(p => p.id === playerId);
      return { game, player, gameId, playerId };
    };

    socket.on('create-game', (data: { playerName: string }) => {
      const game = this.gameService.createGame();
      const player = this.gameService.addPlayer(game.id, data.playerName, true);
      
      if (player) {
        player.isAdmin = true;
        player.socketId = socket.id;
        socket.join(game.id);
        socket.data = { gameId: game.id, playerId: player.id };
        socket.emit('game-created', { gameId: game.id, game, player });
      } else {
        emitError('Failed to create game');
      }
    });

    socket.on('join-game', (data: { gameId: string; playerName: string }) => {
      const game = this.gameService.getGame(data.gameId);
      if (!game) return emitError('Game not found');

      const player = this.gameService.addPlayer(data.gameId, data.playerName);
      if (!player) return emitError('Game is full or name already taken');

      player.socketId = socket.id;
      socket.join(data.gameId);
      socket.data = { gameId: data.gameId, playerId: player.id };

      socket.emit('game-joined', { game, player });
      io.to(data.gameId).emit('game-updated', game);
    });

    socket.on('reconnect-player', (data: { gameId: string; playerId: string }) => {
      const game = this.gameService.getGame(data.gameId);
      const player = game?.players.find(p => p.id === data.playerId);
      
      if (!game || !player) return socket.emit('reconnect-failed');

      player.socketId = socket.id;
      socket.join(data.gameId);
      socket.data = { gameId: data.gameId, playerId: data.playerId };
      socket.emit('reconnected', { game, player });
    });

    socket.on('get-game', () => {
      const { game, player } = getPlayerData();
      if (!game || !player) return emitError('Game or player not found');
      socket.emit('game-state', { game, player });
    });

    socket.on('start-game', () => {
      const { game, player, gameId } = getPlayerData();
      if (!game || !player?.isAdmin) return emitError('Unauthorized');
      if (game.players.length < 3) return emitError('Need at least 3 players');

      this.gameService.assignRoles(gameId!);
      io.to(gameId!).emit('game-updated', this.gameService.getGame(gameId!));
    });

    socket.on('confirm-role', () => {
      const { game, player, gameId } = getPlayerData();
      if (player) {
        player.hasConfirmed = true;
        io.to(gameId!).emit('game-updated', game);
      }
    });

    socket.on('start-discussion', () => {
      const { game, player, gameId } = getPlayerData();
      if (!game || !player?.isAdmin) return;
      
      game.discussionOrder = [...game.players].sort(() => Math.random() - 0.5);
      game.state = GameState.DISCUSSION;
      game.currentPlayerIndex = 0;
      io.to(gameId!).emit('game-updated', game);
    });

    socket.on('finish-turn', () => {
      const { game, gameId } = getPlayerData();
      if (!game || game.state !== GameState.DISCUSSION) return;

      if (game.currentPlayerIndex! < (game.discussionOrder?.length || game.players.length) - 1) {
        game.currentPlayerIndex!++;
      } else {
        game.state = GameState.VOTING;
        game.votes = {};
        game.players.forEach(p => p.hasVoted = false);
      }
      io.to(gameId!).emit('game-updated', game);
    });

    socket.on('cast-vote', (data: { targetId: string }) => {
      const { gameId, playerId } = getPlayerData();
      if (playerId && gameId) {
        this.gameService.castVote(gameId, playerId, data.targetId);
        io.to(gameId).emit('game-updated', this.gameService.getGame(gameId));
      }
    });

    socket.on('next-phase', () => {
      const { game, player, gameId } = getPlayerData();
      if (!game || !player?.isAdmin) return;

      if (game.state === GameState.VOTING) {
        this.gameService.calculateResults(gameId!);
      } else if (game.state === GameState.RESULTS) {
        this.gameService.nextRound(gameId!);
      }
      io.to(gameId!).emit('game-updated', this.gameService.getGame(gameId!));
    });

    socket.on('kick-player', (data: { playerId: string }) => {
      const { game, player, gameId } = getPlayerData();
      if (!game || !player?.isAdmin) return;

      const kicked = game.players.find(p => p.id === data.playerId);
      if (kicked?.socketId) {
        const kickedSocket = io.sockets.sockets.get(kicked.socketId);
        kickedSocket?.emit('kicked');
        kickedSocket?.leave(gameId!);
      }
      
      this.gameService.kickPlayer(gameId!, data.playerId);
      io.to(gameId!).emit('game-updated', this.gameService.getGame(gameId!));
    });

    socket.on('end-game', () => {
      const { game, player, gameId } = getPlayerData();
      if (!game || !player?.isAdmin) return;

      io.to(gameId!).emit('game-ended', { message: 'Admin ended the game' });
      this.gameService.deleteGame(gameId!);
    });
  }
}