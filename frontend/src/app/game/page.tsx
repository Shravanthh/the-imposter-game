'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { GameState } from '@/types/game';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import GameLayout from '@/components/GameLayout';
import GameCard from '@/components/GameCard';

export default function GamePage() {
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
        const currentTurnPlayer = game.discussionOrder?.[game.currentPlayerIndex!];
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
                            : index < game.currentPlayerIndex!
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
                          {index < game.currentPlayerIndex ? (
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
        const imposters = game.players.filter(p => p.role === 'imposter');
        const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
        const crewWins = imposters.length === 0 || imposters.every(imp => game.players.some(p => p.votedFor === imp.id));
        
        return (
          <div className="relative min-h-screen bg-background flex flex-col">
            {/* Confetti */}
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="confetti"></div>
            ))}
            
            <div className="flex-1 flex flex-col p-4 sm:p-6">
              <main className="flex-1 flex flex-col items-center justify-center py-4">
                <div className="w-full max-w-7xl text-center mb-8">
                  <p className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-accent-gold to-green-300 mb-2">
                    {crewWins ? 'Truth Seekers Win! 🎉' : 'Liars Triumph! 😈'}
                  </p>
                  <p className="text-text-secondary text-lg">
                    The secret was: <span className="font-bold text-text-primary text-xl">{game.currentObject}</span>
                    {crewWins ? ' (Well done, detectives!)' : ' (Better luck next time!)'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl flex-1">
                  {/* Leaderboard */}
                  <div className="lg:col-span-1 flex justify-center">
                    <GameCard className="h-full w-full">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-text-primary">Hall of Fame (or Shame) 🏆</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {sortedPlayers.map((player, index) => (
                            <div key={player.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                              index === 0 ? 'bg-accent-gold/10 border border-accent-gold' : 'bg-black/20'
                            }`}>
                              <span className={`font-bold w-6 text-center ${
                                index === 0 ? 'text-accent-gold' : 'text-text-secondary'
                              }`}>
                                #{index + 1}
                              </span>
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                <span className="font-bold text-white text-sm">
                                  {player.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-text-primary font-semibold text-sm truncate">{player.name}</p>
                                <p className="text-text-secondary text-xs">{player.score} Chaos Points</p>
                              </div>
                              <span className={`font-bold text-sm ${
                                player.role === 'imposter' && !crewWins ? 'text-success' : 
                                player.role !== 'imposter' && crewWins ? 'text-success' : 'text-failure'
                              }`}>
                                {player.role === 'imposter' && !crewWins ? '+100' : 
                                 player.role !== 'imposter' && crewWins ? '+100' : '-50'}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Imposter Reveal */}
                        <div className="bg-primary/20 border border-primary/50 rounded-lg p-4 text-center">
                          <p className="text-primary text-xs font-bold tracking-widest mb-2">
                            THE SNEAKY LIAR{imposters.length > 1 ? 'S' : ''} {imposters.length > 1 ? 'WERE' : 'WAS'}
                          </p>
                          {imposters.map(imposter => (
                            <div key={imposter.id} className="space-y-2">
                              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto border-2 border-primary">
                                <span className="font-bold text-white text-lg">
                                  {imposter.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <p className="text-text-primary font-bold">{imposter.name}</p>
                              <p className="text-text-secondary text-xs">Master of Deception 🎭</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GameCard>
                  </div>

                  {/* Voting Results */}
                  <div className="lg:col-span-2 flex justify-center">
                    <GameCard className="h-full w-full">
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold text-text-primary">Who Blamed Who? 🫵</h2>
                        <div className="overflow-y-auto max-h-80">
                          <div className="space-y-2">
                            {game.players.map((player) => {
                              const targetPlayer = game.players.find(p => p.id === player.votedFor);
                              const votedCorrectly = targetPlayer?.role === 'imposter';
                              const isImposter = player.role === 'imposter';
                              
                              return (
                                <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg ${
                                  isImposter ? 'bg-primary/10 border border-primary/30' : 'bg-black/20'
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                      <span className="font-bold text-white text-sm">
                                        {player.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <span className={`font-medium ${isImposter ? 'text-primary' : 'text-text-light'}`}>
                                      {player.name} {isImposter ? '(The Liar)' : ''}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    {targetPlayer ? (
                                      <div className={`flex items-center gap-2 ${
                                        votedCorrectly ? 'text-success' : 'text-failure'
                                      }`}>
                                        <span className="material-symbols-outlined text-sm">
                                          {votedCorrectly ? 'check_circle' : 'cancel'}
                                        </span>
                                        <span className="text-sm">blamed {targetPlayer.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-text-secondary text-sm">Chickened out</span>
                                    )}
                                    
                                    <span className={`font-bold text-sm ${
                                      isImposter && !crewWins ? 'text-success' :
                                      !isImposter && crewWins ? 'text-success' :
                                      votedCorrectly ? 'text-success' : 'text-failure'
                                    }`}>
                                      {isImposter && !crewWins ? '+100' :
                                       !isImposter && crewWins ? '+100' :
                                       votedCorrectly ? '+100' : '-50'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </GameCard>
                  </div>
                </div>
              </main>

              {/* Footer */}
              <footer className="flex-shrink-0 flex justify-center">
                <div className="bg-surface/80 backdrop-blur-sm border border-border-color rounded-xl p-3 flex items-center gap-4 max-w-md">
                  <button 
                    onClick={() => router.push('/')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-black/20 text-text-primary text-sm font-medium rounded-lg border border-border-color hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span>Escape Chaos</span>
                  </button>
                  <button 
                    onClick={() => emit('next-phase')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-teal text-white text-sm font-bold rounded-lg hover:bg-accent-teal/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">skip_next</span>
                    <span>More Chaos!</span>
                  </button>
                </div>
              </footer>
            </div>
          </div>
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