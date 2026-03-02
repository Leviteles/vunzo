import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import financialRouter from './routes/financial';
import { ensureDb } from './database/db';

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Inicializa o banco antes de cada requisição (no-op após primeira chamada)
app.use(async (_req, _res, next) => {
  await ensureDb();
  next();
});

app.use('/auth', authRouter);
app.use('/financial', financialRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Vunzo API' }));

// Em ambiente local (não Netlify): serve o frontend estático
if (!process.env.NETLIFY) {
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

export default app;

// Em ambiente local: inicia o servidor normalmente
if (!process.env.NETLIFY) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Vunzo API rodando em http://localhost:${PORT}`);
  });
}
