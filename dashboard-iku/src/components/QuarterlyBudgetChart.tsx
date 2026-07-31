import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupiah } from '../utils/calculations';

type TooltipProps = { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string };

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        <p className="text-lg font-bold text-purple-600">{formatRupiah(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const budgetData = [
  { triwulan: 'TW I', anggaran: 1866387810 },
  { triwulan: 'TW II', anggaran: 1830917990 },
  { triwulan: 'TW III', anggaran: 0 },
  { triwulan: 'TW IV', anggaran: 0 },
];

export function QuarterlyBudgetChart() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover h-full">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        7. REALISASI ANGGARAN PER TRIWULAN
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={budgetData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="triwulan" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => formatRupiah(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="anggaran" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={50} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {budgetData.every(d => d.anggaran === 0) && (
        <p className="text-center text-xs text-gray-400 mt-2">Belum Dilaksanakan</p>
      )}
    </div>
  );
}
