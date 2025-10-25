import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { networkInterfaces } from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all origins
  app.enableCors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  
  // Bind to all network interfaces (0.0.0.0) for local network access
  await app.listen(port, '0.0.0.0');
  
  // Get local IP addresses
  const nets = networkInterfaces();
  const localIPs = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIPs.push(net.address);
      }
    }
  }
  
  console.log(`🚀 The Imposter Game is running!`);
  console.log(`📱 Local access: http://localhost:${port}`);
  
  if (localIPs.length > 0) {
    console.log(`🌐 Network access:`);
    localIPs.forEach(ip => {
      console.log(`   http://${ip}:${port}`);
    });
    console.log(`\n🎮 Share the network URL with friends on the same WiFi!`);
  } else {
    console.log(`⚠️  No network interfaces found. Check your network connection.`);
  }
}
bootstrap();
