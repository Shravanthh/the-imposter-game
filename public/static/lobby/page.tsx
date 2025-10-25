'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Crown, Users, Play } from 'lucide-react';
import { socketManager } from '@/lib/socket';
import { useSearchParams, useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Game {
  id: string;
  players: Player[];
  state: string;
}

export default function Lobby() {
  const [game, setGame] = useState<Game | null>(null);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = searchParams.get('gameId');
  const isHost = searchParams.get('isHost') === 'true';

  useEffect(() => {
    if (!gameId) {
      router.push('/');
      return;
    }
    
    const socket = socketManager.connect();
    
    socket.on('connect', () => {
      if (isHost) {
        // Host creates the game
        socket.emit('create-game', (response: any) => {
          if (response.success) {
            // Update URL with correct game ID if different
            if (response.gameId !== gameId) {
              router.replace(`/lobby?gameId=${response.gameId}&isHost=true`);
            }
            setGame(response.game || { 
              id: response.gameId, 
              players: [], 
              state: 'LOBBY', 
              round: 1 
            });
          }
        });
      } else {
        // Regular player tries to get game
        socket.emit('get-game', { gameId }, (response: any) => {
          if (response.success) {
            setGame(response.game);
          } else {
            alert('Game not found!');
            router.push('/');
          }
        });
      }
    });
    
    socket.on('game-updated', (updatedGame: Game) => {
      setGame(updatedGame);
      if (updatedGame.state !== 'LOBBY') {
        router.push(`/game?gameId=${gameId}`);
      }
    });

    socket.on('connect_error', () => {
      alert('Cannot connect to server. Make sure server is running on port 3001.');
    });

    return () => {
      socket.off('game-updated');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [gameId, router, isHost]);

  const copyGameCode = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startGame = () => {
    const socket = socketManager.getSocket();
    if (socket && gameId) {
      socket.emit('start-game', { gameId });
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="glass p-8 text-center relative z-10">
          <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <div className="text-white text-xl">
            {isHost ? 'Creating game...' : 'Loading game...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Game Lobby</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">Game Code:</span>
                  <span className="text-2xl font-mono text-accent">{gameId}</span>
                  <motion.button
                    onClick={copyGameCode}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Copy className="w-4 h-4 text-white" />
                  </motion.button>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-success text-sm"
                    >
                      Copied!
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
            
            {isHost && (
              <motion.button
                onClick={startGame}
                disabled={game.players.length < 3}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                Start Game
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              Players ({game.players.length}/15)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {game.players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 rounded-xl p-4 flex items-center gap-3"
              >
                {index === 0 && <Crown className="w-5 h-5 text-accent" />}
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-medium">{player.name}</div>
                  <div className="text-white/70 text-sm">Score: {player.score}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {game.players.length < 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-accent/20 rounded-xl border border-accent/30"
            >
              <p className="text-white text-center">
                Need at least 3 players to start the game!
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
