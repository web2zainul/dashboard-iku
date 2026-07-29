import { X, Target, TrendingUp, Wallet } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { getKategori, getKategoriColor, formatRupiahFull, formatNumber } from '../utils/calculations';

export function DetailModal() {
  const { state, dispatch } = useDashboard();
  const item = state.selectedIndicator;

  if (!item) return null;

  const kategori = getKategori(item.persentase);
  const catColor = getKategoriColor(kategori);

  const twData = [
    { label: 'TW I', value: item.realisasiTW1 },
    { label: 'TW II', value: item.realisasiTW2 },
    { label: 'TW III', value: item.realisasiTW3 },
    { label: 'TW IV', value: item.realisasiTW4 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => dispatch({ type: 'SET_SELECTED_INDICATOR', payload: null })}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Detail Indikator Kinerja</h2>
            <p className="text-xs text-gray-500 mt-0.5">{item.program}</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_SELECTED_INDICATOR', payload: null })}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Program</span>
              <p className="font-medium text-gray-700">{item.program || '-'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Kegiatan</span>
              <p className="font-medium text-gray-700">{item.kegiatan || '-'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 text-xs">Sub Kegiatan</span>
              <p className="font-medium text-gray-700">{item.subKegiatan || '-'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 text-xs">Indikator Kinerja</span>
              <p className="font-medium text-gray-700">{item.indikator}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Target 2026</p>
              <p className="font-bold text-gray-800">{formatNumber(item.targetTahun)} {item.satuan}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Realisasi</p>
              <p className="font-bold text-gray-800">{formatNumber(item.realisasiTahun)} {item.satuan}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: catColor + '15' }}>
              <p className="text-xs text-gray-400">% Capaian</p>
              <p className="font-bold text-2xl" style={{ color: catColor }}>{item.persentase.toFixed(2)}%</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: catColor + '20', color: catColor }}>{kategori}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Realisasi Per Triwulan</h4>
            <div className="space-y-2">
              {twData.map(tw => {
                const val = tw.value;
                const hasData = val !== null && val !== undefined;
                const pct = item.targetTahun > 0 && hasData ? (val / item.targetTahun) * 100 : 0;
                return (
                  <div key={tw.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12">{tw.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: hasData ? `${Math.min(pct, 100)}%` : '0%',
                          backgroundColor: hasData ? getKategoriColor(getKategori(pct)) : '#e5e7eb',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-20 text-right">
                      {hasData ? `${formatNumber(val)} (${pct.toFixed(1)}%)` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Target Anggaran</span>
              </div>
              <p className="font-bold text-purple-700">{formatRupiahFull(item.targetAnggaran)}</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-teal-500" />
                <span className="text-xs text-teal-600 font-medium">Realisasi Anggaran</span>
              </div>
              <p className="font-bold text-teal-700">{formatRupiahFull(item.realisasiAnggaran)}</p>
              <p className="text-xs text-teal-500">({item.persentaseAnggaran.toFixed(2)}%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
