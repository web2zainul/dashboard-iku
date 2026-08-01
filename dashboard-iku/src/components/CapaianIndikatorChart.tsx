import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

type Indikator = {
  no: number;
  nama: string;
  target: number;
  realisasi: number;
  icon: string;
  warna: string;
};

// Sumber data tunggal: grafik & kartu membaca dari array ini
const INDIKATOR_DATA: Indikator[] = [
  { no: 1, nama: 'Persentase Perencanaan Kebutuhan ASN yang Sesuai dengan Formasi', target: 83, realisasi: 0, icon: 'fa-clipboard-list', warna: '#EF4444' },
  { no: 2, nama: 'Persentase Pengembangan Karier ASN sesuai Kompetensi', target: 100, realisasi: 50, icon: 'fa-person-running', warna: '#F97316' },
  { no: 3, nama: 'Persentase ASN yang Ditingkatkan Kompetensinya', target: 91, realisasi: 76.92, icon: 'fa-user-graduate', warna: '#F59E0B' },
  { no: 4, nama: 'Persentase Pegawai dengan SKP Bernilai Baik', target: 92, realisasi: 0, icon: 'fa-clipboard-check', warna: '#EF4444' },
  { no: 5, nama: 'Persentase ASN Mendapatkan Pengembangan Kompetensi Teknis', target: 14.1, realisasi: 85.08, icon: 'fa-book-open', warna: '#10B981' },
  { no: 6, nama: 'Persentase Realisasi Pendidikan dan Pelatihan yang Dilaksanakan', target: 100, realisasi: 50, icon: 'fa-graduation-cap', warna: '#F59E0B' },
  { no: 7, nama: 'Indeks Kematangan Organisasi', target: 47.25, realisasi: 0, icon: 'fa-building-columns', warna: '#0D47A1' },
];

const formatPct = (v: number) => `${Number(v.toFixed(2)).toString().replace('.', ',')}%`;

function hitungRataRata(): string {
  const total = INDIKATOR_DATA.reduce((sum, d) => sum + d.realisasi, 0);
  return formatPct(total / INDIKATOR_DATA.length);
}

export function CapaianIndikatorChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: INDIKATOR_DATA.map((_, i) => `Indikator ${i + 1}`),
        datasets: [
          {
            label: 'Target',
            data: INDIKATOR_DATA.map((d) => d.target),
            backgroundColor: '#0D47A1',
            borderRadius: 8,
            maxBarThickness: 44,
          },
          {
            label: 'Realisasi',
            data: INDIKATOR_DATA.map((d) => d.realisasi),
            backgroundColor: '#F9A825',
            borderRadius: 8,
            maxBarThickness: 44,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, boxWidth: 12, font: { family: 'Poppins', size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: ${formatPct(item.parsed.y ?? 0)}`,
            },
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#334155',
            font: { family: 'Poppins', size: 11, weight: 'bold' },
            formatter: (value: number) => formatPct(value),
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Poppins', size: 12 }, color: '#64748b' },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: '#E5E7EB' },
            border: { display: false },
            ticks: {
              stepSize: 20,
              callback: (value: number | string) => `${value}%`,
              font: { family: 'Poppins', size: 11 },
              color: '#64748b',
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return (
    <section className="space-y-5" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
      {/* Header biru + kartu ringkasan rata-rata */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0D47A1] rounded-[12px] px-5 py-4 shadow-lg">
        <h2 className="text-white text-lg md:text-2xl font-bold tracking-wide">
          CAPAIAN INDIKATOR KINERJA PROGRAM
        </h2>
        <div className="bg-white border-2 border-[#0D47A1] rounded-xl px-6 py-2.5 shadow-sm text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">
            Rata-rata Capaian Indikator Kinerja Program
          </p>
          <p className="text-2xl md:text-3xl font-bold text-[#0D47A1]">{hitungRataRata()}</p>
        </div>
      </div>

      {/* Grafik batang */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-5">
        <div className="h-80">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Kartu indikator: 4 kolom desktop, 3 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-5">
        {INDIKATOR_DATA.map((d) => (
          <div
            key={d.no}
            className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: d.warna }}
              >
                <i className={`fa-solid ${d.icon} text-xl`} />
              </div>
              <span
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 text-[10px] font-bold flex items-center justify-center"
                style={{ color: d.warna, borderColor: d.warna }}
              >
                {d.no}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-[#1e293b] leading-snug min-h-[2.75rem]">
              {d.nama}
            </p>

            <div className="mt-3 w-full space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Target</span>
                <span className="font-bold text-[#0D47A1]">{formatPct(d.target)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Realisasi</span>
                <span className="font-bold text-[#F9A825]">{formatPct(d.realisasi)}</span>
              </div>
            </div>

            {/* Progress bar realisasi */}
            <div className="mt-2 w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, d.realisasi)}%`, backgroundColor: d.warna }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
