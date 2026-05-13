import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import newsRouter from './routes/news';
import admissionsRouter from './routes/admissions';
import { ensureSchema } from './db';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/news', newsRouter);
app.use('/api/admissions', admissionsRouter);

async function start() {
  try {
    await ensureSchema();
    app.listen(port, () => {
      console.log(`Backend iniciado en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
}

start();
