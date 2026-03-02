import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AIReport from '../components/AIReport';
import FinancialChart from '../components/FinancialChart';
import FinancialChat from '../components/FinancialChat';
import { financialApi, FinancialReport } from '../services/api';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { calculateScore } from '../components/FinancialScore';
import { JurosCompostos, SimuladorDivida, MetaPoupanca } from './Calculadora';

type TabId = 'analise' | 'juros' | 'divida' | 'meta';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'analise', label: 'Análise Financeira', icon: '📊' },
  { id: 'juros',   label: 'Juros Compostos',    icon: '📈' },
  { id: 'divida',  label: 'Quitação de Dívida', icon: '💳' },
  { id: 'meta',    label: 'Meta de Poupança',   icon: '🎯' },
];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function EvolutionChart({ reports }: { reports: FinancialReport[] }) {
  const data = [...reports].reverse().map(r => {
    const totalExpenses =
      r.fixedExpenses.reduce((s, e) => s + e.amount, 0) +
      r.variableExpenses.reduce((s, e) => s + e.amount, 0);
    const score = calculateScore(r.income, r.fixedExpenses, r.variableExpenses, r.debts, r.assets).score;
    return {
      date: new Date(r.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      saldo: Math.round(r.income - totalExpenses),
      renda: Math.round(r.income),
      score,
    };
  });

  return (
    <div className="card">
      <h3 className="section-title">Evolução Financeira</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} width={48} />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === 'score' ? `${value} pts` : fmt(value),
              name === 'saldo' ? 'Saldo' : name === 'renda' ? 'Renda' : 'Score',
            ]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="renda" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="renda" />
          <Line type="monotone" dataKey="saldo" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} name="saldo" />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-600 inline-block rounded" /> Renda</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-600 inline-block rounded" /> Saldo</span>
      </div>
    </div>
  );
}

export default function History() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [selected, setSelected] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabId>('analise');

  useEffect(() => {
    financialApi.history()
      .then(res => {
        setReports(res.data.reports);
        if (res.data.reports.length > 0) setSelected(res.data.reports[0]);
      })
      .catch(() => setError('Erro ao carregar histórico.'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Análises</h1>
          <p className="text-slate-500 mt-1">Todas as suas análises financeiras anteriores.</p>
        </div>

        {loading && (
          <div className="card flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full" />
              <span className="text-sm">Carregando histórico...</span>
            </div>
          </div>
        )}

        {error && <div className="card bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

        {!loading && !error && reports.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-slate-600 font-medium">Nenhuma análise ainda</p>
            <p className="text-slate-400 text-sm mt-1">
              Faça sua primeira análise no{' '}
              <Link to="/dashboard" className="text-blue-600 font-semibold hover:underline">Dashboard</Link>
            </p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-6">
            {reports.length >= 2 && <EvolutionChart reports={reports} />}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-2">
                {reports.map(report => {
                  const totalExpenses =
                    report.fixedExpenses.reduce((s, e) => s + e.amount, 0) +
                    report.variableExpenses.reduce((s, e) => s + e.amount, 0);
                  const balance = report.income - totalExpenses;
                  const isSelected = selected?.id === report.id;
                  const score = calculateScore(report.income, report.fixedExpenses, report.variableExpenses, report.debts, report.assets).score;

                  return (
                    <button
                      key={report.id}
                      onClick={() => { setSelected(report); setTab('analise'); }}
                      className={`w-full text-left rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                      }`}
                    >
                      <p className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {formatDate(report.createdAt)}
                      </p>
                      <p className={`font-semibold mt-0.5 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                        {fmt(report.income)}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${isSelected ? 'text-blue-100' : balance >= 0 ? 'text-green-600' : 'text-red-400'}`}>
                          Saldo: {fmt(balance)}
                        </p>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {score} pts
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div className="lg:col-span-3 space-y-4">
                  {/* Tab bar */}
                  <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm overflow-x-auto">
                    {TABS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          tab === t.id
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Conteúdo da aba */}
                  {tab === 'analise' && (
                    <div className="space-y-5">
                      <FinancialChart
                        income={selected.income}
                        fixedExpenses={selected.fixedExpenses}
                        variableExpenses={selected.variableExpenses}
                        debts={selected.debts}
                      />
                      <AIReport report={selected.aiReport} createdAt={selected.createdAt} />
                      <FinancialChat key={selected.id} reportContext={selected.aiReport} />
                    </div>
                  )}
                  {tab === 'juros'  && <JurosCompostos />}
                  {tab === 'divida' && <SimuladorDivida />}
                  {tab === 'meta'   && <MetaPoupanca />}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
