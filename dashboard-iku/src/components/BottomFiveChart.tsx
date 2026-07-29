import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { getBottomFive } from '../utils/calculations';

type TooltipProps = { active?: boolean; payload?: Array<{ payload: { indikator: string; persentase: number } }> };

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 max-w-xs">
        <p className="text-sm font-semibold text-gray-700">{data.indikator}</p>
        <p className="text-lg font-bold text-red-500">{data.persentase.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

export function BottomFiveChart() {
  const { state } = useDashboard();
  const bottomFive = getBottomFive(state.data);
  const chartData = bottomFive.map((d) => ({
    ...d,
    shortName: d.indikator.length > 30 ? d.indikator.substring(0, 27) + '...' : d.indikator,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover h-full">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        5. TOP 5 INDIKATOR KINERJA TERENDAH
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="shortName" type="category" width={160} tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="persentase" radius={[0, 6, 6, 0]} animationDuration={800} barSize={20}>
              {chartData.map((entry) => (
                <Cell key={entry.id} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
