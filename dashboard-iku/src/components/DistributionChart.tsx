import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { calculateDistribution, isDetailRow } from '../utils/calculations';

type TooltipProps = { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string; percentage: number } }> };

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-semibold" style={{ color: data.payload.color }}>{data.name}</p>
        <p className="text-lg font-bold text-gray-800">{data.value} indikator ({data.payload.percentage}%)</p>
      </div>
    );
  }
  return null;
};

export function DistributionChart() {
  const { state } = useDashboard();
  const distribution = calculateDistribution(state.data);
  const total = state.data.filter(isDetailRow).length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover h-full">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        2. DISTRIBUSI CAPAIAN KINERJA
      </h3>
      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={800}>
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-gray-800">{total}</div>
          <div className="text-[10px] text-gray-400">Indikator</div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {distribution.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600 flex-1">{item.name}</span>
            <span className="font-bold text-gray-800">{item.value}</span>
            <span className="text-gray-400 w-14 text-right">({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
