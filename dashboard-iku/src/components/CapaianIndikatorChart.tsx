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
import { useKartu, getKartuKategori, KARTU_KATEGORI_WARNA } from '../context/KartuIndikatorContext';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const formatPct = (v: number) => `${Number(v.toFixed(2)).toString().replace('.', ',')}%`;

export function CapaianIndikatorChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { rows } = useKartu();

  const rataRata = rows.length > 0
    ? formatPct(rows.reduce((sum, d) => sum + d.realisasi, 0) / rows.length)
    : '0%';

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rows.map((_, i) => `Indikator ${i + 1}`),
        datasets: [
          {
            label: 'Target',
            data: rows.map((d) => d.target),
            backgroundColor: '#0D47A1',
            borderRadius: 8,
            maxBarThickness: 44,
          },
          {
            label: 'Realisasi',
            data: rows.map((d) => d.realisasi),
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
  }, [rows]);

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
          <p className="text-2xl md:text-3xl font-bold text-[#0D47A1]">{rataRata}</p>
        </div>
      </div>

      {/* Grafik batang */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-5">
        <div className="h-80">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Kartu indikator: satu baris (scroll horizontal di layar sempit) */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {rows.map((d) => {
          const kategori = getKartuKategori(d.realisasi, d.target);
          const warna = KARTU_KATEGORI_WARNA[kategori];
          return (
            <div
              key={d.id}
              className="flex-1 min-w-[190px] bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: warna }}
                >
                  <i className={`fa-solid ${d.icon} text-xl`} />
                </div>
                <span
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 text-[10px] font-bold flex items-center justify-center"
                  style={{ color: warna, borderColor: warna }}
                >
                  {d.no}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-[#1e293b] leading-snug min-h-[3.75rem] line-clamp-3">
                {d.nama}
              </p>

              <div className="mt-auto w-full pt-3">
                <div className="w-full space-y-1.5 text-xs">
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
                    style={{ width: `${Math.min(100, d.realisasi)}%`, backgroundColor: warna }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
