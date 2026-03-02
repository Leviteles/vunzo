import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl mb-6 shadow-lg">
          <span className="text-white font-black text-3xl">Z</span>
        </div>
        <h1 className="text-8xl font-black text-slate-200 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Página não encontrada</h2>
        <p className="text-slate-500 mb-8">
          Parece que essa página não existe ou foi movida. Mas suas finanças estão em boas mãos!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn-primary">
            {isAuthenticated ? 'Ir para o Dashboard' : 'Voltar ao início'}
          </Link>
          {isAuthenticated && (
            <Link to="/calculadora" className="btn-secondary">
              Calculadoras
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
