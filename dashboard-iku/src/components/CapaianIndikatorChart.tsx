import { useEffect, useRef, useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
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
import { useKartu, kartuToDb, getKartuKategori, KARTU_KATEGORI_WARNA } from '../context/KartuIndikatorContext';
import { supabase } from '../lib/supabase';
import { Notification } from './Notification';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const formatPct = (v: number) => `${Number(v.toFixed(2)).toString().replace('.', ',')}%`;

const KATEGORI_LABEL: Record<string, string> = {
  merah: 'MERAH',
  kuning: 'KUNING',
  hijau: 'HIJAU',
};

export function CapaianIndikatorChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { rows, dispatch } = useKartu();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ target: number; realisasi: number }>({ target: 0, realisasi: 0 });
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 4000);
    return () => clearTimeout(t);
  }, [notif]);

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

  const startEdit = (id: number, target: number, realisasi: number) => {
    setEditingId(id);
    setEditData({ target, realisasi });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ target: 0, realisasi: 0 });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    const changes = { target: editData.target, realisasi: editData.realisasi };
    try {
      const dbFields = kartuToDb(changes);
      const clean = Object.fromEntries(Object.entries(dbFields).filter(([_, v]) => v !== undefined));
      const { error } = await supabase.from('kartu_indikator').update(clean).eq('id', editingId);
      if (error) throw error;
      setNotif({ type: 'success', message: 'Perubahan berhasil disimpan' });
    } catch (err) {
      console.error('Kartu Supabase update error:', err);
      setNotif({ type: 'error', message: 'Gagal menyimpan ke database: ' + (err as Error).message });
    }
    dispatch({ type: 'UPDATE_ROW', payload: { id: editingId, changes } });
    setEditingId(null);
    setEditData({ target: 0, realisasi: 0 });
  };

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

      {/* Kartu indikator: 4 kolom desktop, 3 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-5">
        {rows.map((d) => {
          const kategori = getKartuKategori(d.realisasi, d.target);
          const warna = KARTU_KATEGORI_WARNA[kategori];
          const isEditing = editingId === d.id;
          const numInputClass = "w-full px-1.5 py-1 text-[10px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/60";
          return (
            <div
              key={d.id}
              className="bg-white border border-[#E5E7EB] rounded-[18px] shadow-sm p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
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

              <p className="mt-3 text-sm font-semibold text-[#1e293b] leading-snug min-h-[2.75rem]">
                {d.nama}
              </p>

              <span
                className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                style={{ backgroundColor: warna }}
              >
                {KATEGORI_LABEL[kategori]}
              </span>

              <div className="mt-3 w-full space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Target</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.target}
                      onChange={(e) => setEditData(prev => ({ ...prev, target: e.target.value === '' ? 0 : Number(e.target.value) }))}
                      className={`${numInputClass} w-20`}
                    />
                  ) : (
                    <span className="font-bold text-[#0D47A1]">{formatPct(d.target)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Realisasi</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.realisasi}
                      onChange={(e) => setEditData(prev => ({ ...prev, realisasi: e.target.value === '' ? 0 : Number(e.target.value) }))}
                      className={`${numInputClass} w-20`}
                    />
                  ) : (
                    <span className="font-bold text-[#F9A825]">{formatPct(d.realisasi)}</span>
                  )}
                </div>
              </div>

              {/* Progress bar realisasi */}
              <div className="mt-2 w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, d.realisasi)}%`, backgroundColor: warna }}
                />
              </div>

              {/* Aksi edit */}
              <div className="mt-3">
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={saveEdit} className="p-1.5 rounded-lg hover:bg-green-100 transition-colors" title="Simpan">
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-red-100 transition-colors" title="Batal">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(d.id, d.target, d.realisasi)}
                    className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                    title="Edit Target & Realisasi"
                  >
                    <Pencil className="w-4 h-4 text-yellow-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}
    </section>
  );
}
