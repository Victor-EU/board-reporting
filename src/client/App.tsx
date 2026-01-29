import { useState, useEffect } from 'react';
import KPICards from './components/KPICards';
import ComparisonTable from './components/ComparisonTable';

interface KPI {
  metric: string;
  slug: string;
  category: string;
  isPercentage: boolean;
  current: number;
  prior: number;
  budget: number;
  yoyChange: number;
  vsBudget: number;
}

interface DashboardData {
  year: number;
  businessUnit: string;
  kpis: KPI[];
}

interface ComparisonRow {
  metric: string;
  slug: string;
  isPercentage: boolean;
  y2023: number | null;
  y2024: number | null;
  y2025: number | null;
  yoy: number | null;
  budget: number | null;
  vsBudget: number | null;
}

interface ComparisonUnit {
  unit: string;
  slug: string;
  rows: ComparisonRow[];
}

interface ComparisonData {
  comparison: ComparisonUnit[];
}

function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison'>('overview');

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, compRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/comparison'),
        ]);

        if (dashRes.ok) {
          const dash = await dashRes.json();
          setDashboardData(dash);
        }

        if (compRes.ok) {
          const comp = await compRes.json();
          setComparisonData(comp);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">
                Board Reporting 2025
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                $'Mn
              </span>
            </div>
            <div className="text-sm text-slate-500">
              Data as of December 2025
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              YoY Comparison
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && dashboardData && (
          <KPICards kpis={dashboardData.kpis} />
        )}

        {activeTab === 'comparison' && comparisonData && (
          <ComparisonTable data={comparisonData.comparison} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            Deployed with Telbase | Financial data from Board Reporting Excel
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
