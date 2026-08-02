import { useMemo } from 'react';
import { ClipboardList, Target, TrendingUp, BarChart3, Wallet, Banknote, Percent } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { calculateKPI, formatRupiahNoDec, countSubKegiatanTerisi, isDetailRow } from '../utils/calculations';

const kpiConfig: Array<{
  key: keyof ReturnType<typeof calculateKPI>;
  label: string;
  icon: typeof ClipboardList;
  color: string;
  textColor: string;
  iconBg: string;
  suffix?: string;
  isRupiah?: boolean;
  fixedValue?: number;
  dynamic?: 'program' | 'kegiatan' | 'subKegiatan';
}> = [
  { key: 'totalIndikator', label: 'IKU', icon: ClipboardList, color: 'from-[#0f2358] to-[#1a3a8a]', textColor: 'text-blue-100', iconBg: 'bg-white/20', fixedValue: 3 },
  { key: 'totalTarget', label: 'PROGRAM', icon: Target, color: 'from-[#152e6e] to-[#1a3a8a]', textColor: 'text-blue-100', iconBg: 'bg-white/20', dynamic: 'program' },
  { key: 'realisasiKinerja', label: 'KEGIATAN', icon: TrendingUp, color: 'from-emerald-600 to-emerald-700', textColor: 'text-emerald-100', iconBg: 'bg-white/20', dynamic: 'kegiatan' },
  { key: 'rataRataCapaian', label: 'SUB KEGIATAN', icon: BarChart3, color: 'from-blue-600 to-blue-700', textColor: 'text-blue-100', iconBg: 'bg-white/20', dynamic: 'subKegiatan' },
  { key: 'totalAnggaran', label: 'TOTAL ANGGARAN', icon: Wallet, color: 'from-purple-600 to-purple-700', textColor: 'text-purple-100', iconBg: 'bg-white/20', isRupiah: true, fixedValue: 7646183378 },
  { key: 'realisasiAnggaran', label: 'REALISASI ANGGARAN', icon: Banknote, color: 'from-teal-600 to-teal-700', textColor: 'text-teal-100', iconBg: 'bg-white/20', isRupiah: true, fixedValue: 3697305800 },
  { key: 'persentaseAnggaran', label: '% REALISASI ANGGARAN', icon: Percent, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-100', iconBg: 'bg-white/20', suffix: '%' },
];

function getAnggaranCategory(pct: number): string {
  if (pct >= 80) return 'TINGGI';
  if (pct >= 50) return 'SEDANG';
  return 'RENDAH';
}

export function KPICards() {
  const { state } = useDashboard();
  const kpi = calculateKPI(state.data);

  const counts = useMemo(() => {
    const details = state.data.filter(isDetailRow);
    return {
      program: new Set(details.map(d => d.program).filter(Boolean)).size,
      kegiatan: new Set(details.map(d => d.kegiatan).filter(Boolean)).size,
      subKegiatan: countSubKegiatanTerisi(state.data),
    };
  }, [state.data]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {kpiConfig.map((config, index) => {
        const Icon = config.icon;
        const value = config.fixedValue ?? (config.dynamic ? counts[config.dynamic] : kpi[config.key]);
        const displayValue = config.isRupiah
          ? formatRupiahNoDec(value as number)
          : config.suffix
            ? `${(value as number).toFixed(2)}${config.suffix}`
            : value;

        return (
          <div
            key={config.key}
            className={`bg-gradient-to-br ${config.color} rounded-2xl p-4 shadow-lg card-hover animate-fade-in-up`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`${config.iconBg} p-2 rounded-xl`}>
                <Icon className={`w-4 h-4 ${config.textColor}`} />
              </div>
            </div>
            <div className={`${config.isRupiah ? 'text-xs lg:text-sm' : 'text-xl lg:text-2xl'} font-bold ${config.textColor} animate-count-up whitespace-nowrap`}>
              {displayValue}
            </div>
            <div className={`text-[10px] ${config.textColor} mt-1 font-medium opacity-90 leading-tight`}>
              {config.label}
            </div>
            {config.key === 'persentaseAnggaran' && (
              <div className={`text-[10px] ${config.textColor} opacity-75 mt-0.5`}>
                Kategori: {getAnggaranCategory(kpi.persentaseAnggaran)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
