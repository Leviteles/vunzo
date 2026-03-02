import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Navbar() {
  const { user, logout } = useAuth();
  const isFree = !user?.plan || user.plan === 'free';
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-blue-600 font-semibold'
      : 'text-slate-600 hover:text-blue-600';

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-xl text-slate-800">Vunzo</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/dashboard" className={`text-sm transition-colors ${isActive('/dashboard')}`}>
            Nova Análise
          </Link>
          <Link to="/history" className={`text-sm transition-colors ${isActive('/history')}`}>
            Histórico
          </Link>
          <Link to="/calculadora" className={`text-sm transition-colors ${isActive('/calculadora')}`}>
            Calculadoras
          </Link>
          <Link to="/planos" className={`text-sm transition-colors flex items-center gap-1.5 ${isActive('/planos')}`}>
            Planos
            {isFree && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                PRO
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:block">
            Olá, <span className="font-medium text-slate-700">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-red-500 transition-colors font-medium"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
