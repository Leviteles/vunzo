import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const PROMPT_PATH = path.join(__dirname, '../../prompt.txt');

export interface FinancialData {
  income: number;
  fixedExpenses: Array<{ name: string; amount: number }>;
  variableExpenses: Array<{ name: string; amount: number }>;
  debts: Array<{ name: string; amount: number; rate: number }>;
  assets: Array<{ name: string; amount: number }>;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildUserContext(data: FinancialData): string {
  const totalFixed = data.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const totalVariable = data.variableExpenses.reduce((s, e) => s + e.amount, 0);
  const totalDebts = data.debts.reduce((s, d) => s + d.amount, 0);
  const totalAssets = data.assets.reduce((s, a) => s + a.amount, 0);
  const totalExpenses = totalFixed + totalVariable;
  const balance = data.income - totalExpenses;

  const fixedList = data.fixedExpenses
    .map(e => `  - ${e.name}: ${formatCurrency(e.amount)}`)
    .join('\n') || '  (nenhum informado)';

  const variableList = data.variableExpenses
    .map(e => `  - ${e.name}: ${formatCurrency(e.amount)}`)
    .join('\n') || '  (nenhum informado)';

  const debtList = data.debts
    .map(d => `  - ${d.name}: ${formatCurrency(d.amount)} (taxa: ${d.rate}% a.m.)`)
    .join('\n') || '  (nenhuma dívida informada)';

  const assetList = data.assets
    .map(a => `  - ${a.name}: ${formatCurrency(a.amount)}`)
    .join('\n') || '  (nenhum patrimônio informado)';

  return `
=== DADOS FINANCEIROS DO USUÁRIO ===

RENDA MENSAL: ${formatCurrency(data.income)}

GASTOS FIXOS (Total: ${formatCurrency(totalFixed)}):
${fixedList}

GASTOS VARIÁVEIS (Total: ${formatCurrency(totalVariable)}):
${variableList}

DÍVIDAS (Total: ${formatCurrency(totalDebts)}):
${debtList}

PATRIMÔNIO (Total: ${formatCurrency(totalAssets)}):
${assetList}

RESUMO CALCULADO:
- Total de gastos mensais: ${formatCurrency(totalExpenses)}
- Saldo mensal (renda - gastos): ${formatCurrency(balance)}
- Total de dívidas: ${formatCurrency(totalDebts)}
- Total de patrimônio: ${formatCurrency(totalAssets)}
- Patrimônio líquido: ${formatCurrency(totalAssets - totalDebts)}
====================================
`;
}

export async function analyzeFinances(data: FinancialData): Promise<string> {
  let systemPrompt = '';

  try {
    systemPrompt = fs.readFileSync(PROMPT_PATH, 'utf-8');
  } catch {
    throw new Error('Arquivo prompt.txt não encontrado. Verifique se ele existe em backend/prompt.txt');
  }

  const userContext = buildUserContext(data);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContext },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Resposta inválida da IA');

  return text;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatFinances(
  reportContext: string,
  history: ChatMessage[],
  question: string
): Promise<string> {
  const systemPrompt = `Você é o assistente financeiro da Vunzo. O usuário já recebeu um relatório completo de análise financeira (abaixo) e agora quer tirar dúvidas ou pedir sugestões complementares.

RELATÓRIO GERADO ANTERIORMENTE:
${reportContext}

Responda em português, de forma clara, objetiva e acolhedora. Use dados concretos do relatório quando relevante. Seja direto e prático. Se a pergunta não for sobre finanças, redirecione gentilmente para o tema financeiro.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: question },
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Resposta inválida da IA');

  return text;
}
