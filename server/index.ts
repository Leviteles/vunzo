import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import financialRouter from './routes/financial';

const app = express();
const PORT = process.env.PORT || 3001;

// Em desenvolvimento: localhost:5173. Em produção: URL do Netlify via FRONTEND_URL
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/financial', financialRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Vunzo API' }));

// Servir o build do frontend (produção)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// SPA fallback: todas as outras rotas retornam index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Vunzo API rodando em http://localhost:${PORT}`);
});
