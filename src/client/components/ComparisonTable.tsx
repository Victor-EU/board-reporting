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

interface Props {
  data: ComparisonUnit[];
}

function formatValue(value: number | null, isPercentage: boolean): string {
  if (value === null) return '—';
  if (isPercentage) {
    return `${(value * 100).toFixed(1)}%`;
  }
  return value.toFixed(2);
}

function formatChange(change: number | null): string {
  if (change === null) return '—';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${(change * 100).toFixed(1)}%`;
}

function getChangeClass(change: number | null, inverse: boolean = false): string {
  if (change === null) return 'text-slate-400';
  const isPositive = inverse ? change < 0 : change >= 0;
  return isPositive ? 'text-emerald-600' : 'text-red-600';
}

function ComparisonTable({ data }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Year-over-Year Comparison</h2>
        <p className="text-sm text-slate-500">All values in $'Mn unless otherwise specified</p>
      </div>

      {data.map((unit) => (
        <div key={unit.slug} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Unit Header */}
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h3 className="text-md font-semibold text-slate-800">{unit.unit}</h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm w-40">Metric</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 text-sm">2023</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 text-sm">2024</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 text-sm">2025</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 text-sm">YoY</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 text-sm bg-blue-50">Budget</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 text-sm bg-blue-50">vs. Bud</th>
                </tr>
              </thead>
              <tbody>
                {unit.rows.map((row, idx) => {
                  const isExpense = row.slug === 'opex';
                  const isHighlight = ['arr', 'revenues', 'ebitda'].includes(row.slug);
                  return (
                    <tr
                      key={row.slug}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${
                        isHighlight ? 'bg-yellow-50/30' : ''
                      } ${idx === unit.rows.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-slate-700">
                        {row.metric}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-600 tabular-nums">
                        {formatValue(row.y2023, row.isPercentage)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-600 tabular-nums">
                        {formatValue(row.y2024, row.isPercentage)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-slate-900 tabular-nums">
                        {formatValue(row.y2025, row.isPercentage)}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right font-medium tabular-nums ${getChangeClass(row.yoy, isExpense)}`}>
                        {formatChange(row.yoy)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-600 tabular-nums bg-blue-50/50">
                        {formatValue(row.budget, row.isPercentage)}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right font-medium tabular-nums bg-blue-50/50 ${getChangeClass(row.vsBudget, isExpense)}`}>
                        {formatChange(row.vsBudget)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ComparisonTable;
