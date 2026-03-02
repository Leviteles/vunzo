import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email já cadastrado' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  ).run(name, email, passwordHash);

  const secret = process.env.JWT_SECRET || 'vunzo_secret';
  const token = jwt.sign({ userId: result.lastInsertRowid }, secret, { expiresIn: '30d' });

  res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, plan: 'free' } });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email e senha são obrigatórios' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
    | { id: number; name: string; email: string; password_hash: string; plan: string }
    | undefined;

  if (!user) {
    res.status(401).json({ error: 'Email ou senha incorretos' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Email ou senha incorretos' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'vunzo_secret';
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '30d' });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

export default router;
