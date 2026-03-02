import { useState } from 'react';
import Navbar from '../components/Navbar';
import FinancialForm from '../components/FinancialForm';
import AIReport from '../components/AIReport';
import FinancialChart from '../components/FinancialChart';
import FinancialScore from '../components/FinancialScore';
import FinancialChat from '../components/FinancialChat';
import { useToast } from '../context/ToastContext';
import { FinancialData } from '../services/api';

export default function Dashboard() {
  const [report, setReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<FinancialData | null>(null);
  const { showToast } = useToast();

  const handleReport = (newReport: string, data: FinancialData) => {
    setReport(newReport);
    setReportData(data);
    showToast('Análise gerada com sucesso!', 'success');
    setTimeout(() => {
      document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNew = () => {
    setReport(null);
    setReportData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!report ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Nova Análise Financeira</h1>
              <p className="text-slate-500 mt-1">
                Insira seus dados e a Vunzo vai gerar um relatório personalizado com IA.
              </p>
            </div>
            <FinancialForm onReport={handleReport} />
          </div>
        ) : (
          <div id="report-section">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Sua Análise Financeira</h1>
              <button onClick={handleNew} className="btn-secondary text-sm">
                Nova Análise
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {reportData && (
                  <>
                    <FinancialScore
                      income={reportData.income}
                      fixedExpenses={reportData.fixedExpenses}
                      variableExpenses={reportData.variableExpenses}
                      debts={reportData.debts}
                      assets={reportData.assets}
                    />
                    <FinancialChart
                      income={reportData.income}
                      fixedExpenses={reportData.fixedExpenses}
                      variableExpenses={reportData.variableExpenses}
                      debts={reportData.debts}
                    />
                  </>
                )}
              </div>
              <div className="lg:col-span-2">
                <AIReport report={report} createdAt={new Date().toISOString()} />
                <FinancialChat reportContext={report} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
