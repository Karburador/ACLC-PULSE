import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes/api.js';
import { initDatabaseConnection } from './server/services/dataStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup to allow frontend (Vercel deployment or local Vite)
const clientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (!clientUrl || clientUrl === '*' || origin === clientUrl || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      // Allow any Vercel preview or production domains if configured
      if (origin.endsWith('.vercel.app') || origin.includes('run.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/preview for ease of use
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API routes
app.use('/api', apiRouter);

// Database initialization
initDatabaseConnection().then((res) => {
  console.log(`[ACLC-Pulse DB] ${res.message}`);
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Vite Dev Server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend build in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 ACLC-Pulse server running on port ${PORT} (${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
