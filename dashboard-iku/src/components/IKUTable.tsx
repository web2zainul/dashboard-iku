import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, Pencil, Check, X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { getKategori, getKategoriColor, getKategoriBgColor, getKategoriTextColor, formatNumber, formatRupiahFull } from '../utils/calculations';
import type { IKUData } from '../types';

interface GroupedRow {
  type: 'program' | 'kegiatan' | 'subKegiatan' | 'data';
  label: string;
  depth: number;
  data?: IKUData;
  cat?: ReturnType<typeof getKategori>;
}

function buildHierarchicalRows(data: IKUData[]): GroupedRow[] {
  const rows: GroupedRow[] = [];
  const programMap = new Map<string, Map<string, Map<string, IKUData[]>>>();

  for (const item of data) {
    const prog = item.program || 'Lainnya';
    const keg = item.kegiatan || 'Lainnya';
    const sub = item.subKegiatan || 'Lainnya';
    if (!programMap.has(prog)) programMap.set(prog, new Map());
    if (!programMap.get(prog)!.has(keg)) programMap.get(prog)!.set(keg, new Map());
    if (!programMap.get(prog)!.get(keg)!.has(sub)) programMap.get(prog)!.get(keg)!.set(sub, []);
    programMap.get(prog)!.get(keg)!.get(sub)!.push(item);
  }

  for (const [prog, kegMap] of programMap) {
    rows.push({ type: 'program', label: prog, depth: 0 });
    for (const [keg, subMap] of kegMap) {
      rows.push({ type: 'kegiatan', label: keg, depth: 1 });
      for (const [sub, items] of subMap) {
        rows.push({ type: 'subKegiatan', label: sub, depth: 2 });
        for (const item of items) {
          rows.push({ type: 'data', label: '', depth: 3, data: item, cat: getKategori(item.persentase) });
        }
      }
    }
  }

  return rows;
}

