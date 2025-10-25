'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageCircle, Vote, Trophy } from 'lucide-react';
import { socketManager } from '@/lib/socket';
import { useSearchParams } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import Confetti from 'react-confetti';

interface Player {
  id: string;
  name: string;
  role: 'civilian' | 'imposter';
  score: number;
  hasVoted: boolean;
}

interface Game {
  id: string;
  players: Player[];
  state: string;
  currentObject?: string;
  round: number;
}

export default function Game() {
  const [game, setGame] = useState<Game | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');

  useEffect(() => {
    const socket = socketManager.connect();
    const playerId = localStorage.getItem('playerId');
    
    socket.on('game-updated', (updatedGame: Game) => {
      setGame(updatedGame);
      const player = updatedGame.players.find(p => p.id === playerId);
      setCurrentPlayer(player || null);
      
      if (updatedGame.state === 'RESULT') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    });

    return () => {
      socket.off('game-updated');
    };
  }, []);

  const nextPhase = () => {
    const socket = socketManager.getSocket();
    if (socket && gameId) {
      socket.emit('next-phase', { gameId });
    }
  };

  const castVote = (targetId: string) => {
    const socket = socketManager.getSocket();
    if (socket && gameId) {
      socket.emit('cast-vote', { gameId, targetId });
    }
  };

  if (!game || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  const renderGameState = () => {
    switch (game.state) {
      case 'REVEAL_ROLE':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass p-8 text-center max-w-md mx-auto"
          >
            <Eye className="w-16 h-16 mx-auto mb-4 text-accent animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-4">Your Role</h2>
            {currentPlayer.role === 'imposter' ? (
              <div className="space-y-4">
                <div className="text-6xl">🕵️</div>
                <h3 className="text-2xl font-bold text-danger">You are the IMPOSTER!</h3>
                <p className="text-white/70">You don't know the secret object. Listen carefully and try to blend in!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">👥</div>
                <h3 className="text-2xl font-bold text-success">You are a CIVILIAN!</h3>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-white/70 mb-2">The secret object is:</p>
                  <p className="text-3xl font-bold text-accent">{game.currentObject}</p>
                </div>
                <p className="text-white/70">Find the imposters through conversation!</p>
              </div>
            )}
            <motion.button
              onClick={nextPhase}
              className="btn-primary mt-6"
              whileHover={{ scale: 1.05 }}
            >
              Ready!
            </motion.button>
          </motion.div>
        );

      case 'DISCUSSION_ROUND_1':
      case 'DISCUSSION_ROUND_2':
        const round = game.state === 'DISCUSSION_ROUND_1' ? 1 : 2;
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 text-center"
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-accent animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">Discussion Round {round}</h2>
              <p className="text-white/70">
                {currentPlayer.role === 'imposter' 
                  ? "Listen carefully and try to figure out what the object is!"
                  : `Give subtle clues about "${game.currentObject}" without being too obvious!`
                }
              </p>
            </motion.div>

            <div className="glass p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Players</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {game.players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl ${
                      player.id === currentPlayer.id 
                        ? 'bg-primary/30 border-2 border-primary' 
                        : 'bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-white font-medium">{player.name}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={nextPhase}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
              >
                {round === 1 ? 'Next Round' : 'Start Voting'}
              </motion.button>
            </div>
          </div>
        );

      case 'VOTING':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 text-center"
            >
              <Vote className="w-12 h-12 mx-auto mb-4 text-danger animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">Voting Time!</h2>
              <p className="text-white/70">Who do you think is the imposter?</p>
            </motion.div>

            <div className="glass p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.players.filter(p => p.id !== currentPlayer.id).map((player, index) => (
                  <motion.button
                    key={player.id}
                    onClick={() => castVote(player.id)}
                    disabled={currentPlayer.hasVoted}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      currentPlayer.hasVoted
                        ? 'bg-gray-500/20 border-gray-500/30 cursor-not-allowed'
                        : 'bg-white/10 border-white/20 hover:border-danger hover:bg-danger/20'
                    }`}
                    whileHover={!currentPlayer.hasVoted ? { scale: 1.02 } : {}}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium">{player.name}</div>
                        <div className="text-white/70 text-sm">Click to vote</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {currentPlayer.hasVoted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-success/20 rounded-xl text-center"
                >
                  <p className="text-white">Vote cast! Waiting for other players...</p>
                </motion.div>
              )}
            </div>

            {game.players.every(p => p.hasVoted) && (
              <div className="text-center">
                <motion.button
                  onClick={nextPhase}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                >
                  Reveal Results
                </motion.button>
              </div>
            )}
          </div>
        );

      case 'RESULT':
        const imposters = game.players.filter(p => p.role === 'imposter');
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            {showConfetti && <Confetti />}
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="glass p-8 text-center"
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 text-accent animate-bounce" />
              <h2 className="text-3xl font-bold text-white mb-4">Round Results!</h2>
              
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-white/70 mb-2">The secret object was:</p>
                  <p className="text-2xl font-bold text-accent">{game.currentObject}</p>
                </div>

                <div className="bg-danger/20 p-4 rounded-xl">
                  <p className="text-white/70 mb-2">The imposters were:</p>
                  <div className="flex justify-center gap-2">
                    {imposters.map(imp => (
                      <span key={imp.id} className="text-xl font-bold text-danger">
                        {imp.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                onClick={nextPhase}
                className="btn-primary mt-6"
                whileHover={{ scale: 1.05 }}
              >
                View Scores
              </motion.button>
            </motion.div>
          </div>
        );

      case 'LEADERBOARD':
        const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 text-center"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h2 className="text-2xl font-bold text-white">Leaderboard - Round {game.round}</h2>
            </motion.div>

            <div className="glass p-6">
              <div className="space-y-4">
                {sortedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      index === 0 ? 'bg-accent/20 border-2 border-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-white">#{index + 1}</div>
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-white font-medium">{player.name}</div>
                    </div>
                    <div className="text-2xl font-bold text-accent">{player.score}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={nextPhase}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
              >
                Next Round
              </motion.button>
            </div>
          </div>
        );

      default:
        return <div className="text-white text-center">Unknown game state</div>;
    }
  };

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />
      <div className="relative z-10">
        {renderGameState()}
      </div>
    </div>
  );
}
