import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socketManager } from '@/lib/socket';
import { Game, Player } from '@/types/game';

interface UseSocketOptions {
  gameId: string | null;
  onError?: (error: string) => void;
}

export function useSocket({ gameId, onError }: UseSocketOptions) {
  const [game, setGame] = useState<Game | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<ReturnType<typeof socketManager.getSocket>>(null);
  const [gameEndedMessage, setGameEndedMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!gameId) {
      router.push('/');
      return;
    }

    const session = localStorage.getItem('gameSession');
    if (!session) {
      router.push('/');
      return;
    }

    const { playerId, playerName } = JSON.parse(session);
    const socketInstance = socketManager.connect();
    setSocket(socketInstance);

    const handleReconnected = (data: { game: Game; player: Player }) => {
      setGame(data.game);
      setCurrentPlayer(data.player);
      setIsLoading(false);
    };

    const handleGameState = (data: { game: Game; player: Player }) => {
      setGame(data.game);
      setCurrentPlayer(data.player);
      setIsLoading(false);
    };

    const handleGameUpdated = (updatedGame: Game) => {
      setGame(updatedGame);
      const player = updatedGame.players.find(p => p.id === playerId);
      setCurrentPlayer(player || null);
      setIsLoading(false);
      
      if (updatedGame.state === 'REVEAL_ROLE') {
        router.push(`/game?gameId=${gameId}`);
      }
    };

    const handleKicked = () => {
      localStorage.removeItem('gameSession');
      router.push('/');
    };

    const handleGameEnded = () => {
      setGameEndedMessage('Admin ended the game');
      localStorage.removeItem('gameSession');
      setTimeout(() => router.push('/'), 2000);
    };

    const handleError = (error: { message: string }) => {
      setIsLoading(false);
      onError?.(error.message);
    };

    const handleReconnectFailed = () => {
      socketInstance.emit('get-game');
    };

    socketInstance.emit('reconnect-player', { gameId, playerId, playerName });

    socketInstance.on('reconnected', handleReconnected);
    socketInstance.on('reconnect-failed', handleReconnectFailed);
    socketInstance.on('game-state', handleGameState);
    socketInstance.on('game-updated', handleGameUpdated);
    socketInstance.on('kicked', handleKicked);
    socketInstance.on('game-ended', handleGameEnded);
    socketInstance.on('error', handleError);

    return () => {
      socketInstance.off('connect');
      socketInstance.off('connect_error');
      socketInstance.off('reconnected', handleReconnected);
      socketInstance.off('reconnect-failed', handleReconnectFailed);
      socketInstance.off('game-state', handleGameState);
      socketInstance.off('game-updated', handleGameUpdated);
      socketInstance.off('kicked', handleKicked);
      socketInstance.off('game-ended', handleGameEnded);
      socketInstance.off('error', handleError);
    };
  }, [gameId, router, onError]);

  return { game, currentPlayer, isLoading, socket, gameEndedMessage };
}