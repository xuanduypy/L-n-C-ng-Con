import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRoute } from './src/server/apiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// API Handler
app.use(async (req, res, next) => {
  const url = req.url || '';
  const pathname = url.split('?')[0];
  if (pathname.startsWith('/api/') || pathname.startsWith('/.well-known/')) {
    try {
      const handled = await handleApiRoute(req, res, pathname);
      if (handled) return;
    } catch (e: any) {
      console.error('API Error:', e);
      res.status(500).json({ error: e.message });
      return;
    }
  }
  next();
});

// Serve frontend dist assets if available
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Lớn Cùng Con Server Running');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Lớn Cùng Con server running on port ${PORT}`);
});
