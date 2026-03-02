import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { financialApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Usage {
  plan: string;
  usage: number;
  limit: number | null;
}

const PLANS = [
  {
    id: 'free',
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    color: 'slate',
    analyses: 3,
    features: [
      '3 análises por mês',
      'Relatório completo da IA',
      'Score financeiro',
      'Gráficos de distribuição',
      'Histórico de análises',
    ],
    missing: [
      'Calculadoras financeiras avançadas',
      'Exportação em PDF',
      'Suporte prioritário',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 19,90',
    period: '/mês',
    color: 'blue',
    analyses: 15,
    popular: true,
    features: [
      '15 análises por mês',
      'Relatório completo da IA',
      'Score financeiro',
      'Gráficos de distribuição',
      'Histórico de análises',
      'Calculadoras financeiras avançadas',
      'Exportação em PDF',
    ],
    missing: [
      'Suporte prioritário',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 39,90',
    period: '/mês',
    color: 'green',
    analyses: Infinity,
    features: [
      'Análises ilimitadas',
      'Relatório completo da IA',
      'Score financeiro',
      'Gráficos de distribuição',
      'Histórico de análises',
      'Calculadoras financeiras avançadas',
      'Exportação em PDF',
      'Suporte prioritário',
    ],
    missing: [],
  },
];

export default function Planos() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    financialApi.usage().then(res => setUsage(res.data)).catch(() => null);
  }, []);

  const currentPlan = usage?.plan || user?.plan || 'free';
  const usageCount = usage?.usage ?? 0;
  const usageLimit = usage?.limit;

  const usagePercent = usageLimit
    ? Math.min(100, Math.round((usageCount / usageLimit) * 100))
    : 0;

  const usageColor =
    usagePercent >= 90 ? 'bg-red-500' :
    usagePercent >= 60 ? 'bg-yellow-500' :
    'bg-blue-500';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Escolha seu plano</h1>
          <p className="text-slate-500">Desbloqueie todo o potencial do seu assessor financeiro pessoal</p>
        </div>

        {/* Current usage card */}
        <div className="card mb-10 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500">Seu plano atual</p>
              <p className="text-xl font-bold text-slate-800 capitalize">{currentPlan}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              currentPlan === 'premium' ? 'bg-green-100 text-green-700' :
              currentPlan === 'pro' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {currentPlan}
            </span>
          </div>

          <div className="mb-1 flex justify-between text-sm text-slate-500">
            <span>Análises este mês</span>
            <span className="font-semibold text-slate-700">
              {usageCount} / {usageLimit === null ? '∞' : usageLimit}
            </span>
          </div>
          {usageLimit !== null && (
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usageColor}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
          {usageLimit === null && (
            <div className="h-2 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full w-full" />
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-shadow ${
                  isCurrent
                    ? plan.id === 'pro'
                      ? 'border-blue-500 shadow-lg shadow-blue-100'
                      : plan.id === 'premium'
                      ? 'border-green-500 shadow-lg shadow-green-100'
                      : 'border-slate-300 shadow-md'
                    : isPopular
                    ? 'border-blue-300 shadow-md'
                    : 'border-slate-200 bg-white shadow-sm'
                } bg-white`}
              >
                {isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${
                      plan.id === 'premium' ? 'bg-green-600' :
                      plan.id === 'pro' ? 'bg-blue-600' : 'bg-slate-500'
                    }`}>
                      PLANO ATUAL
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-800">{plan.name}</h2>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-black text-slate-800">{plan.price}</span>
                    <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.id === 'premium' ? 'text-green-500' :
                        plan.id === 'pro' ? 'text-blue-500' : 'text-slate-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Link
                    to="/dashboard"
                    className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      plan.id === 'premium'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : plan.id === 'pro'
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Ir para o dashboard
                  </Link>
                ) : (
                  <button
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      plan.id === 'premium'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : plan.id === 'pro'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-600 hover:bg-slate-700 text-white'
                    }`}
                    onClick={() => alert(`Em breve! Integração com pagamento para o plano ${plan.name}.`)}
                  >
                    {currentPlan === 'free' && plan.id !== 'free'
                      ? `Assinar ${plan.name}`
                      : plan.id === 'free'
                      ? 'Fazer downgrade'
                      : `Mudar para ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Pagamento seguro. Cancele quando quiser. Dúvidas?{' '}
          <a href="mailto:suporte@vunzo.com" className="text-blue-500 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
