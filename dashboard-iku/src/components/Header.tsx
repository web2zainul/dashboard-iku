import { Building2, Calendar, Filter, RotateCcw } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { triwulanOptions, tahunOptions } from '../utils/sampleData';

export function Header() {
  const { state, dispatch } = useDashboard();

  return (
    <header className="bg-gradient-to-r from-[#0a1842] via-[#0f2358] to-[#152e6e] text-white shadow-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                DASHBOARD REALISASI KINERJA – RENJA/RENSTRA 2026
              </h1>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">
                BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KOTA CIREBON
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10">
              <Calendar className="w-4 h-4 text-blue-200" />
              <span className="text-xs text-blue-200">DATA PER:</span>
              <span className="text-sm font-semibold">{state.dataPerDate}</span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10">
              <Filter className="w-4 h-4 text-blue-200" />
              <span className="text-xs text-blue-200">Tahun:</span>
              <select
                value={state.tahun}
                onChange={(e) => dispatch({ type: 'SET_TAHUN', payload: Number(e.target.value) })}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                {tahunOptions.map((t) => (
                  <option key={t} value={t} className="text-gray-900">{t}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-blue-200">Triwulan:</span>
              <select
                value={state.triwulan}
                onChange={(e) => dispatch({ type: 'SET_TRIWULAN', payload: e.target.value })}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                {triwulanOptions.map((tw) => (
                  <option key={tw} value={tw} className="text-gray-900">{tw}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => dispatch({ type: 'RESET_FILTERS' })}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10 text-sm transition-all"
              title="Reset Filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
