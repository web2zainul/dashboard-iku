import { X, Target, TrendingUp, Wallet } from 'lucide-react';
import type { Pegawai } from '../data/pegawaiBkpsdm';

export function PerjanjianDetailModal({ pegawai, onClose }: { pegawai: Pegawai; onClose: () => void }) {
  const twData = [
    { label: 'TW I', value: null as number | null },
    { label: 'TW II', value: null as number | null },
    { label: 'TW III', value: null as number | null },
    { label: 'TW IV', value: null as number | null },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Detail Perjanjian Kinerja</h2>
            <p className="text-xs text-gray-500 mt-0.5">{pegawai.nama}{pegawai.nip ? ` — NIP. ${pegawai.nip}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Program</span>
              <p className="font-medium text-gray-700">-</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Kegiatan</span>
              <p className="font-medium text-gray-700">-</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 text-xs">Sub Kegiatan</span>
              <p className="font-medium text-gray-700">-</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 text-xs">Indikator Kinerja</span>
              <p className="font-medium text-gray-700">-</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Target 2026</p>
              <p className="font-bold text-gray-800">-</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Realisasi</p>
              <p className="font-bold text-gray-800">-</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">% Capaian</p>
              <p className="font-bold text-2xl text-gray-800">-</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">-</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Realisasi Per Triwulan</h4>
            <div className="space-y-2">
              {twData.map(tw => (
                <div key={tw.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-12">{tw.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden" />
                  <span className="text-xs font-medium text-gray-600 w-20 text-right">-</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Target Anggaran</span>
              </div>
              <p className="font-bold text-purple-700">Rp. 0</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-teal-500" />
                <span className="text-xs text-teal-600 font-medium">Realisasi Anggaran</span>
              </div>
              <p className="font-bold text-teal-700">Rp. 0</p>
              <p className="text-xs text-teal-500">(0,00%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
