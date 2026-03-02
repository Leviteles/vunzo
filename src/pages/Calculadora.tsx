import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ── Juros Compostos ──────────────────────────────────────
export function JurosCompostos() {
  const [principal, setPrincipal] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [months, setMonths] = useState('');
  const [result, setResult] = useState<null | { total: number; invested: number; earnings: number }>(null);

  const calculate = () => {
    const p = parseFloat(principal) || 0;
    const m = parseFloat(monthly) || 0;
    const r = parseFloat(rate) / 100;
    const n = parseInt(months) || 0;

    if (r === 0 || n === 0) {
      setResult({ total: p + m * n, invested: p + m * n, earnings: 0 });
      return;
    }

    const totalPrincipal = p * Math.pow(1 + r, n);
    const totalMonthly = m * ((Math.pow(1 + r, n) - 1) / r);
    const total = totalPrincipal + totalMonthly;
    const invested = p + m * n;
    setResult({ total, invested, earnings: total - invested });
  };

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-slate-800 mb-1">Calculadora de Juros Compostos</h2>
      <p className="text-sm text-slate-500 mb-5">Simule o crescimento do seu investimento ao longo do tempo.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Investimento inicial (R$)</label>
          <input className="input-field" type="number" min="0" placeholder="Ex: 1000" value={principal} onChange={e => setPrincipal(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Aporte mensal (R$)</label>
          <input className="input-field" type="number" min="0" placeholder="Ex: 200" value={monthly} onChange={e => setMonthly(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Taxa de juros (% a.m.)</label>
          <input className="input-field" type="number" min="0" step="0.01" placeholder="Ex: 1.0" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Período (meses)</label>
          <input className="input-field" type="number" min="1" placeholder="Ex: 24" value={months} onChange={e => setMonths(e.target.value)} />
        </div>
      </div>

      <button onClick={calculate} className="btn-primary w-full mb-5">Calcular</button>

      {result && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Total investido</p>
            <p className="font-bold text-slate-700">{fmt(result.invested)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Rendimento</p>
            <p className="font-bold text-green-600">{fmt(result.earnings)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Montante final</p>
            <p className="font-bold text-blue-600">{fmt(result.total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Simulador de Quitação de Dívida ─────────────────────
export function SimuladorDivida() {
  const [debt, setDebt] = useState('');
  const [rate, setRate] = useState('');
  const [payment, setPayment] = useState('');
  const [result, setResult] = useState<null | { months: number; totalPaid: number; totalInterest: number; minPayment: number }>(null);
  const [error, setError] = useState('');

  const calculate = () => {
    setError('');
    const d = parseFloat(debt);
    const r = parseFloat(rate) / 100;
    const p = parseFloat(payment);

    if (!d || !r || !p) { setError('Preencha todos os campos.'); return; }

    const minPayment = d * r;
    if (p <= minPayment) {
      setError(`Pagamento mínimo para cobrir juros é ${fmt(minPayment)}. Aumente o valor da parcela.`);
      return;
    }

    let balance = d;
    let totalPaid = 0;
    let months = 0;

    while (balance > 0 && months < 600) {
      const interest = balance * r;
      balance = balance + interest - p;
      totalPaid += p;
      months++;
      if (balance < p) { totalPaid += balance; balance = 0; months++; break; }
    }

    setResult({ months, totalPaid, totalInterest: totalPaid - d, minPayment });
  };

  const formatMonths = (m: number) => {
    const years = Math.floor(m / 12);
    const mo = m % 12;
    if (years === 0) return `${mo} ${mo === 1 ? 'mês' : 'meses'}`;
    if (mo === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    return `${years}a ${mo}m`;
  };

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-slate-800 mb-1">Simulador de Quitação de Dívida</h2>
      <p className="text-sm text-slate-500 mb-5">Descubra em quanto tempo você quita sua dívida pagando um valor fixo.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Valor total da dívida (R$)</label>
          <input className="input-field" type="number" min="0" placeholder="Ex: 5000" value={debt} onChange={e => setDebt(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Taxa de juros (% a.m.)</label>
          <input className="input-field" type="number" min="0" step="0.1" placeholder="Ex: 3.5" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Pagamento mensal (R$)</label>
          <input className="input-field" type="number" min="0" placeholder="Ex: 300" value={payment} onChange={e => setPayment(e.target.value)} />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

      <button onClick={calculate} className="btn-primary w-full mb-5">Simular</button>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Tempo para quitar</p>
              <p className="font-bold text-blue-600">{formatMonths(result.months)}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Total pago</p>
              <p className="font-bold text-amber-600">{fmt(result.totalPaid)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Total em juros</p>
              <p className="font-bold text-red-500">{fmt(result.totalInterest)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Pagamento mínimo para cobrir juros: {fmt(result.minPayment)}/mês
          </p>
        </>
      )}
    </div>
  );
}

// ── Calculadora de Meta de Poupança ──────────────────────
export function MetaPoupanca() {
  const [goal, setGoal] = useState('');
  const [saved, setSaved] = useState('');
  const [monthly, setMonthly] = useState('');
  const [result, setResult] = useState<null | { months: number; remaining: number }>(null);

  const calculate = () => {
    const g = parseFloat(goal);
    const s = parseFloat(saved) || 0;
    const m = parseFloat(monthly);
    if (!g || !m || m <= 0) return;
    const remaining = Math.max(0, g - s);
    const months = Math.ceil(remaining / m);
    setResult({ months, remaining });
  };

  const formatMonths = (m: number) => {
    const years = Math.floor(m / 12);
    const mo = m % 12;
    if (years === 0) return `${mo} ${mo === 1 ? 'mês' : 'meses'}`;
    if (mo === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    return `${years} anos e ${mo} meses`;
  };

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-slate-800 mb-1">Calculadora de Meta de Poupança</h2>
      <p className="text-sm text-slate-500 mb-5">Saiba em quanto tempo você atinge sua meta poupando todo mês.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Meta (R$)</label>
          <input className="input-field" type="number" min="0" placeholder="Ex: 20000" value={goal} onChange={e => setGoal(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Já tenho (R$)</label>
          <input className="input-field" type="number" min="0" placeholder="Ex: 3000" value={saved} onChange={e => setSaved(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1.5">Aporte mensal (R$)</label>
          <input className="input-field" type="number" min="0" placeholder="Ex: 500" value={monthly} onChange={e => setMonthly(e.target.value)} />
        </div>
      </div>

      <button onClick={calculate} className="btn-primary w-full mb-5">Calcular</button>

      {result && (
        <div className="bg-green-50 rounded-xl p-5 text-center">
          <p className="text-slate-500 text-sm mb-1">Faltam {fmt(result.remaining)} para sua meta</p>
          <p className="text-3xl font-black text-green-600">{formatMonths(result.months)}</p>
          <p className="text-slate-400 text-xs mt-1">
            Poupando {fmt(parseFloat(monthly || '0'))} por mês
          </p>
        </div>
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────
export default function Calculadora() {
  const [tab, setTab] = useState<'juros' | 'divida' | 'meta'>('juros');

  const tabs = [
    { id: 'juros' as const, label: 'Juros Compostos', icon: '📈' },
    { id: 'divida' as const, label: 'Quitação de Dívida', icon: '💳' },
    { id: 'meta' as const, label: 'Meta de Poupança', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Calculadoras Financeiras</h1>
          <p className="text-slate-500 mt-1">Ferramentas para simular e planejar sua vida financeira.</p>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'juros' && <JurosCompostos />}
        {tab === 'divida' && <SimuladorDivida />}
        {tab === 'meta' && <MetaPoupanca />}
      </main>
    </div>
  );
}
