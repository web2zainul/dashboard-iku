import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupiahFull } from '../utils/calculations';

type TooltipProps = { active?: boolean; payload?: Array<{ value: number }>; label?: string };

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        <p className="text-lg font-bold text-[#0f2358]">{formatRupiahFull(payload[0].value)}</p>
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
        REALISASI ANGGARAN PER TRIWULAN
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={budgetData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="triwulan" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => formatRupiahFull(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="anggaran"
              stroke="#0f2358"
              strokeWidth={3}
              dot={{ fill: '#0f2358', strokeWidth: 2, r: 5, stroke: 'white' }}
              activeDot={{ r: 7, stroke: '#0f2358', strokeWidth: 2, fill: 'white' }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {budgetData.every(d => d.anggaran === 0) && (
        <p className="text-center text-xs text-gray-400 mt-2">Belum Dilaksanakan</p>
      )}
    </div>
  );
}
