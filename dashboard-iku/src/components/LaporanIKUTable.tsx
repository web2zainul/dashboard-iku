import { useState } from 'react';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { useLaporan, laporanToDb, laporanFromDb } from '../context/LaporanIKUContext';
import { supabase } from '../lib/supabase';
import { formatNumber, formatRupiahFull } from '../utils/calculations';
import type { LaporanIKU } from '../types';

type EditState = Partial<LaporanIKU>;

const TW_COLS: Array<{
  realKey: 'realisasiTW1' | 'realisasiTW2';
  pctKey: 'persentaseTW1' | 'persentaseTW2';
  ketKey: 'ketTW1' | 'ketTW2';
  label: string;
}> = [
  { realKey: 'realisasiTW1', pctKey: 'persentaseTW1', ketKey: 'ketTW1', label: 'Triwulan I' },
  { realKey: 'realisasiTW2', pctKey: 'persentaseTW2', ketKey: 'ketTW2', label: 'Triwulan II' },
];

function emptyRow(tahun: number, id: number): LaporanIKU {
  return {
    id,
    no: 0,
    sasaranStrategis: '',
    indikator: '',
    caraPengukuran: '',
    targetTahun: 0,
    realisasiTW1: null,
    persentaseTW1: 0,
    ketTW1: '',
    realisasiTW2: null,
    persentaseTW2: 0,
    ketTW2: '',
    program: '',
    pagu: 0,
    realisasiAnggaranTW1: 0,
    persentaseAnggaranTW1: 0,
    realisasiAnggaranTW2: 0,
    persentaseAnggaranTW2: 0,
    tahun,
  };
}

