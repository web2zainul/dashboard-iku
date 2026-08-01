import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { useDashboard, toDb, fromDb } from '../context/DashboardContext';
import { supabase } from '../lib/supabase';
import { getKategori, getKategoriColor, getKategoriBgColor, getKategoriTextColor, formatNumber, formatRupiahFull, computeAggregate, isDetailRow } from '../utils/calculations';
import { Notification } from './Notification';
import { TabNav, type ActiveTab } from './TabNav';
import type { IKUData } from '../types';

type GroupAgg = {
  targetRenstra: number;
  targetTahun: number;
  realisasiTW1: number;
  realisasiTW2: number;
  realisasiTW3: number;
  realisasiTW4: number;
  realisasiTahun: number;
  persentase: number;
  targetAnggaran: number;
  realisasiAnggaran: number;
  persentaseAnggaran: number;
};

interface GroupedRow {
  type: 'program' | 'indikator' | 'kegiatan' | 'subKegiatan' | 'data';
  label: string;
  depth: number;
  data?: IKUData;
  cat?: ReturnType<typeof getKategori>;
  agg?: GroupAgg;
  children?: IKUData[];
  program?: string;
  programIndikator?: string;
  kegiatan?: string;
  subKegiatan?: string;
  record?: IKUData | null;
}

function buildHierarchicalRows(data: IKUData[]): GroupedRow[] {
  const rows: GroupedRow[] = [];
  const programMap = new Map<string, Map<string, Map<string, Map<string, IKUData[]>>>>();
  const groupRecords = data.filter(d => !isDetailRow(d));
  const junkItems: IKUData[] = [];

  for (const item of data) {
    if (!isDetailRow(item)) continue;
    if (!item.program) { junkItems.push(item); continue; }
    const prog = item.program;
    const pi = item.programIndikator || item.program;
    const keg = item.kegiatan;
    const sub = item.subKegiatan;
    if (!programMap.has(prog)) programMap.set(prog, new Map());
    if (!programMap.get(prog)!.has(pi)) programMap.get(prog)!.set(pi, new Map());
    if (!programMap.get(prog)!.get(pi)!.has(keg)) programMap.get(prog)!.get(pi)!.set(keg, new Map());
    if (!programMap.get(prog)!.get(pi)!.get(keg)!.has(sub)) programMap.get(prog)!.get(pi)!.get(keg)!.set(sub, []);
    programMap.get(prog)!.get(pi)!.get(keg)!.get(sub)!.push(item);
  }

  const findRecord = (level: number, program: string, kegiatan: string, subKegiatan: string) =>
    groupRecords.find(r => r.level === level && r.program === program && r.kegiatan === kegiatan && r.subKegiatan === subKegiatan) ?? null;
  const aggFor = (items: IKUData[], record: IKUData | null) => record ? computeAggregate([record]) : computeAggregate(items);

  for (const [prog, piMap] of programMap) {
    const progItems: IKUData[] = [];
    for (const [, kegMap] of piMap) {
      for (const [, subMap] of kegMap) {
        for (const [, items] of subMap) progItems.push(...items);
      }
    }
    const progRec = findRecord(0, prog, '', '');
    rows.push({ type: 'program', label: prog, depth: 0, agg: aggFor(progItems, progRec), children: progItems, program: prog, programIndikator: '', kegiatan: '', subKegiatan: '', record: progRec });

    for (const [pi, kegMap] of piMap) {
      const indikatorItems = kegMap.get('')?.get('') ?? [];
      for (const item of indikatorItems) {
        rows.push({ type: 'indikator', label: item.indikator, depth: 1, agg: computeAggregate([item]), data: item, cat: getKategori(item.persentase), children: [item], program: prog, programIndikator: pi, kegiatan: '', subKegiatan: '', record: null });
      }
      for (const [keg, subMap] of kegMap) {
        if (!keg) continue;
        const kegItems: IKUData[] = [];
        for (const [, items] of subMap) kegItems.push(...items);
        const kegRec = findRecord(1, prog, keg, '');
        rows.push({ type: 'kegiatan', label: keg, depth: 2, agg: aggFor(kegItems, kegRec), children: kegItems, program: prog, programIndikator: pi, kegiatan: keg, subKegiatan: '', record: kegRec });
        for (const [sub, items] of subMap) {
          const subRec = findRecord(2, prog, keg, sub);
          rows.push({ type: 'subKegiatan', label: sub, depth: 3, agg: aggFor(items, subRec), children: items, program: prog, programIndikator: pi, kegiatan: keg, subKegiatan: sub, record: subRec });
          if (sub === 'Lainnya') {
            for (const item of items) {
              rows.push({ type: 'data', label: '', depth: 4, data: item, cat: getKategori(item.persentase) });
            }
          }
        }
      }
    }
  }

  if (junkItems.length > 0) {
    const prog = 'Lainnya';
    const progRec = findRecord(0, prog, '', '');
    rows.push({ type: 'program', label: prog, depth: 0, agg: aggFor(junkItems, progRec), children: junkItems, program: prog, programIndikator: '', kegiatan: '', subKegiatan: '', record: progRec });
    const kegRec = findRecord(1, prog, 'Lainnya', '');
    rows.push({ type: 'kegiatan', label: 'Lainnya', depth: 2, agg: aggFor(junkItems, kegRec), children: junkItems, program: prog, programIndikator: '', kegiatan: 'Lainnya', subKegiatan: '', record: kegRec });
    const subRec = findRecord(2, prog, 'Lainnya', 'Lainnya');
    rows.push({ type: 'subKegiatan', label: 'Lainnya', depth: 3, agg: aggFor(junkItems, subRec), children: junkItems, program: prog, programIndikator: '', kegiatan: 'Lainnya', subKegiatan: 'Lainnya', record: subRec });
    for (const item of junkItems) {
      rows.push({ type: 'data', label: '', depth: 4, data: item, cat: getKategori(item.persentase) });
    }
  }

  return rows;
}

