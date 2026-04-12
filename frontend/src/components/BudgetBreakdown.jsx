import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaWallet, FaBed, FaUtensils, FaBus, FaTicketAlt, FaEllipsisH } from 'react-icons/fa';

const CATEGORIES = [
  { key: 'accommodation', label: 'Stay', icon: FaBed, color: '#6366f1' },
  { key: 'food', label: 'Food', icon: FaUtensils, color: '#f59e0b' },
  { key: 'transportation', label: 'Transport', icon: FaBus, color: '#10b981' },
  { key: 'activities', label: 'Activities', icon: FaTicketAlt, color: '#3b82f6' },
  { key: 'miscellaneous', label: 'Misc', icon: FaEllipsisH, color: '#8b5cf6' },
];

const BudgetBreakdown = ({ itinerary, totalDays }) => {
  const breakdown = itinerary?.budgetBreakdown;
  const totalCost = itinerary?.totalEstimatedCost;

  if (!breakdown) return null;

  // Build chart data
  const chartData = CATEGORIES
    .map((cat) => ({
      name: cat.label,
      value: typeof breakdown[cat.key] === 'number' ? breakdown[cat.key] : parseFloat(String(breakdown[cat.key]).replace(/[^0-9.]/g, '')) || 0,
      color: cat.color,
    }))
    .filter((d) => d.value > 0);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const perDay = totalDays > 0 ? Math.round(total / totalDays) : total;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <FaWallet className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Budget Breakdown</h3>
          <p className="text-sm text-slate-500">Estimated costs for your trip</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width={192} height={192}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value}`, '']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-900">{totalCost || `$${total}`}</span>
              <span className="text-xs text-slate-400 font-medium">Total</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-500 font-medium">
            ~<span className="text-slate-700 font-bold">${perDay}</span>/day
          </div>
        </div>

        {/* Category breakdown */}
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const raw = breakdown[cat.key];
            const value = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
            if (value === 0) return null;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            const IconComp = cat.icon;

            return (
              <div key={cat.key} className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.color + '15', color: cat.color }}
                >
                  <IconComp className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                    <span className="text-sm font-bold text-slate-800">${value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium w-8 text-right">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdown;
