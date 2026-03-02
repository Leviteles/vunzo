import { useState, useRef, useEffect, RefObject } from 'react';
import { Link } from 'react-router-dom';

function useReveal(threshold = 0.12): { ref: RefObject<HTMLElement>; visible: boolean } {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800 text-sm sm:text-base">{question}</span>
        <span className={`text-blue-600 text-xl font-light transition-transform shrink-0 ml-3 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

const features = [
  {
    icon: '📊',
    title: 'Análise Inteligente',
    description: 'A IA analisa sua renda, gastos e dívidas e gera um diagnóstico financeiro completo e personalizado.',
  },
  {
    icon: '🎯',
    title: 'Plano de Ação',
    description: 'Receba um plano de ação em 30, 60 e 90 dias com metas claras e alcançáveis para melhorar suas finanças.',
  },
  {
    icon: '📈',
    title: 'Histórico Completo',
    description: 'Acompanhe sua evolução financeira ao longo do tempo com o histórico de todas as suas análises.',
  },
  {
    icon: '🔒',
    title: 'Segurança Total',
    description: 'Seus dados financeiros são protegidos com autenticação segura e nunca compartilhados com terceiros.',
  },
];

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0,00',
    period: 'para sempre',
    description: 'Ideal para começar a organizar suas finanças.',
    highlight: false,
    badge: null,
    features: [
      '3 análises por mês',
      'Relatório básico da IA',
      'Gráfico de distribuição',
      'Histórico dos últimos 30 dias',
      'Suporte por e-mail',
    ],
    missing: [
      'Plano de ação detalhado',
      'Estratégia de quitação de dívidas',
      'Histórico ilimitado',
    ],
    cta: 'Começar grátis',
    ctaLink: '/register',
    ctaStyle: 'btn-secondary',
  },
  {
    name: 'Pro',
    price: 'R$ 19,90',
    period: 'por mês',
    description: 'Para quem quer controle financeiro de verdade.',
    highlight: true,
    badge: 'Mais popular',
    features: [
      '15 análises por mês',
      'Relatório completo da IA',
      'Gráfico de distribuição',
      'Histórico dos últimos 6 meses',
      'Plano de ação 30/60/90 dias',
      'Estratégia de quitação de dívidas',
      'Suporte prioritário',
    ],
    missing: [],
    cta: 'Assinar Pro',
    ctaLink: '/register',
    ctaStyle: 'btn-primary',
  },
  {
    name: 'Premium',
    price: 'R$ 39,90',
    period: 'por mês',
    description: 'Controle total para quem leva finanças a sério.',
    highlight: false,
    badge: null,
    features: [
      'Análises ilimitadas',
      'Relatório completo da IA',
      'Gráfico de distribuição',
      'Histórico ilimitado',
      'Plano de ação 30/60/90 dias',
      'Estratégia de quitação de dívidas',
      'Metas e projeções financeiras',
      'Suporte VIP via chat',
    ],
    missing: [],
    cta: 'Assinar Premium',
    ctaLink: '/register',
    ctaStyle: 'btn-secondary',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-black text-xl text-slate-800">Vunzo</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            Assessor financeiro com IA
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight mb-6">
            Tome o controle das{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              suas finanças
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A Vunzo usa inteligência artificial para analisar sua situação financeira,
            identificar oportunidades de economia e criar um plano de ação personalizado para você.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base py-3 px-8">
              Começar grátis agora
            </Link>
            <a href="#planos" className="btn-secondary text-base py-3 px-8">
              Ver planos
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-4">Sem cartão de crédito. Cancele quando quiser.</p>
        </div>

        {/* Preview card */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black">Z</span>
              </div>
              <div>
                <p className="font-bold text-slate-800">Relatório Vunzo</p>
                <p className="text-xs text-slate-400">Gerado com IA agora mesmo</p>
              </div>
              <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                Saudável
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Renda mensal', value: 'R$ 5.000', color: 'text-blue-600' },
                { label: 'Total de gastos', value: 'R$ 3.200', color: 'text-amber-500' },
                { label: 'Saldo mensal', value: 'R$ 1.800', color: 'text-green-600' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                '✅ Taxa de poupança de 36% — acima da média nacional',
                '⚠️ Cartão de crédito com juros de 8,5% a.m. — priorize quitar',
                '💡 Reduzindo gastos variáveis em 15%, você pouparia R$ 480/mês',
              ].map(insight => (
                <div key={insight} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">
              Tudo que você precisa para organizar suas finanças
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Uma plataforma completa de assessoria financeira com inteligência artificial, pensada para quem quer resultados reais.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">
              Planos para todos os perfis
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Comece grátis e evolua conforme sua necessidade. Cancele quando quiser, sem multas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-6 sm:p-8 border transition-all ${
                  plan.highlight
                    ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-200 scale-105'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-black mb-1 ${plan.highlight ? 'text-white' : 'text-slate-800'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-800'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <Link
                  to={plan.ctaLink}
                  className={`block text-center font-semibold py-3 px-4 rounded-xl mb-6 transition-all ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : plan.name === 'Pro' || plan.name === 'Premium'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-green-300' : 'text-green-500'}`}>✓</span>
                      <span className={plan.highlight ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm opacity-40">
                      <span className="mt-0.5 shrink-0">✕</span>
                      <span className={plan.highlight ? 'text-blue-200' : 'text-slate-500'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">Perguntas frequentes</h2>
            <p className="text-slate-500">Tudo o que você precisa saber sobre a Vunzo.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Meus dados financeiros são seguros?',
                a: 'Sim. Seus dados são protegidos com autenticação JWT e nunca são compartilhados com terceiros. Usamos criptografia em todas as comunicações.',
              },
              {
                q: 'Como a IA analisa minhas finanças?',
                a: 'Você insere seus dados (renda, gastos, dívidas e patrimônio) e nossa IA — alimentada pelo Claude da Anthropic — gera um relatório completo com diagnóstico, insights e um plano de ação personalizado.',
              },
              {
                q: 'Posso cancelar minha assinatura a qualquer momento?',
                a: 'Sim, sem multas ou burocracia. Você pode cancelar quando quiser e continuar usando até o final do período pago.',
              },
              {
                q: 'O plano grátis tem limite de análises?',
                a: 'O plano grátis permite até 3 análises por mês. Para análises ilimitadas, confira os planos Pro e Premium.',
              },
              {
                q: 'A Vunzo substitui um consultor financeiro profissional?',
                a: 'A Vunzo é uma ferramenta de apoio para organização e planejamento financeiro pessoal. Para decisões complexas como investimentos de grande porte ou planejamento tributário, recomendamos consultar um profissional certificado.',
              },
              {
                q: 'Posso exportar meu relatório?',
                a: 'Sim! Cada relatório gerado tem um botão de impressão que permite salvar como PDF diretamente pelo navegador.',
              },
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Junte-se a quem já está usando a IA para tomar decisões financeiras melhores.
          </p>
          <Link to="/register" className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors text-base">
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 sm:px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-md flex items-center justify-center">
            <span className="text-white font-black text-xs">Z</span>
          </div>
          <span className="font-bold text-white">Vunzo</span>
        </div>
        <p>© {new Date().getFullYear()} Vunzo. Todos os direitos reservados.</p>
        <p className="mt-1 text-xs">Seu assessor financeiro pessoal com inteligência artificial.</p>
      </footer>
    </div>
  );
}
