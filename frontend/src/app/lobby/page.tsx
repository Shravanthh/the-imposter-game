'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import GameLayout from '@/components/GameLayout';
import GameCard from '@/components/GameCard';

export default function Lobby() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [startingGame, setStartingGame] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');

  const { game, currentPlayer, isLoading, socket } = useSocket({
    gameId,
    onError: setError
  });

  const copyGameCode = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startGame = () => {
    if (socket && currentPlayer?.isAdmin) {
      setStartingGame(true);
      setError('');
      socket.emit('start-game');
    }
  };

  const kickPlayer = (playerId: string) => {
    socket?.emit('kick-player', { playerId });
  };

  const goBack = () => {
    localStorage.removeItem('gameSession');
    router.push('/');
  };

  if (isLoading) {
    return <LoadingScreen message="Reconnecting... Please don't leave us! 🥺" onGoBack={goBack} />;
  }

  if (error && !game) {
    return <ErrorScreen title="Oops! Something broke 💥" message={error} onGoBack={goBack} />;
  }

  if (!game) {
    return <LoadingScreen onGoBack={goBack} />;
  }

  return (
    <GameLayout 
      showBackButton 
      onBackClick={goBack}
      className="flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-6 mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-text-dark" style={{ textShadow: '0 0 10px rgba(0, 173, 181, 0.5)' }}>
            The Waiting Room of Doom
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-body text-text-muted">Secret Code:</span>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg px-4 py-2">
                <span className="font-mono text-2xl font-bold tracking-widest text-primary">{gameId}</span>
                <button
                  onClick={copyGameCode}
                  className="p-1 text-text-muted hover:text-text-light transition-colors"
                  title={copied ? "Copied! Share the chaos 📋" : "Copy this magical code"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
            
            {currentPlayer?.isAdmin && (
              <button
                onClick={startGame}
                disabled={game.players.length < 3 || startingGame}
                className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                title={game.players.length < 3 ? "Need more victims... I mean players!" : "Let the games begin!"}
              >
                {startingGame ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                    Begin the Madness
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <GameCard size="full">
          {error && (
            <div className="mb-6 p-4 bg-error/20 border border-error/30 rounded-lg">
              <p className="text-error text-center">💀 {error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-body text-xl font-semibold text-text-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group</span>
                Suspects Gathered ({game.players.length}/15)
              </h2>
              
              {game.players.length < 3 && (
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-lg">info</span>
                  <span className="text-sm font-medium">Need more chaos makers!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {game.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-black/20 rounded-lg p-4 border border-border-color hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {player.isAdmin && (
                        <span className="material-symbols-outlined text-lg text-primary" title="The Boss 👑">crown</span>
                      )}
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="font-body font-bold text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-body font-medium text-text-light truncate">{player.name}</div>
                        <div className="font-body text-xs text-text-muted">Chaos Points: {player.score}</div>
                      </div>
                    </div>
                    
                    {currentPlayer?.isAdmin && !player.isAdmin && (
                      <button
                        onClick={() => kickPlayer(player.id)}
                        className="p-1 text-error hover:text-error/80 transition-colors"
                        title="Banish this player to the shadow realm"
                      >
                        <span className="material-symbols-outlined text-lg">person_remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="relative">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-success rounded-full animate-ping"></div>
              </div>
              <p className="font-body text-sm text-text-muted">
                Waiting for more brave souls to join the chaos...
              </p>
            </div>
          </div>
        </GameCard>
      </div>
    </GameLayout>
  );
}