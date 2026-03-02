import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialChartProps {
  income: number;
  fixedExpenses: Array<{ name: string; amount: number }>;
  variableExpenses: Array<{ name: string; amount: number }>;
  debts: Array<{ name: string; amount: number; rate: number }>;
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'];

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinancialChart({ income, fixedExpenses, variableExpenses, debts }: FinancialChartProps) {
  const totalFixed = fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const totalVariable = variableExpenses.reduce((s, e) => s + e.amount, 0);
  const totalDebtPayment = debts.reduce((s, d) => s + d.amount * (d.rate / 100), 0);
  const totalExpenses = totalFixed + totalVariable;
  const savings = Math.max(0, income - totalExpenses);

  const data = [
    { name: 'Gastos Fixos', value: totalFixed },
    { name: 'Gastos Variáveis', value: totalVariable },
    { name: 'Juros de Dívidas', value: Math.round(totalDebtPayment) },
    { name: 'Economia / Saldo', value: savings },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      const pct = ((payload[0].value / income) * 100).toFixed(1);
      return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-sm">
          <p className="font-semibold text-slate-700">{payload[0].name}</p>
          <p className="text-blue-600">{fmt(payload[0].value)}</p>
          <p className="text-slate-400">{pct}% da renda</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="section-title">Distribuição da Renda</h3>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Renda Total</span>
          <span className="font-semibold text-slate-700">{fmt(income)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-slate-500">Total de Gastos</span>
          <span className="font-semibold text-red-500">{fmt(totalExpenses)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-slate-500">Saldo Mensal</span>
          <span className={`font-semibold ${savings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {fmt(savings)}
          </span>
        </div>
      </div>
    </div>
  );
}
