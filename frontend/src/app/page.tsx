'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { socketManager } from '@/lib/socket';
import GameLayout from '@/components/GameLayout';
import GameCard from '@/components/GameCard';

export default function Home() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();

  const createGame = () => {
    if (!playerName.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    socketManager.disconnect();
    const socket = socketManager.connect();
    
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setError('Server is probably taking a coffee break ☕');
      setIsConnected(false);
    }, 5000);

    const handleGameCreated = (data: any) => {
      clearTimeout(timeout);
      setIsLoading(false);
      localStorage.setItem('gameSession', JSON.stringify({
        gameId: data.gameId,
        playerId: data.player.id,
        playerName: data.player.name
      }));
      router.push(`/lobby?gameId=${data.gameId}`);
    };

    const handleError = (error: any) => {
      clearTimeout(timeout);
      setIsLoading(false);
      setError(error.message || 'Something went horribly wrong 🤷‍♂️');
      setIsConnected(false);
    };

    socket.on('connect', () => {
      setIsConnected(true);
      clearTimeout(timeout);
    });
    socket.on('game-created', handleGameCreated);
    socket.on('error', handleError);
    socket.on('connect_error', handleError);

    socket.emit('create-game', { playerName: playerName.trim() });
  };

  const joinGame = () => {
    if (!gameCode.trim() || !playerName.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    socketManager.disconnect();
    const socket = socketManager.connect();
    
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setError('Connection slower than a sloth on vacation 🦥');
      setIsConnected(false);
    }, 5000);

    const handleGameJoined = (data: any) => {
      clearTimeout(timeout);
      setIsLoading(false);
      localStorage.setItem('gameSession', JSON.stringify({
        gameId: data.game.id,
        playerId: data.player.id,
        playerName: data.player.name
      }));
      router.push(`/lobby?gameId=${data.game.id}`);
    };

    const handleError = (error: any) => {
      clearTimeout(timeout);
      setIsLoading(false);
      setError(error.message || 'Game not found. Did you make it up? 🤔');
    };

    socket.on('connect', () => {
      setIsConnected(true);
      clearTimeout(timeout);
    });
    socket.on('game-joined', handleGameJoined);
    socket.on('error', handleError);
    socket.on('connect_error', handleError);

    socket.emit('join-game', { gameId: gameCode.trim(), playerName: playerName.trim() });
  };

  return (
    <GameLayout className="flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-text-dark" style={{ textShadow: '0 0 15px rgba(0, 173, 181, 0.5)' }}>
            The Imposter Game
          </h1>
          <p className="font-body text-base text-text-muted">
            Trust no one. Suspect everyone. Good luck! 😈
          </p>
        </div>

        <GameCard>
          {error && (
            <div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-lg">
              <p className="text-error text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-xl text-text-muted">person</span>
              </div>
              <input
                className="w-full h-12 pl-12 pr-4 bg-black/20 border border-border-color rounded-lg text-text-light placeholder:text-text-muted/70 focus:border-primary focus:outline-none transition-colors"
                placeholder="Your totally innocent name..."
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Create Game Button */}
            <button
              onClick={createGame}
              disabled={isLoading || !playerName.trim()}
              className="w-full h-12 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined">add</span>
                  Start the Chaos
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border-color"></div>
              <span className="text-sm font-semibold uppercase text-text-muted">OR</span>
              <div className="flex-1 h-px bg-border-color"></div>
            </div>

            {/* Join Game Section */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="font-display text-lg font-bold text-text-dark">Crash Someone's Party</p>
              </div>
              
              <input
                className="w-full h-12 px-4 bg-black/20 border border-border-color rounded-lg text-text-light placeholder:text-text-muted/50 text-center text-xl font-mono tracking-widest focus:border-secondary focus:outline-none transition-colors"
                placeholder="SECRET CODE"
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                maxLength={4}
              />
              
              <button
                onClick={joinGame}
                disabled={isLoading || !gameCode.trim() || !playerName.trim()}
                className="w-full h-12 bg-secondary hover:bg-secondary-hover disabled:bg-secondary/50 text-background font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined">login</span>
                    Infiltrate Game
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></div>
            <span className="text-text-muted text-sm">
              {isConnected ? 'Ready to deceive' : 'Connection sus 🤨'}
            </span>
          </div>
        </GameCard>
      </div>
    </GameLayout>
  );
}