export function IKUTable() {
  const { state, dispatch } = useDashboard();
  const [sortCol, setSortCol] = useState<keyof IKUData | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<IKUData>>({});

  const startEdit = useCallback((item: IKUData) => {
    setEditingId(item.id);
    setEditData({
      indikator: item.indikator,
      realisasiTW1: item.realisasiTW1,
      realisasiTW2: item.realisasiTW2,
      realisasiTW3: item.realisasiTW3,
      realisasiTW4: item.realisasiTW4,
      targetAnggaran: item.targetAnggaran,
      realisasiAnggaran: item.realisasiAnggaran,
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditData({});
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId === null) return;
    dispatch({ type: 'UPDATE_ROW', payload: { id: editingId, changes: editData } });
    setEditingId(null);
    setEditData({});
  }, [editingId, editData, dispatch]);

  const updateEditField = useCallback((field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: field === 'indikator' ? value : value === '' ? null : Number(value),
    }));
  }, []);

  const filteredData = useMemo(() => {
    let result = [...state.data];
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(d =>
        d.indikator.toLowerCase().includes(q) ||
        d.program.toLowerCase().includes(q) ||
        d.kegiatan.toLowerCase().includes(q) ||
        d.subKegiatan.toLowerCase().includes(q)
      );
    }
    if (state.filterKategori !== 'Semua') {
      result = result.filter(d => getKategori(d.persentase) === state.filterKategori);
    }
    if (state.filterProgram !== 'Semua') {
      result = result.filter(d => d.program === state.filterProgram);
    }
    if (state.filterKegiatan !== 'Semua') {
      result = result.filter(d => d.kegiatan === state.filterKegiatan);
    }
    if (state.filterSubKegiatan !== 'Semua') {
      result = result.filter(d => d.subKegiatan === state.filterSubKegiatan);
    }
    if (sortCol) {
      result.sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    return result;
  }, [state.data, state.searchQuery, state.filterKategori, state.filterProgram, state.filterKegiatan, state.filterSubKegiatan, sortCol, sortDir]);

  const hierarchicalRows = useMemo(() => buildHierarchicalRows(filteredData), [filteredData]);

  const handleSort = (col: keyof IKUData) => {
    const newDir = sortCol === col && sortDir === 'asc' ? 'desc' : 'asc';
    setSortCol(col);
    setSortDir(newDir);
  };

  const SortIcon = ({ col }: { col: keyof IKUData }) => {
    if (sortCol !== col) return <div className="w-3 h-3" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-200" /> : <ChevronDown className="w-3 h-3 text-blue-200" />;
  };

  const kategoriFilters = ['Semua', 'Sangat Baik', 'Baik', 'Cukup', 'Kurang'];

  const programs = useMemo(() => [...new Set(state.data.map(d => d.program).filter(Boolean))], [state.data]);
  const kegiatanList = useMemo(() => {
    const filtered = state.filterProgram !== 'Semua' ? state.data.filter(d => d.program === state.filterProgram) : state.data;
    return [...new Set(filtered.map(d => d.kegiatan).filter(Boolean))];
  }, [state.data, state.filterProgram]);
  const subKegiatanList = useMemo(() => {
    let filtered = state.data;
    if (state.filterProgram !== 'Semua') filtered = filtered.filter(d => d.program === state.filterProgram);
    if (state.filterKegiatan !== 'Semua') filtered = filtered.filter(d => d.kegiatan === state.filterKegiatan);
    return [...new Set(filtered.map(d => d.subKegiatan).filter(Boolean))];
  }, [state.data, state.filterProgram, state.filterKegiatan]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          DAFTAR REALISASI KINERJA RENJA/RENSTRA {state.tahun}
        </h3>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari indikator, program, kegiatan..."
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select value={state.filterProgram} onChange={e => dispatch({ type: 'SET_FILTER_PROGRAM', payload: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400">
              <option value="Semua">Semua Program</option>
              {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={state.filterKegiatan} onChange={e => dispatch({ type: 'SET_FILTER_KEGIATAN', payload: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400">
              <option value="Semua">Semua Kegiatan</option>
              {kegiatanList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select value={state.filterSubKegiatan} onChange={e => dispatch({ type: 'SET_FILTER_SUB_KEGIATAN', payload: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400">
              <option value="Semua">Semua Sub Kegiatan</option>
              {subKegiatanList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {kategoriFilters.map((k) => (
              <button
                key={k}
                onClick={() => dispatch({ type: 'SET_FILTER_KATEGORI', payload: k })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${state.filterKategori === k ? 'bg-[#0f2358] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[9px]" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col className="w-[2%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[4%]" />
            <col className="w-[5%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[5%]" />
            <col className="w-[4%]" />
            <col className="w-[3%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[2%]" />
          </colgroup>
          <thead className="bg-[#0f2358] text-white text-[8px] uppercase sticky top-0 z-10">
            <tr>
              <th className="px-0.5 py-1 text-center font-semibold">No</th>
              <th className="px-1 py-1 text-left font-semibold">
                <div className="flex items-center gap-0.5 cursor-pointer hover:text-blue-200 whitespace-nowrap" onClick={() => handleSort('program')}>
                  PROGRAM / KEGIATAN <SortIcon col="program" />
                </div>
              </th>
              <th className="px-1 py-1 text-left font-semibold">
                <div className="flex items-center gap-0.5 cursor-pointer hover:text-blue-200 whitespace-nowrap" onClick={() => handleSort('indikator')}>
                  INDIKATOR KINERJA <SortIcon col="indikator" />
                </div>
              </th>
              <th className="px-0.5 py-1 text-center font-semibold">SATUAN</th>
              <th className="px-0.5 py-1 text-right font-semibold">
                <div className="flex items-center justify-end gap-0.5 cursor-pointer hover:text-blue-200 whitespace-nowrap" onClick={() => handleSort('targetTahun')}>
                  TARGET <SortIcon col="targetTahun" />
                </div>
              </th>
              <th className="px-0.5 py-1 text-center font-semibold">TW I</th>
              <th className="px-0.5 py-1 text-center font-semibold">TW II</th>
              <th className="px-0.5 py-1 text-center font-semibold">TW III</th>
              <th className="px-0.5 py-1 text-center font-semibold">TW IV</th>
              <th className="px-0.5 py-1 text-right font-semibold">
                <div className="flex items-center justify-end gap-0.5 cursor-pointer hover:text-blue-200 whitespace-nowrap" onClick={() => handleSort('realisasiTahun')}>
                  REALISASI <SortIcon col="realisasiTahun" />
                </div>
              </th>
              <th className="px-0.5 py-1 text-center font-semibold">
                <div className="flex items-center justify-center gap-0.5 cursor-pointer hover:text-blue-200 whitespace-nowrap" onClick={() => handleSort('persentase')}>
                  % CAPAIAN <SortIcon col="persentase" />
                </div>
              </th>
              <th className="px-0.5 py-1 text-center font-semibold">CAPAIAN</th>
              <th className="px-0.5 py-1 text-right font-semibold">TARGET</th>
              <th className="px-0.5 py-1 text-right font-semibold">REALISASI</th>
              <th className="px-0.5 py-1 text-center font-semibold">% ANGG</th>
              <th className="px-0.5 py-1 text-center font-semibold">STATUS</th>
              <th className="px-0.5 py-1"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {hierarchicalRows.map((row, idx) => {
              if (row.type === 'program') {
                return (
                  <tr key={`prog-${idx}`} className="bg-[#0f2358]/5 border-b border-gray-200">
                    <td className="px-0.5 py-1" />
                    <td className="px-1 py-1 font-bold text-[#0f2358] whitespace-nowrap" colSpan={16}>
                      {row.label}
                    </td>
                  </tr>
                );
              }
              if (row.type === 'kegiatan') {
                return (
                  <tr key={`keg-${idx}`} className="bg-blue-50/50 border-b border-gray-100">
                    <td className="px-0.5 py-0.5" />
                    <td className="px-1 py-0.5 pl-4 font-semibold text-gray-700 whitespace-nowrap" colSpan={16}>
                      {row.label}
                    </td>
                  </tr>
                );
              }
              if (row.type === 'subKegiatan') {
                return (
                  <tr key={`sub-${idx}`} className="bg-gray-50/50 border-b border-gray-100">
                    <td className="px-0.5 py-0.5" />
                    <td className="px-1 py-0.5 pl-7 font-medium text-gray-500 italic whitespace-nowrap" colSpan={16}>
                      {row.label}
                    </td>
                  </tr>
                );
              }

              const item = row.data!;
              const cat = row.cat!;
              let noUrut = 0;
              for (let i = 0; i <= idx; i++) {
                if (hierarchicalRows[i].type === 'data') noUrut++;
              }

              const isEditing = editingId === item.id;

              const numInputClass = "w-full px-0.5 py-0.5 text-[9px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/50";
              const textInputClass = "w-full px-0.5 py-0.5 text-[9px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/50";

              return (
                <tr key={item.id} className={`transition-colors ${isEditing ? 'bg-blue-50/80' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-0.5 py-1 text-gray-400 text-center">{noUrut}</td>
                  <td className="px-1 py-1 whitespace-nowrap" />
                  <td className="px-1 py-1 font-medium text-gray-800 whitespace-nowrap">
                    {isEditing ? (
                      <input type="text" value={editData.indikator ?? ''} onChange={e => updateEditField('indikator', e.target.value)} className={textInputClass} />
                    ) : item.indikator}
                  </td>
                  <td className="px-0.5 py-1 text-center text-gray-500 whitespace-nowrap">{item.satuan}</td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">{formatNumber(item.targetTahun)}</td>
                  <td className="px-0.5 py-1 text-center text-gray-500 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.realisasiTW1 ?? ''} onChange={e => updateEditField('realisasiTW1', e.target.value)} className={numInputClass} />
                    ) : item.realisasiTW1 !== null ? formatNumber(item.realisasiTW1) : '-'}
                  </td>
                  <td className="px-0.5 py-1 text-center text-gray-500 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.realisasiTW2 ?? ''} onChange={e => updateEditField('realisasiTW2', e.target.value)} className={numInputClass} />
                    ) : item.realisasiTW2 !== null ? formatNumber(item.realisasiTW2) : '-'}
                  </td>
                  <td className="px-0.5 py-1 text-center text-gray-500 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.realisasiTW3 ?? ''} onChange={e => updateEditField('realisasiTW3', e.target.value)} className={numInputClass} />
                    ) : item.realisasiTW3 !== null ? formatNumber(item.realisasiTW3) : '-'}
                  </td>
                  <td className="px-0.5 py-1 text-center text-gray-500 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.realisasiTW4 ?? ''} onChange={e => updateEditField('realisasiTW4', e.target.value)} className={numInputClass} />
                    ) : item.realisasiTW4 !== null ? formatNumber(item.realisasiTW4) : '-'}
                  </td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing ? formatNumber((editData.realisasiTW1 ?? 0) + (editData.realisasiTW2 ?? 0) + (editData.realisasiTW3 ?? 0) + (editData.realisasiTW4 ?? 0)) : formatNumber(item.realisasiTahun)}
                  </td>
                  <td className="px-0.5 py-1 text-center font-semibold whitespace-nowrap" style={{ color: getKategoriColor(cat) }}>
                    {isEditing ? (
                      <span style={{ color: getKategoriColor(editData.realisasiTahun !== undefined ? getKategori((editData.realisasiTahun ?? 0) / (item.targetTahun || 1) * 100) : cat) }}>
                        {item.targetTahun > 0 ? (((editData.realisasiTW1 ?? 0) + (editData.realisasiTW2 ?? 0) + (editData.realisasiTW3 ?? 0) + (editData.realisasiTW4 ?? 0)) / item.targetTahun * 100).toFixed(2) : '0.00'}%
                      </span>
                    ) : `${item.persentase.toFixed(2)}%`}
                  </td>
                  <td className="px-0.5 py-1">
                    {(() => {
                      const pct = isEditing
                        ? item.targetTahun > 0 ? ((editData.realisasiTW1 ?? 0) + (editData.realisasiTW2 ?? 0) + (editData.realisasiTW3 ?? 0) + (editData.realisasiTW4 ?? 0)) / item.targetTahun * 100 : 0
                        : item.persentase;
                      const color = getKategoriColor(getKategori(pct));
                      return (
                        <div className="w-full bg-gray-100 rounded-full h-1">
                          <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">{formatRupiahFull(item.targetAnggaran)}</td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.realisasiAnggaran ?? ''} onChange={e => updateEditField('realisasiAnggaran', e.target.value)} className={`${numInputClass} text-right`} />
                    ) : formatRupiahFull(item.realisasiAnggaran)}
                  </td>
                  <td className="px-0.5 py-1 text-center font-medium text-gray-600 whitespace-nowrap">
                    {isEditing
                      ? `${item.targetAnggaran > 0 ? ((editData.realisasiAnggaran ?? 0) / item.targetAnggaran * 100).toFixed(1) : '0.0'}%`
                      : `${item.persentaseAnggaran.toFixed(1)}%`}
                  </td>
                  <td className="px-0.5 py-1 text-center">
                    {(() => {
                      const pct = isEditing
                        ? item.targetTahun > 0 ? ((editData.realisasiTW1 ?? 0) + (editData.realisasiTW2 ?? 0) + (editData.realisasiTW3 ?? 0) + (editData.realisasiTW4 ?? 0)) / item.targetTahun * 100 : 0
                        : item.persentase;
                      const status = getKategori(pct);
                      return (
                        <span className="px-1 py-0.5 rounded-full text-[8px] font-semibold whitespace-nowrap" style={{ backgroundColor: getKategoriBgColor(status), color: getKategoriTextColor(status) }}>
                          {status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-0.5 py-1 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} className="p-0.5 hover:bg-green-100 rounded transition-colors" title="Simpan">
                            <Check className="w-2.5 h-2.5 text-green-600" />
                          </button>
                          <button onClick={cancelEdit} className="p-0.5 hover:bg-red-100 rounded transition-colors" title="Batal">
                            <X className="w-2.5 h-2.5 text-red-500" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="p-0.5 hover:bg-yellow-50 rounded transition-colors" title="Edit">
                            <Pencil className="w-2.5 h-2.5 text-yellow-500" />
                          </button>
                          <button onClick={() => dispatch({ type: 'SET_SELECTED_INDICATOR', payload: item })} className="p-0.5 hover:bg-blue-50 rounded transition-colors" title="Detail">
                            <Eye className="w-2.5 h-2.5 text-blue-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
