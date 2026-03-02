import React, { useState } from 'react';
import { financialApi, FinancialData } from '../services/api';

interface LineItem {
  name: string;
  amount: string;
}

interface DebtItem {
  name: string;
  amount: string;
  rate: string;
}

interface Props {
  onReport: (report: string, data: FinancialData) => void;
}

function ItemList({
  label,
  items,
  onChange,
  hasRate = false,
}: {
  label: string;
  items: (LineItem | DebtItem)[];
  onChange: (items: (LineItem | DebtItem)[]) => void;
  hasRate?: boolean;
}) {
  const add = () => {
    onChange([...items, hasRate ? { name: '', amount: '', rate: '' } : { name: '', amount: '' }]);
  };

  const remove = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
  };

  const update = (i: number, field: string, value: string) => {
    const updated = items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Descrição"
            value={item.name}
            onChange={e => update(i, 'name', e.target.value)}
          />
          <input
            className="input-field w-36"
            placeholder="R$ Valor"
            type="number"
            min="0"
            value={item.amount}
            onChange={e => update(i, 'amount', e.target.value)}
          />
          {hasRate && (
            <input
              className="input-field w-28"
              placeholder="% a.m."
              type="number"
              min="0"
              step="0.1"
              value={(item as DebtItem).rate}
              onChange={e => update(i, 'rate', e.target.value)}
            />
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-slate-400 hover:text-red-400 transition-colors px-1 text-lg"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
      >
        <span className="text-lg leading-none">+</span> Adicionar {label.toLowerCase()}
      </button>
    </div>
  );
}

export default function FinancialForm({ onReport }: Props) {
  const [income, setIncome] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState<LineItem[]>([{ name: '', amount: '' }]);
  const [variableExpenses, setVariableExpenses] = useState<LineItem[]>([{ name: '', amount: '' }]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [assets, setAssets] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseItems = (items: LineItem[]) =>
    items
      .filter(i => i.name && i.amount)
      .map(i => ({ name: i.name, amount: parseFloat(i.amount) }));

  const parseDebts = (items: DebtItem[]) =>
    items
      .filter(i => i.name && i.amount)
      .map(i => ({ name: i.name, amount: parseFloat(i.amount), rate: parseFloat(i.rate || '0') }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!income || parseFloat(income) <= 0) {
      setError('Informe uma renda mensal válida');
      return;
    }

    const data: FinancialData = {
      income: parseFloat(income),
      fixedExpenses: parseItems(fixedExpenses),
      variableExpenses: parseItems(variableExpenses),
      debts: parseDebts(debts),
      assets: parseItems(assets),
    };

    setLoading(true);
    try {
      const res = await financialApi.analyze(data);
      onReport(res.data.report, data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Seus Dados Financeiros</h2>
        <p className="text-sm text-slate-500">
          Preencha suas informações para receber uma análise personalizada da Vunzo.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 block mb-1.5">
          Renda Mensal Líquida (R$) <span className="text-red-400">*</span>
        </label>
        <input
          className="input-field max-w-xs"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ex: 5000"
          value={income}
          onChange={e => setIncome(e.target.value)}
          required
        />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <ItemList label="Gastos Fixos" items={fixedExpenses} onChange={setFixedExpenses as (items: (LineItem | DebtItem)[]) => void} />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <ItemList label="Gastos Variáveis" items={variableExpenses} onChange={setVariableExpenses as (items: (LineItem | DebtItem)[]) => void} />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <ItemList label="Dívidas" items={debts} onChange={setDebts as (items: (LineItem | DebtItem)[]) => void} hasRate />
        <p className="text-xs text-slate-400 mt-1">Informe o valor total da dívida e a taxa de juros mensal</p>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <ItemList label="Patrimônio" items={assets} onChange={setAssets as (items: (LineItem | DebtItem)[]) => void} />
        <p className="text-xs text-slate-400 mt-1">Ex: poupança, investimentos, imóveis, veículos</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Analisando suas finanças...
          </>
        ) : (
          'Gerar Análise com IA'
        )}
      </button>
    </form>
  );
}
