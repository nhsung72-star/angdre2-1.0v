import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateOutfitRecommendation } from './api/_lib/recommend.js';
import { getWeatherFromOpenMeteo } from './api/_lib/weather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  app.get('/api/weather', async (req, res) => {
    const latRaw = typeof req.query.latitude === 'string' ? req.query.latitude : '';
    const lonRaw = typeof req.query.longitude === 'string' ? req.query.longitude : '';
    const dateRaw = typeof req.query.date === 'string' ? req.query.date : undefined;

    const latitude = latRaw ? Number(latRaw) : Number.NaN;
    const longitude = lonRaw ? Number(lonRaw) : Number.NaN;

    const result = await getWeatherFromOpenMeteo({
      latitude,
      longitude,
      targetDate: dateRaw,
    });

    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(result.data);
  });

  app.post('/api/recommend-outfit', async (req, res) => {
    const result = await generateOutfitRecommendation(req.body);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.json(result.data);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

void startServer();
