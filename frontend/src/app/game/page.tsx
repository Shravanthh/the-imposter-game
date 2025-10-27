'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { GameState } from '@/types/game';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import GameLayout from '@/components/GameLayout';
import GameCard from '@/components/GameCard';
import ResultsDisplay from '@/components/ResultsDisplay';

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const { game, currentPlayer, isLoading, socket } = useSocket({
    gameId,
    onError: () => {}
  });

  const emit = (event: string, data?: any) => socket?.emit(event, data);

  if (isLoading) {
    return <LoadingScreen message="Loading your destiny... 🎭" />;
  }

  if (!game || !currentPlayer) {
    return <ErrorScreen 
      message="Game vanished into thin air! 💨" 
      onGoBack={() => router.push('/')} 
      buttonText="Escape to Safety" 
    />;
  }

  const renderGameState = () => {
    switch (game.state) {
      case GameState.REVEAL_ROLE:
        const allConfirmed = game.players.every(p => p.hasConfirmed);
        const readyCount = game.players.filter(p => p.hasConfirmed).length;
        
        return (
          <GameLayout className="flex-col items-center justify-center p-4">
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Role Card */}
                <div className="lg:col-span-2 flex flex-col items-center space-y-6">
                  <div className="text-center space-y-2">
                    <h1 className="font-display text-3xl md:text-4xl text-primary">
                      Who Are You Really? 🎭
                    </h1>
                    <p className="text-text-muted">
                      Click to discover your fate... if you dare!
                    </p>
                  </div>
                  
                  <div className="flex justify-center w-full">
                    <div 
                      className={`w-full max-w-sm h-80 flip-card cursor-pointer ${isCardFlipped ? 'is-flipped' : ''}`}
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                    >
                      <div className="flip-card-inner rounded-xl">
                        {/* Front */}
                        <div className="flip-card-front bg-slate-dark border-4 border-slate-light p-6 flex flex-col items-center justify-center shadow-lg hover:border-primary transition-colors">
                          <span className="material-symbols-outlined text-8xl text-primary mb-4">
                            psychology
                          </span>
                          <p className="font-display text-2xl text-white mb-2">REVEAL DESTINY</p>
                          <p className="text-white/70 text-sm tracking-widest">CLICK IF YOU DARE</p>
                        </div>
                        
                        {/* Back - Dark backgrounds to prevent reflections */}
                        <div className={`flip-card-back ${currentPlayer.role === 'imposter' ? 'bg-slate-800' : 'bg-slate-800'} flex flex-col items-center justify-center rounded-xl border-4 ${currentPlayer.role === 'imposter' ? 'border-red-500/50' : 'border-cyan-500/50'} p-6`}>
                          <div className="text-center space-y-4">
                            <span className={`material-symbols-outlined text-6xl ${currentPlayer.role === 'imposter' ? 'text-red-400' : 'text-cyan-400'}`}>
                              {currentPlayer.role === 'imposter' ? 'person_off' : 'gpp_good'}
                            </span>
                            <div>
                              <p className={`font-display text-xl mb-2 ${currentPlayer.role === 'imposter' ? 'text-red-400' : 'text-cyan-400'}`}>
                                {currentPlayer.role === 'imposter' ? 'MASTER OF DECEPTION' : 'TRUTH SEEKER'}
                              </p>
                              <p className="text-white/80 text-sm">
                                {currentPlayer.role === 'imposter' 
                                  ? 'Time to lie like your life depends on it! 😈'
                                  : 'Find the sneaky liar among you! 🕵️'
                                }
                              </p>
                            </div>
                            {currentPlayer.role !== 'imposter' && (
                              <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-cyan-500/30">
                                <p className="text-white/90 text-sm">
                                  Secret Word: <span className="font-bold text-cyan-400">{game.currentObject}</span>
                                </p>
                                <p className="text-cyan-400/80 text-xs mt-1">Don't let the imposter know! 🤫</p>
                              </div>
                            )}
                            {currentPlayer.role === 'imposter' && (
                              <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-red-500/30">
                                <p className="text-red-400 font-bold text-sm">🚫 NO CLUES FOR YOU!</p>
                                <p className="text-white/80 text-xs mt-1">Fake it till you make it! 🎪</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!currentPlayer.hasConfirmed && (
                    <div className="flex justify-center w-full">
                      <button
                        onClick={() => emit('confirm-role')}
                        className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        I Accept My Fate!
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Players Panel */}
                <div className="lg:col-span-1 flex justify-center">
                  <GameCard className="h-fit w-full">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-display text-xl text-primary mb-1">
                          Souls Prepared
                        </h3>
                        <p className="text-2xl font-bold text-text-dark">
                          {readyCount} / {game.players.length}
                        </p>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {game.players.map((player) => (
                          <div 
                            key={player.id}
                            className={`flex items-center gap-3 p-2 rounded-lg ${
                              player.hasConfirmed 
                                ? 'bg-success/20 border border-success/30' 
                                : 'bg-black/20 border border-border-color'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary ${
                              !player.hasConfirmed ? 'opacity-50' : ''
                            }`}>
                              <span className="font-bold text-white text-sm">
                                {player.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                player.hasConfirmed ? 'text-text-light' : 'text-text-muted'
                              }`}>
                                {player.id === currentPlayer.id ? 'You (obviously)' : player.name}
                              </p>
                            </div>
                            {player.hasConfirmed && (
                              <span className="material-symbols-outlined text-success text-lg" title="Ready for chaos!">check_circle</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {currentPlayer.isAdmin && allConfirmed && (
                        <button
                          onClick={() => emit('start-discussion')}
                          className="w-full py-3 bg-secondary hover:bg-secondary-hover text-background font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined">chat</span>
                          Release the Chaos!
                        </button>
                      )}
                    </div>
                  </GameCard>
                </div>
              </div>
            </div>
          </GameLayout>
        );

      case GameState.DISCUSSION:
        const currentTurnPlayer = game.discussionOrder?.[game.currentPlayerIndex ?? 0];
        const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
        
        return (
          <GameLayout 
            showBackButton 
            onBackClick={() => router.push(`/lobby?gameId=${gameId}`)}
            className="flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-4xl space-y-6">
              <div className="text-center">
                <h1 className="font-display text-3xl text-text-dark mb-2">Chaos Round {game.round} 🎪</h1>
                <p className="text-lg text-primary font-semibold">
                  {isMyTurn ? '🎤 YOUR TURN TO LIE... I MEAN SPEAK!' : `👂 ${currentTurnPlayer?.name} is probably lying right now`}
                </p>
              </div>

              <GameCard size="xl">
                <div className="space-y-6">
                  <h3 className="font-body text-xl text-text-dark flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">list</span>
                    Order of Deception
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {game.discussionOrder?.map((player, index) => (
                      <div
                        key={player.id}
                        className={`p-4 rounded-lg text-center transition-all ${
                          index === game.currentPlayerIndex 
                            ? 'bg-primary/20 border-2 border-primary' 
                            : index < (game.currentPlayerIndex ?? 0)
                            ? 'bg-success/20 border border-success/30'
                            : 'bg-black/20 border border-border-color'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="font-bold text-white">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="font-medium text-text-light text-sm mb-1">{player.name}</div>
                        <div className="text-xs">
                          {index < (game.currentPlayerIndex ?? 0) ? (
                            <span className="text-success">✅ Survived</span>
                          ) : index === game.currentPlayerIndex ? (
                            <span className="text-primary">🎤 Lying Now</span>
                          ) : (
                            <span className="text-text-muted">#{index + 1}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {(isMyTurn || currentPlayer.isAdmin) && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => emit('finish-turn')}
                        className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined">
                          {isMyTurn ? 'check' : 'skip_next'}
                        </span>
                        {isMyTurn ? 'Done Lying!' : 'Skip This Liar (Admin)'}
                      </button>
                    </div>
                  )}
                </div>
              </GameCard>
            </div>
          </GameLayout>
        );

      case GameState.VOTING:
        const allVoted = game.players.every(p => p.hasVoted);
        const votedCount = game.players.filter(p => p.hasVoted).length;
        
        if (currentPlayer.hasVoted && !allVoted) {
          return (
            <GameLayout className="flex-col items-center justify-center p-4">
              <GameCard>
                <div className="text-center space-y-6">
                  <span className="material-symbols-outlined text-8xl text-success">how_to_vote</span>
                  <div>
                    <h2 className="font-display text-3xl text-text-dark mb-2">Vote Locked! 🔒</h2>
                    <p className="text-text-muted">Waiting for others to point fingers...</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <p className="text-text-light font-medium">
                      Accusations made: {votedCount} / {game.players.length}
                    </p>
                  </div>
                </div>
              </GameCard>
            </GameLayout>
          );
        }

        if (allVoted && currentPlayer.isAdmin) {
          return (
            <GameLayout className="flex-col items-center justify-center p-4">
              <GameCard>
                <div className="text-center space-y-6">
                  <span className="material-symbols-outlined text-8xl text-primary">ballot</span>
                  <div>
                    <h2 className="font-display text-3xl text-text-dark mb-2">All Fingers Pointed! 👉</h2>
                    <p className="text-text-muted">Time to see who gets thrown under the bus!</p>
                  </div>
                  <button
                    onClick={() => emit('next-phase')}
                    className="w-full py-3 bg-secondary hover:bg-secondary-hover text-background font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    Reveal the Drama!
                  </button>
                </div>
              </GameCard>
            </GameLayout>
          );
        }
        
        return (
          <GameLayout 
            showBackButton 
            onBackClick={() => router.push(`/lobby?gameId=${gameId}`)}
            className="flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-4xl space-y-6">
              <div className="text-center">
                <h1 className="font-display text-3xl text-text-dark mb-2">Witch Hunt Time! 🔥</h1>
                <p className="text-text-muted">Who's getting voted off the island?</p>
              </div>

              <GameCard size="xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {game.players.filter(p => p.id !== currentPlayer.id).map((player) => (
                    <button
                      key={player.id}
                      onClick={() => emit('cast-vote', { targetId: player.id })}
                      disabled={currentPlayer.hasVoted}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentPlayer.hasVoted
                          ? 'bg-black/20 border-border-color cursor-not-allowed opacity-50'
                          : 'bg-black/20 border-border-color hover:border-error hover:bg-error/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <span className="font-bold text-white">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-text-light">{player.name}</div>
                          <div className="text-sm text-text-muted">
                            {currentPlayer.hasVoted ? '🔒 Accusation locked' : '🎯 Blame this person'}
                          </div>
                        </div>
                        {!currentPlayer.hasVoted && (
                          <span className="material-symbols-outlined text-error">touch_app</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </GameCard>
            </div>
          </GameLayout>
        );

      case GameState.RESULTS:
        return (
          <ResultsDisplay
            game={game}
            currentPlayer={currentPlayer}
            onNextRound={() => emit('next-phase')}
            onGoHome={() => router.push('/')}
          />
        );

      default:
        return (
          <GameLayout className="flex-col items-center justify-center p-4">
            <GameCard>
              <div className="text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-error">error</span>
                <p className="text-text-light">Game broke! Even we don't know what happened 🤷‍♂️</p>
              </div>
            </GameCard>
          </GameLayout>
        );
    }
  };

  return renderGameState();
}

export default function GamePage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading your destiny... 🎭" />}>
      <GamePageContent />
    </Suspense>
  );
}