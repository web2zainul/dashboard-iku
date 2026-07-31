import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import * as XLSX from 'xlsx';
import type { DashboardState, IKUData } from '../types';
import { sampleData } from '../utils/sampleData';
import { parseRenjaExcel } from '../utils/excelParser';
import { computeAggregate, isDetailRow } from '../utils/calculations';
import { supabase } from '../lib/supabase';

type DashboardAction =
  | { type: 'SET_DATA'; payload: IKUData[] }
  | { type: 'SET_TAHUN'; payload: number }
  | { type: 'SET_TRIWULAN'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTER_KATEGORI'; payload: string }
  | { type: 'SET_FILTER_PROGRAM'; payload: string }
  | { type: 'SET_FILTER_KEGIATAN'; payload: string }
  | { type: 'SET_FILTER_SUB_KEGIATAN'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_DATA_PER_DATE'; payload: string }
  | { type: 'SET_SELECTED_INDICATOR'; payload: IKUData | null }
  | { type: 'SET_SHOW_IMPORT_MODAL'; payload: boolean }
  | { type: 'UPDATE_ROW'; payload: { id: number; changes: Partial<IKUData> } }
  | { type: 'ADD_ROW'; payload: IKUData }
  | { type: 'DELETE_ROW'; payload: number }
  | { type: 'RESET_FILTERS' };

const initialState: DashboardState = {
  data: sampleData,
  tahun: 2026,
  triwulan: 'Semua Triwulan',
  searchQuery: '',
  filterKategori: 'Semua',
  filterProgram: 'Semua',
  filterKegiatan: 'Semua',
  filterSubKegiatan: 'Semua',
  currentPage: 1,
  itemsPerPage: 10,
  dataPerDate: '30 Juni 2026',
  selectedIndicator: null,
  showImportModal: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload, currentPage: 1 };
    case 'SET_TAHUN':
      return { ...state, tahun: action.payload, currentPage: 1 };
    case 'SET_TRIWULAN':
      return { ...state, triwulan: action.payload, currentPage: 1 };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_FILTER_KATEGORI':
      return { ...state, filterKategori: action.payload, currentPage: 1 };
    case 'SET_FILTER_PROGRAM':
      return { ...state, filterProgram: action.payload, filterKegiatan: 'Semua', filterSubKegiatan: 'Semua', currentPage: 1 };
    case 'SET_FILTER_KEGIATAN':
      return { ...state, filterKegiatan: action.payload, filterSubKegiatan: 'Semua', currentPage: 1 };
    case 'SET_FILTER_SUB_KEGIATAN':
      return { ...state, filterSubKegiatan: action.payload, currentPage: 1 };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_DATA_PER_DATE':
      return { ...state, dataPerDate: action.payload };
    case 'SET_SELECTED_INDICATOR':
      return { ...state, selectedIndicator: action.payload };
    case 'SET_SHOW_IMPORT_MODAL':
      return { ...state, showImportModal: action.payload };
    case 'ADD_ROW':
      return { ...state, data: [...state.data, action.payload] };
    case 'DELETE_ROW':
      return { ...state, data: state.data.filter(d => d.id !== action.payload) };
    case 'RESET_FILTERS':
      return {
        ...initialState,
        data: state.data,
        dataPerDate: state.dataPerDate,
        tahun: state.tahun,
      };
    case 'UPDATE_ROW':
      return {
        ...state,
        data: state.data.map(row => {
          if (row.id !== action.payload.id) return row;
          const updated = { ...row, ...action.payload.changes };
          updated.realisasiTahun = (updated.realisasiTW1 ?? 0) + (updated.realisasiTW2 ?? 0) + (updated.realisasiTW3 ?? 0) + (updated.realisasiTW4 ?? 0);
          updated.persentase = updated.targetTahun > 0 ? (updated.realisasiTahun / updated.targetTahun) * 100 : 0;
          updated.persentaseAnggaran = updated.targetAnggaran > 0 ? (updated.realisasiAnggaran / updated.targetAnggaran) * 100 : 0;
          return updated;
        }),
      };
    default:
      return state;
  }
}

function toDb(row: Partial<IKUData>) {
  return {
    program: row.program,
    kegiatan: row.kegiatan,
    sub_kegiatan: row.subKegiatan,
    indikator: row.indikator,
    satuan: row.satuan,
    target_renstra: row.targetRenstra,
    target_tahun: row.targetTahun,
    realisasi_tw1: row.realisasiTW1 ?? null,
    realisasi_tw2: row.realisasiTW2 ?? null,
    realisasi_tw3: row.realisasiTW3 ?? null,
    realisasi_tw4: row.realisasiTW4 ?? null,
    target_anggaran: row.targetAnggaran,
    realisasi_anggaran: row.realisasiAnggaran,
    tahun: row.tahun,
    level: row.level ?? 3,
  };
}