export function IKUTable({ activeTab, onTabChange }: { activeTab: ActiveTab; onTabChange: (tab: ActiveTab) => void }) {
  const { state, dispatch } = useDashboard();
  const [sortCol, setSortCol] = useState<keyof IKUData | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<IKUData>>({});
  const [hideSubKosong, setHideSubKosong] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 4000);
    return () => clearTimeout(t);
  }, [notif]);

  const startEdit = useCallback((item: IKUData) => {
    setEditingId(item.id);
    setEditingGroup(null);
    setEditGroupData(null);
    setEditData({
      program: item.program,
      programIndikator: item.programIndikator,
      kegiatan: item.kegiatan,
      subKegiatan: item.subKegiatan,
      indikator: item.indikator,
      satuan: item.satuan,
      targetRenstra: item.targetRenstra,
      targetTahun: item.targetTahun,
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

  const saveEdit = useCallback(async () => {
    if (editingId === null) return;
    try {
      const dbFields = toDb(editData as Partial<IKUData>);
      const clean = Object.fromEntries(
        Object.entries(dbFields).filter(([_, v]) => v !== undefined)
      );
      const { error } = await supabase.from('iku_data').update(clean).eq('id', editingId);
      if (error) throw error;
      setNotif({ type: 'success', message: 'Perubahan berhasil disimpan' });
    } catch (err) {
      console.error('Supabase update error:', err);
      setNotif({ type: 'error', message: 'Gagal menyimpan ke database: ' + (err as Error).message });
    }
    dispatch({ type: 'UPDATE_ROW', payload: { id: editingId, changes: editData } });
    setEditingId(null);
    setEditData({});
  }, [editingId, editData, dispatch]);

  const [editingGroup, setEditingGroup] = useState<{
    type: 'program' | 'kegiatan' | 'subKegiatan';
    level: number;
    program: string;
    kegiatan: string;
    subKegiatan: string;
    id: number | null;
  } | null>(null);
  type GroupEditData = GroupAgg & { indikator: string; satuan: string };
  const [editGroupData, setEditGroupData] = useState<GroupEditData | null>(null);

  const startEditGroup = useCallback((row: GroupedRow) => {
    if (!row.agg || row.type === 'data' || row.type === 'indikator') return;
    const level = row.type === 'program' ? 0 : row.type === 'kegiatan' ? 1 : 2;
    setEditingGroup({
      type: row.type,
      level,
      program: row.program ?? row.label,
      kegiatan: row.kegiatan ?? '',
      subKegiatan: row.subKegiatan ?? '',
      id: row.record?.id ?? null,
    });
    setEditGroupData({
      ...row.agg,
      indikator: row.type === 'subKegiatan' ? (row.children?.[0]?.indikator ?? '') : (row.record?.indikator ?? ''),
      satuan: row.type === 'subKegiatan' ? (row.children?.[0]?.satuan ?? '') : (row.record?.satuan ?? ''),
    });
    setEditingId(null);
    setEditData({});
  }, []);

  const cancelEditGroup = useCallback(() => {
    setEditingGroup(null);
    setEditGroupData(null);
  }, []);

  const updateEditGroupField = useCallback((field: string, value: string) => {
    setEditGroupData(prev => {
      if (!prev) return prev;
      if (field === 'indikator' || field === 'satuan') {
        return { ...prev, [field]: value };
      }
      const next = { ...prev, [field]: value === '' ? 0 : Number(value) };
      next.realisasiTahun = next.realisasiTW1 + next.realisasiTW2 + next.realisasiTW3 + next.realisasiTW4;
      next.persentase = next.targetTahun > 0 ? (next.realisasiTahun / next.targetTahun) * 100 : 0;
      next.persentaseAnggaran = next.targetAnggaran > 0 ? (next.realisasiAnggaran / next.targetAnggaran) * 100 : 0;
      return next;
    });
  }, []);

  const saveEditGroup = useCallback(async () => {
    if (!editingGroup || !editGroupData) return;
    const agg = editGroupData;
    const record: IKUData = {
      id: editingGroup.id ?? 0,
      program: editingGroup.program,
      programIndikator: '',
      kegiatan: editingGroup.kegiatan,
      subKegiatan: editingGroup.subKegiatan,
      indikator: agg.indikator,
      satuan: agg.satuan,
      targetRenstra: agg.targetRenstra,
      targetTahun: agg.targetTahun,
      realisasiTW1: agg.realisasiTW1,
      realisasiTW2: agg.realisasiTW2,
      realisasiTW3: agg.realisasiTW3,
      realisasiTW4: agg.realisasiTW4,
      realisasiTahun: agg.realisasiTahun,
      persentase: agg.persentase,
      targetAnggaran: agg.targetAnggaran,
      realisasiAnggaran: agg.realisasiAnggaran,
      persentaseAnggaran: agg.persentaseAnggaran,
      tahun: state.tahun,
      level: editingGroup.level,
    };
    try {
      const dbFields = toDb(record);
      const clean = Object.fromEntries(Object.entries(dbFields).filter(([_, v]) => v !== undefined));
      if (editingGroup.id !== null) {
        const { error } = await supabase.from('iku_data').update(clean).eq('id', editingGroup.id);
        if (error) throw error;
        setNotif({ type: 'success', message: 'Perubahan berhasil disimpan' });
        dispatch({ type: 'UPDATE_ROW', payload: { id: editingGroup.id, changes: record } });
      } else {
        const { data, error } = await supabase.from('iku_data').insert(clean).select();
        if (error) throw error;
        setNotif({ type: 'success', message: 'Perubahan berhasil disimpan' });
        if (data?.[0]) {
          dispatch({ type: 'ADD_ROW', payload: fromDb(data[0]) });
        }
      }
    } catch (err) {
      console.error('Supabase group save error:', err);
      setNotif({ type: 'error', message: 'Gagal menyimpan ke database: ' + (err as Error).message });
    }
    if (editingGroup.level === 2) {
      const detailChanges = {
        indikator: agg.indikator,
        satuan: agg.satuan,
        targetRenstra: agg.targetRenstra,
        targetTahun: agg.targetTahun,
        realisasiTW1: agg.realisasiTW1,
        realisasiTW2: agg.realisasiTW2,
        realisasiTW3: agg.realisasiTW3,
        realisasiTW4: agg.realisasiTW4,
        targetAnggaran: agg.targetAnggaran,
        realisasiAnggaran: agg.realisasiAnggaran,
      };
      try {
        await supabase.from('iku_data').update({
          indikator: agg.indikator,
          satuan: agg.satuan,
          target_renstra: agg.targetRenstra,
          target_tahun: agg.targetTahun,
          realisasi_tw1: agg.realisasiTW1,
          realisasi_tw2: agg.realisasiTW2,
          realisasi_tw3: agg.realisasiTW3,
          realisasi_tw4: agg.realisasiTW4,
          target_anggaran: agg.targetAnggaran,
          realisasi_anggaran: agg.realisasiAnggaran,
        }).eq('program', editingGroup.program).eq('kegiatan', editingGroup.kegiatan).eq('sub_kegiatan', editingGroup.subKegiatan).eq('level', 3);
        const detailRow = state.data.find(d => isDetailRow(d) && d.program === editingGroup.program && d.kegiatan === editingGroup.kegiatan && d.subKegiatan === editingGroup.subKegiatan);
        if (detailRow) {
          dispatch({ type: 'UPDATE_ROW', payload: { id: detailRow.id, changes: detailChanges } });
        }
      } catch (err) {
        console.error('Supabase detail sync error:', err);
      }
    }
    setEditingGroup(null);
    setEditGroupData(null);
  }, [editingGroup, editGroupData, state.tahun, state.data, dispatch]);

  const stringFields = ['program', 'programIndikator', 'kegiatan', 'subKegiatan', 'indikator', 'satuan'];
  const updateEditField = useCallback((field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: stringFields.includes(field) ? value : value === '' ? null : Number(value),
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
    if (hideSubKosong) {
      result = result.filter(d => [d.realisasiTW1, d.realisasiTW2, d.realisasiTW3, d.realisasiTW4].some(v => v != null));
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
  }, [state.data, state.searchQuery, state.filterKategori, state.filterProgram, state.filterKegiatan, state.filterSubKegiatan, hideSubKosong, sortCol, sortDir]);

  const hierarchicalRows = useMemo(() => buildHierarchicalRows(filteredData), [filteredData]);

  const subKegiatanNos = useMemo(() => {
    let n = 0;
    return hierarchicalRows.map(row => (row.type === 'subKegiatan' ? ++n : 0));
  }, [hierarchicalRows]);

  const handleSort = (col: keyof IKUData) => {
    const newDir = sortCol === col && sortDir === 'asc' ? 'desc' : 'asc';
    setSortCol(col);
    setSortDir(newDir);
  };

  const SortIcon = ({ col }: { col: keyof IKUData }) => {
    if (sortCol !== col) return <div className="w-3 h-3" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-200" /> : <ChevronDown className="w-3 h-3 text-blue-200" />;
  };

  const kategoriFilters = ['Semua', 'Sangat Baik', 'Baik', 'Kurang'];

  const programs = useMemo(() => [...new Set(state.data.filter(isDetailRow).map(d => d.program).filter(Boolean))], [state.data]);
  const kegiatanList = useMemo(() => {
    const filtered = state.filterProgram !== 'Semua' ? state.data.filter(d => isDetailRow(d) && d.program === state.filterProgram) : state.data.filter(isDetailRow);
    return [...new Set(filtered.map(d => d.kegiatan).filter(Boolean))];
  }, [state.data, state.filterProgram]);
  const subKegiatanList = useMemo(() => {
    let filtered = state.data.filter(isDetailRow);
    if (state.filterProgram !== 'Semua') filtered = filtered.filter(d => d.program === state.filterProgram);
    if (state.filterKegiatan !== 'Semua') filtered = filtered.filter(d => d.kegiatan === state.filterKegiatan);
    return [...new Set(filtered.map(d => d.subKegiatan).filter(Boolean))];
  }, [state.data, state.filterProgram, state.filterKegiatan]);

  return (
    <div id="daftar-realisasi" className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            DAFTAR REALISASI KINERJA DAN ANGGARAN
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <TabNav active={activeTab} onChange={onTabChange} />
            <span className="w-px h-6 bg-gray-200 mx-0.5" />
            <button
              onClick={() => {
                setHideSubKosong(prev => !prev);
                dispatch({ type: 'SET_PAGE', payload: 1 });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${hideSubKosong ? 'bg-[#0f2358] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Sembunyikan sub kegiatan yang TW I-IV tidak terisi"
            >
              Sembunyikan Sub Kegiatan Kosong
            </button>
            <button
              onClick={async () => {
                try {
                  const { data, error } = await supabase.from('iku_data').insert({ tahun: state.tahun, level: 3 }).select();
                  if (error) throw error;
                  if (data?.[0]) dispatch({ type: 'ADD_ROW', payload: fromDb(data[0]) });
                } catch (err) { console.error('Supabase insert error:', err); }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Tambah Baris
            </button>
          </div>
        </div>

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
        <table className="w-full text-[9px] table-bordered" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col className="w-[2%]" />
            <col className="w-[16%]" />
            <col className="w-[15%]" />
            <col className="w-[4%]" />
            <col className="w-[5%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[3%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[4%]" />
            <col className="w-[4%]" />
            <col className="w-[7%]" />
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
                const isGroupEditing = editingGroup?.type === 'program' && editingGroup.program === row.program;
                const agg = (isGroupEditing && editGroupData ? editGroupData : row.agg)!;
                const gc = getKategori(agg.persentase);
                const gNumInputClass = "w-full px-0.5 py-0.5 text-[9px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-yellow-50";
                const gTextInputClass = "w-full px-0.5 py-0.5 text-[9px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-yellow-50";
                return (
                  <tr key={`prog-${idx}`} className="bg-[#0f2358]/5 border-b border-gray-200">
                    <td className="px-0.5 py-1" />
                    <td className="px-1 py-1 font-bold text-[#0f2358] break-words align-top">{row.label}</td>
                    <td className="px-1 py-1 text-black text-[10px] align-top">{isGroupEditing && editGroupData ? <input type="text" value={editGroupData.indikator} onChange={e => updateEditGroupField('indikator', e.target.value)} className={gTextInputClass} /> : (row.record?.indikator || '-')}</td>
                    <td className="px-0.5 py-1 text-center text-gray-400 text-[8px]">{isGroupEditing && editGroupData ? <input type="text" value={editGroupData.satuan} onChange={e => updateEditGroupField('satuan', e.target.value)} className={`${gTextInputClass} text-center`} /> : (row.record?.satuan || '-')}</td>
                    <td className="px-0.5 py-1 text-right text-gray-700 font-semibold">
                      {isGroupEditing ? <input type="number" value={agg.targetTahun} onChange={e => updateEditGroupField('targetTahun', e.target.value)} className={gNumInputClass} /> : formatNumber(agg.targetTahun)}
                    </td>
                    <td className="px-0.5 py-1 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW1} onChange={e => updateEditGroupField('realisasiTW1', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW1 > 0 ? formatNumber(agg.realisasiTW1) : '-'}
                    </td>
                    <td className="px-0.5 py-1 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW2} onChange={e => updateEditGroupField('realisasiTW2', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW2 > 0 ? formatNumber(agg.realisasiTW2) : '-'}
                    </td>
                    <td className="px-0.5 py-1 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW3} onChange={e => updateEditGroupField('realisasiTW3', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW3 > 0 ? formatNumber(agg.realisasiTW3) : '-'}
                    </td>
                    <td className="px-0.5 py-1 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW4} onChange={e => updateEditGroupField('realisasiTW4', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW4 > 0 ? formatNumber(agg.realisasiTW4) : '-'}
                    </td>
                    <td className="px-0.5 py-1 text-right font-semibold">{formatNumber(agg.realisasiTahun)}</td>
                    <td className="px-0.5 py-1 text-center font-semibold" style={{ color: getKategoriColor(gc) }}>{agg.persentase.toFixed(2)}%</td>
                    <td className="px-0.5 py-1">
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div className="h-1 rounded-full" style={{ width: `${Math.min(agg.persentase, 100)}%`, backgroundColor: getKategoriColor(gc) }} />
                      </div>
                    </td>
                    <td className="px-0.5 py-1 text-right">{isGroupEditing ? <input type="number" value={agg.targetAnggaran} onChange={e => updateEditGroupField('targetAnggaran', e.target.value)} className={`${gNumInputClass} text-right`} /> : formatRupiahFull(agg.targetAnggaran)}</td>
                    <td className="px-0.5 py-1 text-right">{isGroupEditing ? <input type="number" value={agg.realisasiAnggaran} onChange={e => updateEditGroupField('realisasiAnggaran', e.target.value)} className={`${gNumInputClass} text-right`} /> : formatRupiahFull(agg.realisasiAnggaran)}</td>
                    <td className="px-0.5 py-1 text-center font-medium">{agg.persentaseAnggaran.toFixed(1)}%</td>
                    <td className="px-0.5 py-1 text-center">
                      <span className="px-1 py-0.5 rounded-full text-[8px] font-semibold whitespace-nowrap" style={{ backgroundColor: getKategoriBgColor(gc), color: getKategoriTextColor(gc) }}>
                        {getKategori(agg.persentase)}
                      </span>
                    </td>
                    <td className="px-0.5 py-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {isGroupEditing ? (
                          <>
                            <button onClick={saveEditGroup} className="p-0.5 hover:bg-green-100 rounded transition-colors" title="Simpan"><Check className="w-2.5 h-2.5 text-green-600" /></button>
                            <button onClick={cancelEditGroup} className="p-0.5 hover:bg-red-100 rounded transition-colors" title="Batal"><X className="w-2.5 h-2.5 text-red-500" /></button>
                          </>
                        ) : (
                          <button onClick={() => startEditGroup(row)} className="p-0.5 hover:bg-yellow-50 rounded transition-colors" title="Edit Group"><Pencil className="w-2.5 h-2.5 text-yellow-500" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
              if (row.type === 'kegiatan') {
                const isGroupEditing = editingGroup?.type === 'kegiatan' && editingGroup.program === row.program && editingGroup.kegiatan === row.kegiatan;
                const agg = (isGroupEditing && editGroupData ? editGroupData : row.agg)!;
                const gc = getKategori(agg.persentase);
                const gNumInputClass = "w-full px-0.5 py-0.5 text-[9px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-yellow-50";
                const gTextInputClass = "w-full px-0.5 py-0.5 text-[9px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-yellow-50";
                return (
                  <tr key={`keg-${idx}`} className="bg-blue-50/50 border-b border-gray-100">
                    <td className="px-0.5 py-0.5" />
                    <td className="px-1 py-0.5 pl-4 font-semibold text-gray-700 break-words align-top">{row.label}</td>
                    <td className="px-1 py-0.5 text-black text-[10px] align-top">{isGroupEditing && editGroupData ? <input type="text" value={editGroupData.indikator} onChange={e => updateEditGroupField('indikator', e.target.value)} className={gTextInputClass} /> : (row.record?.indikator || '-')}</td>
                    <td className="px-0.5 py-0.5 text-center text-gray-400 text-[8px]">{isGroupEditing && editGroupData ? <input type="text" value={editGroupData.satuan} onChange={e => updateEditGroupField('satuan', e.target.value)} className={`${gTextInputClass} text-center`} /> : (row.record?.satuan || '-')}</td>
                    <td className="px-0.5 py-0.5 text-right text-gray-700 font-semibold">
                      {isGroupEditing ? <input type="number" value={agg.targetTahun} onChange={e => updateEditGroupField('targetTahun', e.target.value)} className={gNumInputClass} /> : formatNumber(agg.targetTahun)}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW1} onChange={e => updateEditGroupField('realisasiTW1', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW1 > 0 ? formatNumber(agg.realisasiTW1) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW2} onChange={e => updateEditGroupField('realisasiTW2', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW2 > 0 ? formatNumber(agg.realisasiTW2) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW3} onChange={e => updateEditGroupField('realisasiTW3', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW3 > 0 ? formatNumber(agg.realisasiTW3) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW4} onChange={e => updateEditGroupField('realisasiTW4', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW4 > 0 ? formatNumber(agg.realisasiTW4) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-right font-semibold">{formatNumber(agg.realisasiTahun)}</td>
                    <td className="px-0.5 py-0.5 text-center font-semibold" style={{ color: getKategoriColor(gc) }}>{agg.persentase.toFixed(2)}%</td>
                    <td className="px-0.5 py-0.5">
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div className="h-1 rounded-full" style={{ width: `${Math.min(agg.persentase, 100)}%`, backgroundColor: getKategoriColor(gc) }} />
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-right">{isGroupEditing ? <input type="number" value={agg.targetAnggaran} onChange={e => updateEditGroupField('targetAnggaran', e.target.value)} className={`${gNumInputClass} text-right`} /> : formatRupiahFull(agg.targetAnggaran)}</td>
                    <td className="px-0.5 py-0.5 text-right">{isGroupEditing ? <input type="number" value={agg.realisasiAnggaran} onChange={e => updateEditGroupField('realisasiAnggaran', e.target.value)} className={`${gNumInputClass} text-right`} /> : formatRupiahFull(agg.realisasiAnggaran)}</td>
                    <td className="px-0.5 py-0.5 text-center font-medium">{agg.persentaseAnggaran.toFixed(1)}%</td>
                    <td className="px-0.5 py-0.5 text-center">
                      <span className="px-1 py-0.5 rounded-full text-[8px] font-semibold whitespace-nowrap" style={{ backgroundColor: getKategoriBgColor(gc), color: getKategoriTextColor(gc) }}>
                        {getKategori(agg.persentase)}
                      </span>
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {isGroupEditing ? (
                          <>
                            <button onClick={saveEditGroup} className="p-0.5 hover:bg-green-100 rounded transition-colors" title="Simpan"><Check className="w-2.5 h-2.5 text-green-600" /></button>
                            <button onClick={cancelEditGroup} className="p-0.5 hover:bg-red-100 rounded transition-colors" title="Batal"><X className="w-2.5 h-2.5 text-red-500" /></button>
                          </>
                        ) : (
                          <button onClick={() => startEditGroup(row)} className="p-0.5 hover:bg-yellow-50 rounded transition-colors" title="Edit Group"><Pencil className="w-2.5 h-2.5 text-yellow-500" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
              if (row.type === 'subKegiatan') {
                const isGroupEditing = editingGroup?.type === 'subKegiatan' && editingGroup.program === row.program && editingGroup.kegiatan === row.kegiatan && editingGroup.subKegiatan === row.subKegiatan;
                const agg = (isGroupEditing && editGroupData ? editGroupData : row.agg)!;
                const gc = getKategori(agg.persentase);
                const child = row.children?.[0];
                const gNumInputClass = "w-full px-0.5 py-0.5 text-[9px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-yellow-50";
                const gTextInputClass = "w-full px-0.5 py-0.5 text-[9px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-yellow-50";
                return (
                  <tr key={`sub-${idx}`} className="bg-gray-50/50 border-b border-gray-100">
                    <td className="px-0.5 py-0.5" />
                    <td className="px-1 py-0.5 pl-7 font-medium text-gray-500 italic break-words align-top">
                      <span className="text-gray-400 not-italic mr-1">{subKegiatanNos[idx]}.</span>{row.label}
                    </td>
                    <td className="px-1 py-0.5 text-black text-[10px] align-top">{isGroupEditing && editGroupData ? <input type="text" value={editGroupData.indikator} onChange={e => updateEditGroupField('indikator', e.target.value)} className={gTextInputClass} /> : (child?.indikator || '-')}</td>
                    <td className="px-0.5 py-0.5 text-center text-gray-400 text-[8px]">{isGroupEditing && editGroupData ? <input type="text" value={editGroupData.satuan} onChange={e => updateEditGroupField('satuan', e.target.value)} className={`${gTextInputClass} text-center`} /> : (child?.satuan || '-')}</td>
                    <td className="px-0.5 py-0.5 text-right font-medium">
                      {isGroupEditing ? <input type="number" value={agg.targetTahun} onChange={e => updateEditGroupField('targetTahun', e.target.value)} className={gNumInputClass} /> : formatNumber(agg.targetTahun)}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW1} onChange={e => updateEditGroupField('realisasiTW1', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW1 > 0 ? formatNumber(agg.realisasiTW1) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW2} onChange={e => updateEditGroupField('realisasiTW2', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW2 > 0 ? formatNumber(agg.realisasiTW2) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW3} onChange={e => updateEditGroupField('realisasiTW3', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW3 > 0 ? formatNumber(agg.realisasiTW3) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      {isGroupEditing ? <input type="number" value={agg.realisasiTW4} onChange={e => updateEditGroupField('realisasiTW4', e.target.value)} className={gNumInputClass} /> : agg.realisasiTW4 > 0 ? formatNumber(agg.realisasiTW4) : '-'}
                    </td>
                    <td className="px-0.5 py-0.5 text-right font-medium">{formatNumber(agg.realisasiTahun)}</td>
                    <td className="px-0.5 py-0.5 text-center font-semibold" style={{ color: getKategoriColor(gc) }}>{agg.persentase.toFixed(2)}%</td>
                    <td className="px-0.5 py-0.5">
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div className="h-1 rounded-full" style={{ width: `${Math.min(agg.persentase, 100)}%`, backgroundColor: getKategoriColor(gc) }} />
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-right">{isGroupEditing ? <input type="number" value={agg.targetAnggaran} onChange={e => updateEditGroupField('targetAnggaran', e.target.value)} className={`${gNumInputClass} text-right`} /> : formatRupiahFull(agg.targetAnggaran)}</td>
                    <td className="px-0.5 py-0.5 text-right">{isGroupEditing ? <input type="number" value={agg.realisasiAnggaran} onChange={e => updateEditGroupField('realisasiAnggaran', e.target.value)} className={`${gNumInputClass} text-right`} /> : formatRupiahFull(agg.realisasiAnggaran)}</td>
                    <td className="px-0.5 py-0.5 text-center font-medium">{agg.persentaseAnggaran.toFixed(1)}%</td>
                    <td className="px-0.5 py-0.5 text-center">
                      <span className="px-1 py-0.5 rounded-full text-[8px] font-semibold whitespace-nowrap" style={{ backgroundColor: getKategoriBgColor(gc), color: getKategoriTextColor(gc) }}>
                        {getKategori(agg.persentase)}
                      </span>
                    </td>
                    <td className="px-0.5 py-0.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {isGroupEditing ? (
                          <>
                            <button onClick={saveEditGroup} className="p-0.5 hover:bg-green-100 rounded transition-colors" title="Simpan"><Check className="w-2.5 h-2.5 text-green-600" /></button>
                            <button onClick={cancelEditGroup} className="p-0.5 hover:bg-red-100 rounded transition-colors" title="Batal"><X className="w-2.5 h-2.5 text-red-500" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditGroup(row)} className="p-0.5 hover:bg-yellow-50 rounded transition-colors" title="Edit"><Pencil className="w-2.5 h-2.5 text-yellow-500" /></button>
                            <button onClick={() => child && dispatch({ type: 'SET_SELECTED_INDICATOR', payload: child })} className="p-0.5 hover:bg-blue-50 rounded transition-colors" title="Detail">
                              <Eye className="w-2.5 h-2.5 text-blue-500" />
                            </button>
                            <button onClick={async () => {
                              if (!child) return;
                              if (!window.confirm('Yakin ingin menghapus baris ini?')) return;
                              try { await supabase.from('iku_data').delete().eq('id', child.id); } catch (err) { console.error('Supabase delete error:', err); }
                              try { await supabase.from('iku_data').delete().eq('program', child.program).eq('kegiatan', child.kegiatan).eq('sub_kegiatan', child.subKegiatan).eq('level', 2); } catch (err) { console.error('Supabase group delete error:', err); }
                              dispatch({ type: 'DELETE_ROW', payload: child.id });
                            }} className="p-0.5 hover:bg-red-50 rounded transition-colors" title="Hapus">
                              <Trash2 className="w-2.5 h-2.5 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }

              const item = row.data!;
              const cat = row.cat!;
              const isIndikatorRow = row.type === 'indikator';
              let noUrut = 0;
              for (let i = 0; i <= idx; i++) {
                if (hierarchicalRows[i].type === 'data' || hierarchicalRows[i].type === 'indikator') noUrut++;
              }

              const isEditing = editingId === item.id;

              const numInputClass = "w-full px-0.5 py-0.5 text-[9px] text-right border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/50";
              const textInputClass = "w-full px-0.5 py-0.5 text-[9px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/50";

              return (
                <tr key={item.id} className={`transition-colors ${isEditing ? 'bg-blue-50/80' : isIndikatorRow ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-0.5 py-1 text-gray-400 text-center">{noUrut}</td>
                  <td className="px-1 py-1 break-words align-top">
                    {isEditing ? (
                      <div className="flex flex-col gap-0.5 min-w-[160px]">
                        <input type="text" value={editData.program ?? ''} onChange={e => updateEditField('program', e.target.value)} placeholder="Program" className={textInputClass} />
                        <input type="text" value={editData.programIndikator ?? ''} onChange={e => updateEditField('programIndikator', e.target.value)} placeholder="Indikator Program" className={textInputClass} />
                        <input type="text" value={editData.kegiatan ?? ''} onChange={e => updateEditField('kegiatan', e.target.value)} placeholder="Kegiatan" className={textInputClass} />
                        <input type="text" value={editData.subKegiatan ?? ''} onChange={e => updateEditField('subKegiatan', e.target.value)} placeholder="Sub Kegiatan" className={textInputClass} />
                      </div>
                    ) : ''}
                  </td>
                  <td className="px-1 py-1 text-black text-[10px] break-words max-w-[200px] align-top">
                    {isEditing ? (
                      <input type="text" value={editData.indikator ?? ''} onChange={e => updateEditField('indikator', e.target.value)} className={textInputClass} />
                    ) : item.indikator}
                  </td>
                  <td className="px-0.5 py-1 text-center text-gray-500 whitespace-nowrap">
                    {isEditing ? (
                      <input type="text" value={editData.satuan ?? ''} onChange={e => updateEditField('satuan', e.target.value)} className={`${textInputClass} text-center`} />
                    ) : item.satuan}
                  </td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.targetTahun ?? ''} onChange={e => updateEditField('targetTahun', e.target.value)} className={`${numInputClass} w-20`} placeholder="Target" />
                    ) : formatNumber(item.targetTahun)}
                  </td>
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
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.targetAnggaran ?? ''} onChange={e => updateEditField('targetAnggaran', e.target.value)} className={`${numInputClass} text-right`} />
                    ) : formatRupiahFull(item.targetAnggaran)}
                  </td>
                  <td className="px-0.5 py-1 text-right text-gray-600 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editData.realisasiAnggaran ?? ''} onChange={e => updateEditField('realisasiAnggaran', e.target.value)} className={`${numInputClass} text-right`} />
                    ) : formatRupiahFull(item.realisasiAnggaran)}
                  </td>
                  <td className="px-0.5 py-1 text-center font-medium text-gray-600 whitespace-nowrap">
                    {isEditing
                      ? `${(editData.targetAnggaran ?? item.targetAnggaran) > 0 ? ((editData.realisasiAnggaran ?? 0) / (editData.targetAnggaran ?? item.targetAnggaran) * 100).toFixed(1) : '0.0'}%`
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
                          <button onClick={async () => { if (!window.confirm('Yakin ingin menghapus baris ini?')) return; try { await supabase.from('iku_data').delete().eq('id', item.id); dispatch({ type: 'DELETE_ROW', payload: item.id }); } catch (err) { console.error('Supabase delete error:', err); } }} className="p-0.5 hover:bg-red-50 rounded transition-colors" title="Hapus">
                            <Trash2 className="w-2.5 h-2.5 text-red-500" />
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

      {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}
    </div>
  );
}
