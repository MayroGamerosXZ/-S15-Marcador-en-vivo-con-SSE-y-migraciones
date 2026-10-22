import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { matchesRouter } from './routes/matches.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Logging sencillo de peticiones
app.use((req, _res, next) => {
  if (!req.url.includes('/events/stream')) {
    console.log(`[HTTP] ${req.method} ${req.url}`);
  }
  next();
});

// Rutas de la API
app.use('/api/matches', matchesRouter);

// Ruta de comprobación de salud del servidor
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Live Scoreboard SSE API'
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  ⚽ SERVIDOR DE MARCADOR EN VIVO CON SSE ACTIVO`);
  console.log(`  🚀 API escuchando en: http://localhost:${PORT}`);
  console.log(`  📡 Endpoint SSE: http://localhost:${PORT}/api/matches/:id/events/stream`);
  console.log(`====================================================`);
});
