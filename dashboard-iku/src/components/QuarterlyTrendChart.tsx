import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { calculateQuarterlyAverages } from '../utils/calculations';

type TooltipProps = { active?: boolean; payload?: Array<{ value: number | null }>; label?: string };

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        <p className="text-lg font-bold text-[#0f2358]">
          {val !== null ? `${val.toFixed(2)}%` : 'Belum Dilaksanakan'}
        </p>
      </div>
    );
  }
  return null;
};

export function QuarterlyTrendChart() {
  const { state } = useDashboard();
  const quarterlyData = calculateQuarterlyAverages(state.data);

  const chartData = quarterlyData.map(d => ({
    ...d,
    rataRata: d.rataRata,
    displayValue: d.rataRata !== null ? d.rataRata : undefined,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover h-full">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        3. CAPAIAN KINERJA PER TRIWULAN (RATA-RATA)
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="triwulan" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="5 5">
              <Label value="Target 75%" position="right" fill="#f59e0b" fontSize={10} />
            </ReferenceLine>
            <Line
              type="monotone"
              dataKey="rataRata"
              stroke="#0f2358"
              strokeWidth={3}
              dot={{ fill: '#0f2358', strokeWidth: 2, r: 5, stroke: 'white' }}
              activeDot={{ r: 7, stroke: '#0f2358', strokeWidth: 2, fill: 'white' }}
              connectNulls={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
