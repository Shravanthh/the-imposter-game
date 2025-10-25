'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Gamepad2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { socketManager } from '@/lib/socket';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createGame = () => {
    setIsLoading(true);
    const socket = socketManager.connect();
    
    socket.on('connect', () => {
      socket.emit('create-game', (response: any) => {
        if (response?.success) {
          localStorage.setItem('gameId', response.gameId);
          router.push(`/lobby?gameId=${response.gameId}&isHost=true`);
        } else {
          alert('Failed to create game');
        }
        setIsLoading(false);
      });
    });

    socket.on('connect_error', () => {
      alert('Cannot connect to server. Make sure the server is running on port 3001');
      setIsLoading(false);
    });
  };

  const joinGame = () => {
    if (!gameCode || !playerName) return;
    
    setIsLoading(true);
    const socket = socketManager.connect();
    
    socket.emit('join-game', { gameId: gameCode, playerName }, (response: any) => {
      if (response.success) {
        localStorage.setItem('gameId', gameCode);
        localStorage.setItem('playerId', response.player.id);
        router.push(`/lobby?gameId=${gameCode}`);
      } else {
        alert(response.error);
      }
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 max-w-md w-full relative z-10"
      >
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-accent animate-bounce-slow" />
          <h1 className="text-4xl font-bold text-white mb-2">The Imposter</h1>
          <p className="text-white/70">Find the imposters through clever conversation!</p>
        </motion.div>

        <div className="space-y-6">
          <motion.button
            onClick={createGame}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" />
            Create Game
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/70">or</span>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            <input
              type="text"
              placeholder="Game Code (4 digits)"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.slice(0, 4))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            <motion.button
              onClick={joinGame}
              disabled={isLoading || !gameCode || !playerName}
              className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-5 h-5" />
              Join Game
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
