import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { client } from '../database/db';

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

  const existing = await client.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email],
  });

  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'Email já cadastrado' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await client.execute({
    sql: 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    args: [name, email, passwordHash],
  });

  const userId = Number(result.lastInsertRowid);
  const secret = process.env.JWT_SECRET || 'vunzo_secret';
  const token = jwt.sign({ userId }, secret, { expiresIn: '30d' });

  res.status(201).json({ token, user: { id: userId, name, email, plan: 'free' } });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email e senha são obrigatórios' });
    return;
  }

  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Email ou senha incorretos' });
    return;
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, String(user.password_hash));

  if (!valid) {
    res.status(401).json({ error: 'Email ou senha incorretos' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'vunzo_secret';
  const token = jwt.sign({ userId: Number(user.id) }, secret, { expiresIn: '30d' });

  res.json({
    token,
    user: { id: Number(user.id), name: String(user.name), email: String(user.email), plan: String(user.plan) },
  });
});

export default router;
