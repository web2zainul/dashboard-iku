import { useState } from 'react';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { useCapaian, capaianToDb, capaianFromDb } from '../context/CapaianContext';
import { supabase } from '../lib/supabase';
import { formatNumber, formatRupiahFull } from '../utils/calculations';
import type { CapaianIKU } from '../types';

type EditState = Partial<CapaianIKU>;

const TW_COLS: Array<{ key: 'realisasiTW1' | 'realisasiTW2' | 'realisasiTW3' | 'realisasiTW4'; pctKey: 'persentaseTW1' | 'persentaseTW2' | 'persentaseTW3' | 'persentaseTW4'; ketKey: 'ketTW1' | 'ketTW2' | 'ketTW3' | 'ketTW4'; label: string }> = [
  { key: 'realisasiTW1', pctKey: 'persentaseTW1', ketKey: 'ketTW1', label: 'Triwulan I' },
  { key: 'realisasiTW2', pctKey: 'persentaseTW2', ketKey: 'ketTW2', label: 'Triwulan II' },
  { key: 'realisasiTW3', pctKey: 'persentaseTW3', ketKey: 'ketTW3', label: 'Triwulan III' },
  { key: 'realisasiTW4', pctKey: 'persentaseTW4', ketKey: 'ketTW4', label: 'Triwulan IV' },
];

function emptyRow(tahun: number, id: number): CapaianIKU {
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
    realisasiTW3: null,
    persentaseTW3: 0,
    ketTW3: '',
    realisasiTW4: null,
    persentaseTW4: 0,
    ketTW4: '',
    program: '',
    pagu: 0,
    realisasiAnggaran: 0,
    persentaseAnggaran: 0,
    tahun,
  };
}

export function CapaianIKUTable() {
  const { rows, dispatch } = useCapaian();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditState>({});

  const textInputClass = "w-full px-1 py-1 text-[10px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/60";
  const numInputClass = "w-full px-1 py-1 text-[10px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/60";

  const startEdit = (item: CapaianIKU) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const updateField = (field: keyof CapaianIKU, value: string, numeric: boolean, nullable = false) => {
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

  const saveEdit = async () => {
    if (editingId === null) return;
    const changes = { ...editData };
    try {
      const dbFields = capaianToDb(changes);
      const clean = Object.fromEntries(Object.entries(dbFields).filter(([_, v]) => v !== undefined));
      if (editingId > 0) {
        await supabase.from('capaian_iku').update(clean).eq('id', editingId);
      }
    } catch (err) {
      console.error('Capaian Supabase update error:', err);
    }
    dispatch({ type: 'UPDATE_ROW', payload: { id: editingId, changes } });
    setEditingId(null);
    setEditData({});
  };

  const addRow = async () => {
    try {
      const { data, error } = await supabase.from('capaian_iku').insert(capaianToDb(emptyRow(2026, 0))).select();
      if (error) throw error;
      if (data?.[0]) {
        dispatch({ type: 'ADD_ROW', payload: capaianFromDb(data[0]) });
        return;
      }
    } catch (err) {
      console.error('Capaian Supabase insert error:', err);
    }
    dispatch({ type: 'ADD_ROW', payload: emptyRow(2026, -Date.now()) });
  };

  const deleteRow = async (item: CapaianIKU) => {
    if (!window.confirm('Yakin ingin menghapus baris ini?')) return;
    try {
      await supabase.from('capaian_iku').delete().eq('id', item.id);
    } catch (err) {
      console.error('Capaian Supabase delete error:', err);
    }
    dispatch({ type: 'DELETE_ROW', payload: item.id });
    if (editingId === item.id) cancelEdit();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          FORMULIR PENGUKURAN KINERJA (CAPAIAN IKU) — TAHUN 2026
        </h3>
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
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[4%]" />
            <col className="w-[3%]" />
            <col className="w-[2.5%]" />
            <col className="w-[8%]" />
            <col className="w-[3%]" />
            <col className="w-[2.5%]" />
            <col className="w-[8%]" />
            <col className="w-[3%]" />
            <col className="w-[2.5%]" />
            <col className="w-[8%]" />
            <col className="w-[3%]" />
            <col className="w-[2.5%]" />
            <col className="w-[8%]" />
            <col className="w-[9%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
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
                <th key={tw.key} colSpan={3} className="px-0.5 py-1 font-semibold">{tw.label}</th>
              ))}
              <th rowSpan={2} className="px-1 py-1 font-semibold text-left">PROGRAM</th>
              <th colSpan={3} className="px-0.5 py-1 font-semibold">JUMLAH REALISASI ANGGARAN</th>
              <th rowSpan={2} className="px-0.5 py-1 font-semibold"></th>
            </tr>
            <tr>
              {TW_COLS.map(tw => (
                <>
                  <th key={`${tw.key}-r`} className="px-0.5 py-1 font-semibold bg-[#152e6e]">REALISASI</th>
                  <th key={`${tw.key}-p`} className="px-0.5 py-1 font-semibold bg-[#152e6e]">%</th>
                  <th key={`${tw.key}-k`} className="px-0.5 py-1 font-semibold bg-[#152e6e]">KET</th>
                </>
              ))}
              <th className="px-0.5 py-1 font-semibold bg-[#152e6e]">PAGU</th>
              <th className="px-0.5 py-1 font-semibold bg-[#152e6e]">REALISASI</th>
              <th className="px-0.5 py-1 font-semibold bg-[#152e6e]">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((item) => {
              const isEditing = editingId === item.id;
              const edit = isEditing ? editData : item;
              const target = isEditing ? (editData.targetTahun ?? item.targetTahun) : item.targetTahun;
              const pagu = isEditing ? (editData.pagu ?? item.pagu) : item.pagu;
              const realAng = isEditing ? (editData.realisasiAnggaran ?? item.realisasiAnggaran) : item.realisasiAnggaran;
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
                    const realisasi = isEditing ? (edit[tw.key] ?? null) : item[tw.key];
                    const pct = livePct(realisasi as number | null, target);
                    return (
                      <>
                        <td className="px-0.5 py-1 text-center text-gray-600 whitespace-nowrap">
                          {isEditing
                            ? <input type="number" value={realisasi ?? ''} onChange={e => updateField(tw.key, e.target.value, true, true)} className={numInputClass} />
                            : realisasi !== null ? `${formatNumber(realisasi as number)}%` : '-'}
                        </td>
                        <td className="px-0.5 py-1 text-center font-medium whitespace-nowrap" style={{ color: pct > 0 ? '#0f2358' : '#9ca3af' }}>
                          {pct > 0 ? `${pct.toFixed(2)}%` : '-'}
                        </td>
                        <td className="px-0.5 py-1 align-top break-words">
                          {isEditing
                            ? <textarea rows={2} value={edit[tw.ketKey] ?? ''} onChange={e => updateField(tw.ketKey, e.target.value, false)} className={textInputClass} />
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
                      ? <input type="number" value={edit.realisasiAnggaran ?? 0} onChange={e => updateField('realisasiAnggaran', e.target.value, true)} className={numInputClass} />
                      : formatRupiahFull(item.realisasiAnggaran)}
                  </td>
                  <td className="px-0.5 py-1 text-center font-medium text-gray-600 whitespace-nowrap">
                    {pagu > 0 ? `${((realAng / pagu) * 100).toFixed(2)}%` : '-'}
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
                <td colSpan={22} className="px-4 py-8 text-center text-gray-400 text-xs">
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
