import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { networkInterfaces } from 'os';
import { SocketHandler } from './socket-handler';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'The Imposter Game Backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const socketHandler = new SocketHandler();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socketHandler.handleConnection(io, socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT: number = parseInt(process.env.PORT || '3001', 10);

server.listen(PORT, '0.0.0.0', () => {
  const nets = networkInterfaces();
  const localIPs: string[] = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        localIPs.push(net.address);
      }
    }
  }
  
  if (localIPs.length > 0) {
    console.log(`🌐 Network access:`);
    localIPs.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
  }
});