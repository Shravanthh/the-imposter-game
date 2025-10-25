import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(@MessageBody() data: { playerName: string }, @ConnectedSocket() client: Socket): void {
    try {
      const game = this.gameService.createGame();
      
      const player = this.gameService.addPlayer(game.id, data.playerName);
      
      // Make the creator admin and store socket ID
      if (player) {
        player.isAdmin = true;
        (player as any).socketId = client.id;
      }
      
      client.join(game.id);
      (client as any).data = { gameId: game.id, playerId: player.id };
      
      const updatedGame = this.gameService.getGame(game.id);
      
      client.emit('game-created', { gameId: game.id, game: updatedGame, player });
    } catch (error) {
      client.emit('error', { message: 'Failed to create game' });
    }
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @MessageBody() data: { gameId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const game = this.gameService.getGame(data.gameId);
      if (!game) {
        client.emit('error', { message: 'Game not found' });
        return;
      }

      const player = this.gameService.addPlayer(data.gameId, data.playerName);
      if (!player) {
        client.emit('error', { message: 'Game is full' });
        return;
      }

      // Store socket ID
      (player as any).socketId = client.id;

      client.join(data.gameId);
      (client as any).data = { gameId: data.gameId, playerId: player.id };

      const updatedGame = this.gameService.getGame(data.gameId);
      
      client.emit('game-joined', { game: updatedGame, player });
      this.server.to(data.gameId).emit('game-updated', updatedGame);
    } catch (error) {
      client.emit('error', { message: 'Failed to join game' });
    }
  }

  @SubscribeMessage('start-game')
  handleStartGame(@MessageBody() data: { gameId: string }): void {
    const game = this.gameService.getGame(data.gameId);
    if (!game || game.players.length < 3) return;

    this.gameService.assignRoles(data.gameId);
    const updatedGame = this.gameService.getGame(data.gameId);
    
    // Send updated game to all players with their roles
    updatedGame.players.forEach(player => {
      const playerSocket = this.server.sockets.sockets.get(player.socketId);
      if (playerSocket) {
        playerSocket.emit('game-updated', updatedGame);
        playerSocket.emit('role-assigned', { player, game: updatedGame });
      }
    });
    
    this.server.to(data.gameId).emit('game-updated', updatedGame);
  }

  @SubscribeMessage('next-phase')
  handleNextPhase(@MessageBody() data: { gameId: string }): void {
    this.gameService.nextPhase(data.gameId);
    this.server.to(data.gameId).emit('game-updated', this.gameService.getGame(data.gameId));
  }

  @SubscribeMessage('start-discussion')
  handleStartDiscussion(@MessageBody() data: { gameId: string }, @ConnectedSocket() client: Socket): void {
    const game = this.gameService.getGame(data.gameId);
    const playerId = (client as any).data?.playerId;
    const player = game?.players.find(p => p.id === playerId);
    
    if (!game || !player?.isAdmin) return;

    this.gameService.startDiscussion(data.gameId);
    this.server.to(data.gameId).emit('game-updated', this.gameService.getGame(data.gameId));
  }

  @SubscribeMessage('kick-player')
  handleKickPlayer(@MessageBody() data: { gameId: string; playerId: string }, @ConnectedSocket() client: Socket): void {
    const game = this.gameService.getGame(data.gameId);
    const adminId = (client as any).data?.playerId;
    const admin = game?.players.find(p => p.id === adminId);
    
    if (!game || !admin?.isAdmin) return;

    // Find the kicked player's socket
    const kickedPlayer = game.players.find(p => p.id === data.playerId);
    let kickedSocket = null;
    
    // Find socket by stored socketId or search through connected sockets
    if (kickedPlayer?.socketId) {
      kickedSocket = this.server.sockets.sockets.get(kickedPlayer.socketId);
    }
    
    const success = this.gameService.kickPlayer(data.gameId, data.playerId);
    if (success) {
      // Notify and disconnect the kicked player
      if (kickedSocket) {
        kickedSocket.emit('kicked', { message: 'You have been removed from the game by the admin' });
        kickedSocket.leave(data.gameId);
        // Clear their client data
        (kickedSocket as any).data = null;
      }
      
      // Update all remaining players
      this.server.to(data.gameId).emit('game-updated', this.gameService.getGame(data.gameId));
    }
  }

  @SubscribeMessage('reconnect-player')
  handleReconnectPlayer(
    @MessageBody() data: { gameId: string; playerId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const game = this.gameService.getGame(data.gameId);
    if (!game) {
      client.emit('reconnect-failed');
      return;
    }

    const player = game.players.find(p => p.id === data.playerId);
    if (!player) {
      client.emit('reconnect-failed');
      return;
    }

    // Update socket ID and rejoin room
    player.socketId = client.id;
    client.join(data.gameId);
    (client as any).data = { gameId: data.gameId, playerId: data.playerId };

    client.emit('reconnected', { game, player });
  }

  // Remove timer broadcast method - no longer needed

  @SubscribeMessage('finish-turn')
  handleFinishTurn(@MessageBody() data: { gameId: string }, @ConnectedSocket() client: Socket): void {
    this.gameService.finishPlayerTurn(data.gameId);
    const updatedGame = this.gameService.getGame(data.gameId);
    this.server.to(data.gameId).emit('game-updated', updatedGame);
  }

  @SubscribeMessage('confirm-role')
  handleConfirmRole(@MessageBody() data: { gameId: string }, @ConnectedSocket() client: Socket): void {
    const game = this.gameService.getGame(data.gameId);
    const playerId = (client as any).data?.playerId;
    const player = game?.players.find(p => p.id === playerId);
    
    if (player) {
      player.hasConfirmed = true;
      this.server.to(data.gameId).emit('game-updated', this.gameService.getGame(data.gameId));
    }
  }

  @SubscribeMessage('cast-vote')
  handleCastVote(
    @MessageBody() data: { gameId: string; targetId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const playerId = (client as any).data?.playerId;
    if (playerId) {
      this.gameService.castVote(data.gameId, playerId, data.targetId);
      this.server.to(data.gameId).emit('game-updated', this.gameService.getGame(data.gameId));
    }
  }
}
