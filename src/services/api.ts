import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vunzo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vunzo_token');
      localStorage.removeItem('vunzo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export interface FinancialData {
  income: number;
  fixedExpenses: Array<{ name: string; amount: number }>;
  variableExpenses: Array<{ name: string; amount: number }>;
  debts: Array<{ name: string; amount: number; rate: number }>;
  assets: Array<{ name: string; amount: number }>;
}

export interface FinancialReport {
  id: number;
  income: number;
  fixedExpenses: Array<{ name: string; amount: number }>;
  variableExpenses: Array<{ name: string; amount: number }>;
  debts: Array<{ name: string; amount: number; rate: number }>;
  assets: Array<{ name: string; amount: number }>;
  aiReport: string;
  createdAt: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const financialApi = {
  analyze: (data: FinancialData) =>
    api.post<{ report: string }>('/financial/analyze', data),
  history: () =>
    api.get<{ reports: FinancialReport[] }>('/financial/history'),
  usage: () =>
    api.get<{ plan: string; usage: number; limit: number | null }>('/financial/usage'),
  chat: (data: { reportContext: string; history: Array<{ role: 'user' | 'assistant'; content: string }>; question: string }) =>
    api.post<{ answer: string }>('/financial/chat', data),
};

export default api;