function fromDb(row: Record<string, unknown>): IKUData {
  const tw1 = (row.realisasi_tw1 as number) ?? null;
  const tw2 = (row.realisasi_tw2 as number) ?? null;
  const tw3 = (row.realisasi_tw3 as number) ?? null;
  const tw4 = (row.realisasi_tw4 as number) ?? null;
  const targetTahun = (row.target_tahun as number) ?? 0;
  const realisasiTahun = (tw1 ?? 0) + (tw2 ?? 0) + (tw3 ?? 0) + (tw4 ?? 0);
  const targetAnggaran = (row.target_anggaran as number) ?? 0;
  const realisasiAnggaran = (row.realisasi_anggaran as number) ?? 0;
  return {
    id: row.id as number,
    program: (row.program as string) ?? '',
    kegiatan: (row.kegiatan as string) ?? '',
    subKegiatan: (row.sub_kegiatan as string) ?? '',
    indikator: (row.indikator as string) ?? '',
    satuan: (row.satuan as string) ?? '',
    targetRenstra: (row.target_renstra as number) ?? 0,
    targetTahun,
    realisasiTW1: tw1,
    realisasiTW2: tw2,
    realisasiTW3: tw3,
    realisasiTW4: tw4,
    realisasiTahun,
    persentase: targetTahun > 0 ? (realisasiTahun / targetTahun) * 100 : 0,
    targetAnggaran,
    realisasiAnggaran,
    persentaseAnggaran: targetAnggaran > 0 ? (realisasiAnggaran / targetAnggaran) * 100 : 0,
    tahun: (row.tahun as number) ?? 2026,
    level: (row.level as number) ?? 3,
  };
}

function makeGroupRecord(opts: { program: string; kegiatan: string; subKegiatan: string; level: number; items: IKUData[]; tahun: number }): IKUData {
  const agg = computeAggregate(opts.items);
  return {
    id: 0,
    program: opts.program,
    kegiatan: opts.kegiatan,
    subKegiatan: opts.subKegiatan,
    indikator: '',
    satuan: '',
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
    tahun: opts.tahun,
    level: opts.level,
  };
}

async function ensureGroupRows(allRows: IKUData[]): Promise<IKUData[]> {
  const details = allRows.filter(isDetailRow);
  const groups = allRows.filter(d => !isDetailRow(d));

  const exists = (level: number, program: string, kegiatan: string, subKegiatan: string) =>
    groups.some(g => g.level === level && g.program === program && g.kegiatan === kegiatan && g.subKegiatan === subKegiatan);

  const programMap = new Map<string, Map<string, Map<string, IKUData[]>>>();
  for (const item of details) {
    const prog = item.program || 'Lainnya';
    const keg = item.kegiatan || 'Lainnya';
    const sub = item.subKegiatan || 'Lainnya';
    if (!programMap.has(prog)) programMap.set(prog, new Map());
    if (!programMap.get(prog)!.has(keg)) programMap.get(prog)!.set(keg, new Map());
    if (!programMap.get(prog)!.get(keg)!.has(sub)) programMap.get(prog)!.get(keg)!.set(sub, []);
    programMap.get(prog)!.get(keg)!.get(sub)!.push(item);
  }

  const tahun = details[0]?.tahun ?? 2026;
  const newGroups: IKUData[] = [];

  for (const [prog, kegMap] of programMap) {
    const progItems: IKUData[] = [];
    for (const [, subMap] of kegMap) {
      for (const [, items] of subMap) progItems.push(...items);
    }
    if (!exists(0, prog, '', '')) {
      newGroups.push(makeGroupRecord({ program: prog, kegiatan: '', subKegiatan: '', level: 0, items: progItems, tahun }));
    }
    for (const [keg, subMap] of kegMap) {
      const kegItems: IKUData[] = [];
      for (const [, items] of subMap) kegItems.push(...items);
      if (!exists(1, prog, keg, '')) {
        newGroups.push(makeGroupRecord({ program: prog, kegiatan: keg, subKegiatan: '', level: 1, items: kegItems, tahun }));
      }
      for (const [sub, items] of subMap) {
        if (!exists(2, prog, keg, sub)) {
          newGroups.push(makeGroupRecord({ program: prog, kegiatan: keg, subKegiatan: sub, level: 2, items, tahun }));
        }
      }
    }
  }

  if (newGroups.length === 0) return allRows;
  try {
    const dbRows = newGroups.map(g => toDb(g));
    const { data, error } = await supabase.from('iku_data').insert(dbRows).select();
    if (error) throw error;
    const inserted = (data ?? []).map(fromDb);
    return [...allRows, ...inserted];
  } catch (err) {
    console.error('ensureGroupRows insert error:', err);
    return allRows;
  }
}

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  supabaseLoaded: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [supabaseLoaded, setSupabaseLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      let rows: IKUData[] | null = null;

      try {
        const { data, error } = await supabase
          .from('iku_data')
          .select('*')
          .order('id');

        if (error) throw error;
        if (data && data.length > 0) {
          rows = data.map(fromDb);
        }
      } catch (err) {
        console.error('Supabase load error:', err);
      }

      if (!rows) {
        // Fallback: load from Excel
        try {
          const res = await fetch('/RENJA-2026-1.xlsx?v=2');
          const buf = await res.arrayBuffer();
          const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
          const parsed = parseRenjaExcel(wb);
          if (parsed.length > 0) {
            rows = parsed;
            // Auto-save to Supabase for next time
            try {
              const dbRows = parsed.map(d => toDb(d));
              await supabase.from('iku_data').insert(dbRows);
            } catch (e) {
              // Supabase not configured yet - ignore
            }
          }
        } catch (err) {
          console.error('Gagal load data:', err);
        }
      }

      if (rows) {
        rows = await ensureGroupRows(rows);
        dispatch({ type: 'SET_DATA', payload: rows });
      }
      setSupabaseLoaded(true);
    }
    loadData();
  }, []);

  return (
    <DashboardContext.Provider value={{ state, dispatch, supabaseLoaded }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}

export { toDb, fromDb };
export type { DashboardAction };
