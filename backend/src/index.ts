import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import financialRouter from './routes/financial';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/financial', financialRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Vunzo API' }));

app.listen(PORT, () => {
  console.log(`Vunzo API rodando em http://localhost:${PORT}`);
});
