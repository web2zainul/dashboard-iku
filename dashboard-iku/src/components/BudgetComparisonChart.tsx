import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { calculateKPI, formatRupiah } from '../utils/calculations';

type TooltipProps = { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string };

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {formatRupiah(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function BudgetComparisonChart() {
  const { state } = useDashboard();
  const kpi = calculateKPI(state.data);

  const data = [
    {
      name: 'Anggaran',
      Target: kpi.totalAnggaran,
      Realisasi: kpi.realisasiAnggaran,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover h-full">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        6. TARGET VS REALISASI ANGGARAN
      </h3>
      <div className="text-center mb-3">
        <span className="text-xs text-gray-500">
          Persentase: <span className="font-bold text-amber-500">{kpi.persentaseAnggaran.toFixed(2)}%</span>
        </span>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => formatRupiah(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="Target" fill="#0f2358" radius={[6, 6, 0, 0]} barSize={60} animationDuration={800} />
            <Bar dataKey="Realisasi" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={60} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
