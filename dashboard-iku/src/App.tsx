import { useState } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { LaporanProvider } from './context/LaporanIKUContext';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { GaugeChart } from './components/GaugeChart';
import { DistributionChart } from './components/DistributionChart';
import { BudgetComparisonChart } from './components/BudgetComparisonChart';
import { QuarterlyBudgetChart } from './components/QuarterlyBudgetChart';
import { CategoryLegend } from './components/CategoryLegend';
import { IKUTable } from './components/IKUTable';
import { CapaianIndikatorChart } from './components/CapaianIndikatorChart';
import { ImportData } from './components/ImportData';
import { ExportButtons } from './components/ExportButtons';
import { DetailModal } from './components/DetailModal';
import type { ActiveTab } from './components/TabNav';
import { LaporanIKUTable } from './components/LaporanIKUTable';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <Header />

      {activeTab === 'laporan' ? (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          <LaporanIKUTable activeTab={activeTab} onTabChange={setActiveTab} />

          <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
            <p>Sumber Data: Formulir Pengukuran Kinerja BKPSDM Kota Cirebon — Laporan IKU TW I dan TW II Tahun 2026</p>
            <p className="mt-1">Keterangan: "-" = Belum Dilaksanakan</p>
            <p className="mt-1">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </footer>
        </main>
      ) : (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          <KPICards />

          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <ImportData />
            <ExportButtons />
          </div>

          <div id="dashboard-content" className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <GaugeChart />
              <DistributionChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <BudgetComparisonChart />
              <QuarterlyBudgetChart />
            </div>

            <CategoryLegend />

            <CapaianIndikatorChart />

            <IKUTable activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
            <p>Sumber Data: Evaluasi RENJA/RENSTRA Tahun 2026 – BKPSDM Kota Cirebon</p>
            <p className="mt-1">Keterangan: "-" = Belum Dilaksanakan</p>
            <p className="mt-1">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </footer>
        </main>
      )}

      <DetailModal />
    </div>
  );
}

function App() {
  return (
    <DashboardProvider>
      <LaporanProvider>
        <DashboardContent />
      </LaporanProvider>
    </DashboardProvider>
  );
}

export default App;
