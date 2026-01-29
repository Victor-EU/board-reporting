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

interface Props {
  kpis: KPI[];
}

function formatValue(value: number, isPercentage: boolean): string {
  if (isPercentage) {
    return `${(value * 100).toFixed(1)}%`;
  }
  // Values are in millions
  if (Math.abs(value) >= 1) {
    return `$${value.toFixed(1)}M`;
  }
  return `$${(value * 1000).toFixed(0)}K`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${(change * 100).toFixed(1)}%`;
}

function getChangeColor(change: number, inverse: boolean = false): string {
  const isPositive = inverse ? change < 0 : change >= 0;
  return isPositive ? 'text-emerald-600' : 'text-red-600';
}

function KPICards({ kpis }: Props) {
  // Key metrics to highlight
  const keyMetrics = ['arr', 'revenues', 'ebitda', 'ebitda-margin'];
  const highlightedKpis = kpis.filter((k) => keyMetrics.includes(k.slug));
  const otherKpis = kpis.filter((k) => !keyMetrics.includes(k.slug));

  return (
    <div className="space-y-8">
      {/* Group Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Group Summary</h2>
        <p className="text-sm text-slate-500">Full Year 2025 vs 2024</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlightedKpis.map((kpi) => (
          <div key={kpi.slug} className="kpi-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{kpi.metric}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                kpi.category === 'revenue' ? 'bg-blue-100 text-blue-700' :
                kpi.category === 'profit' ? 'bg-emerald-100 text-emerald-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {kpi.category}
              </span>
            </div>

            <div className="kpi-value mt-2">
              {formatValue(kpi.current, kpi.isPercentage)}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="text-sm">
                <span className="text-slate-500">YoY: </span>
                <span className={getChangeColor(kpi.yoyChange, kpi.slug === 'opex')}>
                  {formatChange(kpi.yoyChange)}
                </span>
              </div>
              {kpi.budget !== 0 && (
                <div className="text-sm">
                  <span className="text-slate-500">vs Bud: </span>
                  <span className={getChangeColor(kpi.vsBudget, kpi.slug === 'opex')}>
                    {formatChange(kpi.vsBudget)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
              <div className="flex justify-between">
                <span>Prior Year</span>
                <span>{formatValue(kpi.prior, kpi.isPercentage)}</span>
              </div>
              {kpi.budget !== 0 && (
                <div className="flex justify-between mt-1">
                  <span>Budget</span>
                  <span>{formatValue(kpi.budget, kpi.isPercentage)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Other Metrics */}
      <div>
        <h3 className="text-md font-medium text-slate-700 mb-4">Additional Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {otherKpis.map((kpi) => (
            <div key={kpi.slug} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">{kpi.metric}</div>
              <div className="text-lg font-semibold text-slate-900">
                {formatValue(kpi.current, kpi.isPercentage)}
              </div>
              <div className={`text-xs mt-1 ${getChangeColor(kpi.yoyChange, kpi.slug === 'opex')}`}>
                {formatChange(kpi.yoyChange)} YoY
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KPICards;