export function LaporanIKUTable() {
  const { rows, dispatch } = useLaporan();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditState>({});

  const textInputClass = "w-full px-1 py-1 text-[10px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/60";
  const numInputClass = "w-full px-1 py-1 text-[10px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/60";

  const startEdit = (item: LaporanIKU) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const updateField = (field: keyof LaporanIKU, value: string, numeric: boolean, nullable = false) => {
    setEditData(prev => {
      let next: unknown = value;
      if (numeric) {
        next = value === '' ? (nullable ? null : 0) : Number(value);
      }
      return { ...prev, [field]: next };
    });
  };

  const livePct = (realisasi: number | null | undefined, target: number | undefined) =>
    realisasi != null && (target ?? 0) > 0 ? (realisasi / (target ?? 1)) * 100 : 0;

  const liveAngPct = (realAng: number | undefined, pagu: number | undefined) =>
    (pagu ?? 0) > 0 ? ((realAng ?? 0) / (pagu ?? 1)) * 100 : 0;

  const saveEdit = async () => {
    if (editingId === null) return;
    const changes = { ...editData };
    try {
      const dbFields = laporanToDb(changes);
      const clean = Object.fromEntries(Object.entries(dbFields).filter(([_, v]) => v !== undefined));
      if (editingId > 0) {
        await supabase.from('laporan_iku').update(clean).eq('id', editingId);
      }
    } catch (err) {
      console.error('Laporan Supabase update error:', err);
    }
    dispatch({ type: 'UPDATE_ROW', payload: { id: editingId, changes } });
    setEditingId(null);
    setEditData({});
  };

  const addRow = async () => {
    try {
      const { data, error } = await supabase.from('laporan_iku').insert(laporanToDb(emptyRow(2026, 0))).select();
      if (error) throw error;
      if (data?.[0]) {
        dispatch({ type: 'ADD_ROW', payload: laporanFromDb(data[0]) });
        return;
      }
    } catch (err) {
      console.error('Laporan Supabase insert error:', err);
    }
    dispatch({ type: 'ADD_ROW', payload: emptyRow(2026, -Date.now()) });
  };

  const deleteRow = async (item: LaporanIKU) => {
    if (!window.confirm('Yakin ingin menghapus baris ini?')) return;
    try {
      await supabase.from('laporan_iku').delete().eq('id', item.id);
    } catch (err) {
      console.error('Laporan Supabase delete error:', err);
    }
    dispatch({ type: 'DELETE_ROW', payload: item.id });
    if (editingId === item.id) cancelEdit();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            FORMULIR PENGUKURAN KINERJA — LAPORAN IKU TW I & TW II TAHUN 2026
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">
            Sumber: Formulir Pengukuran Kinerja BKPSDM Kota Cirebon — Laporan TW I dan TW II 2026
          </p>
        </div>
        <button
          onClick={addRow}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Tambah Baris
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[9px]" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col className="w-[2%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[3.5%]" />
            <col className="w-[2.5%]" />
            <col className="w-[2.5%]" />
            <col className="w-[9%]" />
            <col className="w-[2.5%]" />
            <col className="w-[2.5%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[5%]" />
            <col className="w-[3%]" />
            <col className="w-[5%]" />
            <col className="w-[3%]" />
            <col className="w-[3%]" />
          </colgroup>
          <thead className="bg-[#0f2358] text-white text-[8px] uppercase sticky top-0 z-10">
            <tr>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold">No</th>
              <th rowSpan={2} className="px-1 py-1 font-semibold text-left">SASARAN STRATEGIS</th>
              <th rowSpan={2} className="px-1 py-1 font-semibold text-left">INDIKATOR</th>
              <th rowSpan={2} className="px-1 py-1 font-semibold text-left">CARA PENGUKURAN INDIKATOR SASARAN</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold">TARGET TAHUN 2026</th>
              {TW_COLS.map(tw => (
                <th key={tw.realKey} colSpan={3} className="px-0.5 py-1 font-semibold">{tw.label}</th>
              ))}
              <th rowSpan={2} className="px-1 py-1 font-semibold text-left">PROGRAM</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold">PAGU</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold">REALISASI TW I</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold">% TW I</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold">REALISASI TW II</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold">% TW II</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold"></th>
            </tr>
            <tr>
              {TW_COLS.map(tw => (
                <>
                  <th key={`${tw.realKey}-r`} className="px-0.5 py-1 font-semibold bg-[#152e6e]">REALISASI</th>
                  <th key={`${tw.realKey}-p`} className="px-0.5 py-1 font-semibold bg-[#152e6e]">%</th>
                  <th key={`${tw.realKey}-k`} className="px-0.5 py-1 font-semibold bg-[#152e6e]">KET</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((item) => {
              const isEditing = editingId === item.id;
              const edit = isEditing ? editData : item;
              const target = isEditing ? (editData.targetTahun ?? item.targetTahun) : item.targetTahun;
              const pagu = isEditing ? (editData.pagu ?? item.pagu) : item.pagu;
              const realAng1 = isEditing ? (editData.realisasiAnggaranTW1 ?? item.realisasiAnggaranTW1) : item.realisasiAnggaranTW1;
              const realAng2 = isEditing ? (editData.realisasiAnggaranTW2 ?? item.realisasiAnggaranTW2) : item.realisasiAnggaranTW2;
              return (
                <tr key={item.id} className={`transition-colors ${isEditing ? 'bg-blue-50/70' : 'hover:bg-gray-50/60'}`}>
                  <td className="px-0.5 py-1 text-center text-gray-400">
                    {isEditing ? (
                      <input type="number" value={edit.no ?? 0} onChange={e => updateField('no', e.target.value, true)} className={`${numInputClass} text-center`} />
                    ) : item.no}
                  </td>
                  <td className="px-1 py-1 align-top break-words">
                    {isEditing
                      ? <textarea rows={3} value={edit.sasaranStrategis ?? ''} onChange={e => updateField('sasaranStrategis', e.target.value, false)} className={textInputClass} />
                      : item.sasaranStrategis}
                  </td>
                  <td className="px-1 py-1 align-top break-words">
                    {isEditing
                      ? <textarea rows={3} value={edit.indikator ?? ''} onChange={e => updateField('indikator', e.target.value, false)} className={textInputClass} />
                      : item.indikator}
                  </td>
                  <td className="px-1 py-1 align-top break-words">
                    {isEditing
                      ? <textarea rows={3} value={edit.caraPengukuran ?? ''} onChange={e => updateField('caraPengukuran', e.target.value, false)} className={textInputClass} />
                      : item.caraPengukuran}
                  </td>
                  <td className="px-0.5 py-1 text-right font-semibold text-gray-700 whitespace-nowrap">
                    {isEditing
                      ? <input type="number" value={edit.targetTahun ?? 0} onChange={e => updateField('targetTahun', e.target.value, true)} className={`${numInputClass} w-16`} />
                      : `${formatNumber(item.targetTahun)}%`}
                  </td>
                  {TW_COLS.map(tw => {
                    const realisasi = isEditing ? (edit[tw.realKey] ?? null) : item[tw.realKey];
                    const pct = livePct(realisasi as number | null, target);
                    return (
                      <>
                        <td className="px-0.5 py-1 text-center text-gray-600 whitespace-nowrap">
                          {isEditing
                            ? <input type="number" value={realisasi ?? ''} onChange={e => updateField(tw.realKey, e.target.value, true, true)} className={numInputClass} />
                            : realisasi !== null ? `${formatNumber(realisasi as number)}%` : '-'}
                        </td>
                        <td className="px-0.5 py-1 text-center font-medium whitespace-nowrap" style={{ color: pct > 0 ? '#0f2358' : '#9ca3af' }}>
                          {pct > 0 ? `${pct.toFixed(2)}%` : '-'}
                        </td>
                        <td className="px-0.5 py-1 align-top break-words">
                          {isEditing
                            ? <textarea rows={3} value={edit[tw.ketKey] ?? ''} onChange={e => updateField(tw.ketKey, e.target.value, false)} className={textInputClass} />
                            : item[tw.ketKey]}
                        </td>
                      </>
                    );
                  })}
                  <td className="px-1 py-1 align-top break-words">
                    {isEditing
                      ? <textarea rows={2} value={edit.program ?? ''} onChange={e => updateField('program', e.target.value, false)} className={textInputClass} />
                      : item.program}
                  </td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing
                      ? <input type="number" value={edit.pagu ?? 0} onChange={e => updateField('pagu', e.target.value, true)} className={numInputClass} />
                      : formatRupiahFull(item.pagu)}
                  </td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing
                      ? <input type="number" value={edit.realisasiAnggaranTW1 ?? 0} onChange={e => updateField('realisasiAnggaranTW1', e.target.value, true)} className={numInputClass} />
                      : formatRupiahFull(item.realisasiAnggaranTW1)}
                  </td>
                  <td className="px-0.5 py-1 text-center font-medium text-gray-600 whitespace-nowrap">
                    {isEditing ? `${liveAngPct(realAng1, pagu).toFixed(2)}%` : item.persentaseAnggaranTW1.toFixed(2)}
                  </td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing
                      ? <input type="number" value={edit.realisasiAnggaranTW2 ?? 0} onChange={e => updateField('realisasiAnggaranTW2', e.target.value, true)} className={numInputClass} />
                      : formatRupiahFull(item.realisasiAnggaranTW2)}
                  </td>
                  <td className="px-0.5 py-1 text-center font-medium text-gray-600 whitespace-nowrap">
                    {isEditing ? `${liveAngPct(realAng2, pagu).toFixed(2)}%` : item.persentaseAnggaranTW2.toFixed(2)}
                  </td>
                  <td className="px-0.5 py-1 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} className="p-1 hover:bg-green-100 rounded transition-colors" title="Simpan">
                            <Check className="w-3 h-3 text-green-600" />
                          </button>
                          <button onClick={cancelEdit} className="p-1 hover:bg-red-100 rounded transition-colors" title="Batal">
                            <X className="w-3 h-3 text-red-500" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="p-1 hover:bg-yellow-50 rounded transition-colors" title="Edit">
                            <Pencil className="w-3 h-3 text-yellow-500" />
                          </button>
                          <button onClick={() => deleteRow(item)} className="p-1 hover:bg-red-50 rounded transition-colors" title="Hapus">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={17} className="px-4 py-8 text-center text-gray-400 text-xs">
                  Belum ada data. Klik "Tambah Baris" untuk mengisi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
