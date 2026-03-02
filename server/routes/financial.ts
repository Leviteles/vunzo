import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { analyzeFinances, chatFinances, FinancialData } from '../services/claude';
import db from '../database/db';

const router = Router();

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: 15,
  premium: Infinity,
};

function getMonthlyUsage(userId: number): number {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const row = db.prepare(`
    SELECT COUNT(*) as count FROM financial_reports
    WHERE user_id = ? AND created_at >= ?
  `).get(userId, startOfMonth.toISOString()) as { count: number };

  return row.count;
}

router.post('/analyze', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: 'Não autenticado' }); return; }

  const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(userId) as
    | { plan: string }
    | undefined;

  const plan = user?.plan || 'free';
  const limit = PLAN_LIMITS[plan] ?? 3;
  const usage = getMonthlyUsage(userId);

  if (usage >= limit) {
    res.status(429).json({
      error: `Limite mensal atingido. Seu plano ${plan} permite ${limit} análise${limit !== 1 ? 's' : ''} por mês.`,
      limitReached: true,
      plan,
      usage,
      limit,
    });
    return;
  }

  const { income, fixedExpenses, variableExpenses, debts, assets } = req.body as FinancialData;

  if (!income || income <= 0) {
    res.status(400).json({ error: 'Renda mensal inválida' });
    return;
  }

  try {
    const report = await analyzeFinances({ income, fixedExpenses, variableExpenses, debts, assets });

    db.prepare(`
      INSERT INTO financial_reports
        (user_id, income, fixed_expenses, variable_expenses, debts, assets, ai_report)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      income,
      JSON.stringify(fixedExpenses || []),
      JSON.stringify(variableExpenses || []),
      JSON.stringify(debts || []),
      JSON.stringify(assets || []),
      report
    );

    res.json({ report });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar análise';
    res.status(500).json({ error: message });
  }
});

router.get('/usage', authMiddleware, (req: AuthRequest, res: Response): void => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: 'Não autenticado' }); return; }

  const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(userId) as
    | { plan: string }
    | undefined;

  const plan = user?.plan || 'free';
  const limit = PLAN_LIMITS[plan] ?? 3;
  const usage = getMonthlyUsage(userId);

  res.json({ plan, usage, limit: limit === Infinity ? null : limit });
});

router.post('/chat', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: 'Não autenticado' }); return; }

  const { reportContext, history, question } = req.body as {
    reportContext: string;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    question: string;
  };

  if (!question?.trim()) {
    res.status(400).json({ error: 'Pergunta não pode ser vazia' });
    return;
  }

  if (!reportContext) {
    res.status(400).json({ error: 'Contexto do relatório ausente' });
    return;
  }

  try {
    const answer = await chatFinances(reportContext, history || [], question);
    res.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar pergunta';
    res.status(500).json({ error: message });
  }
});

router.get('/history', authMiddleware, (req: AuthRequest, res: Response): void => {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ error: 'Não autenticado' }); return; }

  type ReportRow = {
    id: number;
    income: number;
    fixed_expenses: string;
    variable_expenses: string;
    debts: string;
    assets: string;
    ai_report: string;
    created_at: string;
  };

  const rows = db.prepare(`
    SELECT id, income, fixed_expenses, variable_expenses, debts, assets, ai_report, created_at
    FROM financial_reports
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as ReportRow[];

  const reports = rows.map(r => ({
    id: r.id,
    income: r.income,
    fixedExpenses: JSON.parse(r.fixed_expenses),
    variableExpenses: JSON.parse(r.variable_expenses),
    debts: JSON.parse(r.debts),
    assets: JSON.parse(r.assets),
    aiReport: r.ai_report,
    createdAt: r.created_at,
  }));

  res.json({ reports });
});

export default router;
