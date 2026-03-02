import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AIReportProps {
  report: string;
  createdAt?: string;
}

function parseReport(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      const title = line.replace('## ', '').trim();
      const isDiagnostic = title.includes('DIAGNÓSTICO');
      const isAction = title.includes('PLANO');
      const isDebts = title.includes('QUITAÇÃO') || title.includes('DÍVIDAS');
      const isGoals = title.includes('METAS');

      const colorMap: Record<string, string> = {};
      if (isDiagnostic) colorMap.bg = 'bg-blue-50 border-blue-200';
      else if (isAction) colorMap.bg = 'bg-green-50 border-green-200';
      else if (isDebts) colorMap.bg = 'bg-amber-50 border-amber-200';
      else if (isGoals) colorMap.bg = 'bg-purple-50 border-purple-200';
      else colorMap.bg = 'bg-slate-50 border-slate-200';

      elements.push(
        <div key={key++} className={`mt-6 mb-2 px-4 py-3 rounded-xl border ${colorMap.bg}`}>
          <h3 className="font-bold text-base text-slate-800">{title}</h3>
        </div>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      const text = line.replace(/\*\*/g, '');
      elements.push(
        <p key={key++} className="font-semibold text-slate-700 mt-3 mb-1">{text}</p>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.replace(/^[-*] /, '');
      elements.push(
        <div key={key++} className="flex items-start gap-2 py-0.5">
          <span className="text-blue-500 mt-1 shrink-0">•</span>
          <span className="text-slate-600 text-sm leading-relaxed">{formatInline(text)}</span>
        </div>
      );
    } else if (/^\d+\./.test(line)) {
      const text = line.replace(/^\d+\.\s*/, '');
      elements.push(
        <div key={key++} className="flex items-start gap-2 py-0.5">
          <span className="text-green-600 font-semibold text-sm shrink-0">{line.match(/^\d+/)![0]}.</span>
          <span className="text-slate-600 text-sm leading-relaxed">{formatInline(text)}</span>
        </div>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={key++} className="border-slate-200 my-4" />);
    } else if (line.trim() !== '') {
      elements.push(
        <p key={key++} className="text-slate-600 text-sm leading-relaxed my-1">
          {formatInline(line)}
        </p>
      );
    }
  }

  return elements;
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold text-slate-800">{part.replace(/\*\*/g, '')}</strong>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}

export default function AIReport({ report, createdAt }: AIReportProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isPro = user?.plan === 'pro' || user?.plan === 'premium';

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const lines = content.innerText.split('\n').map(line => {
      if (line.startsWith('## ')) return `<h3>${line.replace('## ', '')}</h3>`;
      if (line.startsWith('- ') || line.startsWith('• ')) return `<li>${line.replace(/^[•\-] /, '')}</li>`;
      if (line === '---') return '<hr>';
      if (line.trim()) return `<p>${line}</p>`;
      return '';
    }).join('');

    const html = `<!DOCTYPE html><html lang="pt-BR"><head>
      <meta charset="UTF-8">
      <title>Relatório Vunzo${dateStr ? ' — ' + dateStr : ''}</title>
      <style>
        body { font-family: Inter, system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1e293b; line-height: 1.6; }
        h1 { color: #2563eb; font-size: 22px; margin-bottom: 4px; }
        .date { color: #94a3b8; font-size: 13px; margin-bottom: 32px; }
        h3 { font-size: 15px; font-weight: 700; background: #f1f5f9; padding: 8px 12px; border-radius: 8px; margin-top: 24px; }
        p, li { font-size: 14px; color: #475569; }
        ul { padding-left: 18px; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
        strong { color: #1e293b; }
        @media print { body { margin: 20px; } }
      </style>
    </head><body>
      <h1>Relatório Vunzo</h1>
      ${dateStr ? `<p class="date">${dateStr}</p>` : ''}
      ${lines}
      <script>window.onload = () => { window.print(); }<\/script>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Relatório Vunzo</h2>
            {dateStr && <p className="text-xs text-slate-400">{dateStr}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            IA Gerado
          </span>
          {isPro ? (
            <button
              onClick={handlePrint}
              title="Exportar como PDF"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir / PDF
            </button>
          ) : (
            <Link
              to="/planos"
              title="Disponível no plano Pro"
              className="flex items-center gap-1.5 text-sm text-slate-400 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              PDF — Pro
            </Link>
          )}
        </div>
      </div>
      <div ref={printRef} className="divide-y-0">{parseReport(report)}</div>
    </div>
  );
}
