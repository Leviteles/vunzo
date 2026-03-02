import React from 'react';

interface Props {
  income: number;
  fixedExpenses: Array<{ amount: number }>;
  variableExpenses: Array<{ amount: number }>;
  debts: Array<{ amount: number; rate: number }>;
  assets: Array<{ amount: number }>;
}

interface ScoreResult {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  ringColor: string;
  breakdown: Array<{ label: string; value: string; points: number; maxPoints: number }>;
}

export function calculateScore(
  income: number,
  fixedExpenses: Array<{ amount: number }>,
  variableExpenses: Array<{ amount: number }>,
  debts: Array<{ amount: number; rate: number }>,
  assets: Array<{ amount: number }>
): ScoreResult {
  const totalFixed = fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const totalVariable = variableExpenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalVariable;
  const totalDebts = debts.reduce((s, d) => s + d.amount, 0);
  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const monthlySavings = income - totalExpenses;
  const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;
  const debtToIncome = income > 0 ? (totalDebts / (income * 12)) * 100 : 0;
  const maxDebtRate = debts.length > 0 ? Math.max(...debts.map(d => d.rate)) : 0;

  // Savings rate: 0–35 pts
  let savingsPoints = 0;
  if (savingsRate >= 30) savingsPoints = 35;
  else if (savingsRate >= 20) savingsPoints = 28;
  else if (savingsRate >= 10) savingsPoints = 18;
  else if (savingsRate >= 0) savingsPoints = 8;
  else savingsPoints = 0;

  // Debt-to-annual-income ratio: 0–25 pts
  let debtPoints = 0;
  if (debtToIncome === 0) debtPoints = 25;
  else if (debtToIncome <= 20) debtPoints = 22;
  else if (debtToIncome <= 40) debtPoints = 16;
  else if (debtToIncome <= 80) debtPoints = 8;
  else debtPoints = 2;

  // Emergency fund (assets >= 3 months expenses): 0–20 pts
  const emergencyTarget = totalExpenses * 3;
  let emergencyPoints = 0;
  if (totalAssets >= emergencyTarget * 2) emergencyPoints = 20;
  else if (totalAssets >= emergencyTarget) emergencyPoints = 16;
  else if (totalAssets >= emergencyTarget / 2) emergencyPoints = 10;
  else if (totalAssets > 0) emergencyPoints = 5;

  // Debt interest rate (lower is better): 0–20 pts
  let interestPoints = 0;
  if (maxDebtRate === 0) interestPoints = 20;
  else if (maxDebtRate <= 1) interestPoints = 18;
  else if (maxDebtRate <= 3) interestPoints = 12;
  else if (maxDebtRate <= 6) interestPoints = 6;
  else interestPoints = 1;

  const score = savingsPoints + debtPoints + emergencyPoints + interestPoints;

  let label = '';
  let color = '';
  let bgColor = '';
  let ringColor = '';

  if (score >= 80) {
    label = 'Excelente'; color = 'text-green-600'; bgColor = 'bg-green-50'; ringColor = 'stroke-green-500';
  } else if (score >= 60) {
    label = 'Bom'; color = 'text-blue-600'; bgColor = 'bg-blue-50'; ringColor = 'stroke-blue-500';
  } else if (score >= 40) {
    label = 'Atenção'; color = 'text-amber-600'; bgColor = 'bg-amber-50'; ringColor = 'stroke-amber-500';
  } else {
    label = 'Crítico'; color = 'text-red-600'; bgColor = 'bg-red-50'; ringColor = 'stroke-red-500';
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return {
    score,
    label,
    color,
    bgColor,
    ringColor,
    breakdown: [
      {
        label: 'Taxa de poupança',
        value: `${savingsRate.toFixed(1)}% (${fmt(Math.max(0, monthlySavings))}/mês)`,
        points: savingsPoints,
        maxPoints: 35,
      },
      {
        label: 'Nível de endividamento',
        value: debtToIncome === 0 ? 'Sem dívidas' : `${debtToIncome.toFixed(0)}% da renda anual`,
        points: debtPoints,
        maxPoints: 25,
      },
      {
        label: 'Reserva de emergência',
        value: totalAssets === 0 ? 'Sem reserva' : `${fmt(totalAssets)} em patrimônio`,
        points: emergencyPoints,
        maxPoints: 20,
      },
      {
        label: 'Taxa de juros das dívidas',
        value: maxDebtRate === 0 ? 'Sem dívidas' : `${maxDebtRate}% a.m. (máx.)`,
        points: interestPoints,
        maxPoints: 20,
      },
    ],
  };
}

export default function FinancialScore({ income, fixedExpenses, variableExpenses, debts, assets }: Props) {
  const result = calculateScore(income, fixedExpenses, variableExpenses, debts, assets);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <div className={`card ${result.bgColor} border-0`}>
      <h3 className="section-title">Score de Saúde Financeira</h3>

      <div className="flex items-center gap-6 mb-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              className={result.ringColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${result.color}`}>{result.score}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
        </div>
        <div>
          <p className={`text-xl font-black ${result.color}`}>{result.label}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            Pontuação baseada em 4 critérios financeiros
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {result.breakdown.map(item => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">{item.label}</span>
              <span className={`font-bold ${result.color}`}>{item.points}/{item.maxPoints} pts</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${result.ringColor.replace('stroke-', 'bg-')}`}
                style={{ width: `${(item.points / item.maxPoints) * 100}%`, transition: 'width 1s ease' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
