import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useCapaian } from '../context/CapaianContext';
import type { CapaianIKU } from '../types';

type TwKey = 'realisasiTW1' | 'realisasiTW2' | 'realisasiTW3' | 'realisasiTW4';

const TW_OPTIONS: Array<{ label: string; key: TwKey | 'total' }> = [
  { label: 'TW I', key: 'realisasiTW1' },
  { label: 'TW II', key: 'realisasiTW2' },
  { label: 'TW III', key: 'realisasiTW3' },
  { label: 'TW IV', key: 'realisasiTW4' },
  { label: 'Total', key: 'total' },
];

function getRealisasi(row: CapaianIKU, key: TwKey | 'total'): number {
  if (key === 'total') {
    return (row.realisasiTW1 ?? 0) + (row.realisasiTW2 ?? 0) + (row.realisasiTW3 ?? 0) + (row.realisasiTW4 ?? 0);
  }
  return row[key] ?? 0;
}

function shortName(name: string, max = 24): string {
  const clean = name.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

const IndicatorTick = (props: { x?: number; y?: number; payload?: { value: string } }) => {
  const { x, y, payload } = props;
  if (!payload) return null;
  return (
    <text x={x} y={y} dy={8} textAnchor="middle" fill="#475569" fontSize={9}>
      {shortName(payload.value)}
    </text>
  );
};

export function CapaianChart() {
  const { rows, loading } = useCapaian();
  const [twKey, setTwKey] = useState<TwKey | 'total'>('total');

  const chartData = rows.map((row, idx) => ({
    name: row.indikator || `Indikator ${idx + 1}`,
    target: row.targetTahun,
    realisasi: getRealisasi(row, twKey),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          GRAFIK CAPAIAN IKU (TARGET VS REALISASI PER INDIKATOR)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {TW_OPTIONS.map((tw) => (
            <button
              key={tw.label}
              onClick={() => setTwKey(tw.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                twKey === tw.key ? 'bg-[#0f2358] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tw.label}
            </button>
          ))}
        </div>
      </div>

      {loading || chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          {loading ? 'Memuat data...' : 'Belum ada data. Isi tabel Capaian IKU terlebih dahulu.'}
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={<IndicatorTick />}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={0}
                height={50}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="target" name="Target" fill="#94a3b8" isAnimationActive={false} maxBarSize={28} radius={[3, 3, 0, 0]} />
              <Bar dataKey="realisasi" name="Realisasi" fill="#0f2358" isAnimationActive={false} maxBarSize={28} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
