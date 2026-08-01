import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { LaporanIKU } from '../types';
import { sampleLaporanIKU } from '../utils/sampleLaporanIKU';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'laporan_iku_data';

type LaporanAction =
  | { type: 'SET_ROWS'; payload: LaporanIKU[] }
  | { type: 'UPDATE_ROW'; payload: { id: number; changes: Partial<LaporanIKU> } }
  | { type: 'ADD_ROW'; payload: LaporanIKU }
  | { type: 'DELETE_ROW'; payload: number };

function computePercentages(row: LaporanIKU): LaporanIKU {
  const pct = (realisasi: number | null | undefined, target: number) =>
    realisasi != null && target > 0 ? (realisasi / target) * 100 : 0;
  row.persentaseTW1 = pct(row.realisasiTW1, row.targetTahun);
  row.persentaseTW2 = pct(row.realisasiTW2, row.targetTahun);
  row.persentaseAnggaranTW1 = row.pagu > 0 ? (row.realisasiAnggaranTW1 / row.pagu) * 100 : 0;
  row.persentaseAnggaranTW2 = row.pagu > 0 ? (row.realisasiAnggaranTW2 / row.pagu) * 100 : 0;
  return row;
}

function laporanReducer(state: LaporanIKU[], action: LaporanAction): LaporanIKU[] {
  switch (action.type) {
    case 'SET_ROWS':
      return action.payload;
    case 'UPDATE_ROW':
      return state.map(r => {
        if (r.id !== action.payload.id) return r;
        return computePercentages({ ...r, ...action.payload.changes });
      });
    case 'ADD_ROW':
      return [...state, action.payload];
    case 'DELETE_ROW':
      return state.filter(r => r.id !== action.payload);
    default:
      return state;
  }
}

function laporanToDb(row: Partial<LaporanIKU>) {
  return {
    no: row.no,
    sasaran_strategis: row.sasaranStrategis,
    indikator: row.indikator,
    cara_pengukuran: row.caraPengukuran,
    target_tahun: row.targetTahun,
    realisasi_tw1: row.realisasiTW1 ?? null,
    persentase_tw1: row.persentaseTW1,
    ket_tw1: row.ketTW1,
    realisasi_tw2: row.realisasiTW2 ?? null,
    persentase_tw2: row.persentaseTW2,
    ket_tw2: row.ketTW2,
    program: row.program,
    pagu: row.pagu,
    realisasi_anggaran_tw1: row.realisasiAnggaranTW1,
    persentase_anggaran_tw1: row.persentaseAnggaranTW1,
    realisasi_anggaran_tw2: row.realisasiAnggaranTW2,
    persentase_anggaran_tw2: row.persentaseAnggaranTW2,
    tahun: row.tahun,
  };
}

function laporanFromDb(row: Record<string, unknown>): LaporanIKU {
  return computePercentages({
    id: row.id as number,
    no: (row.no as number) ?? 0,
    sasaranStrategis: (row.sasaran_strategis as string) ?? '',
    indikator: (row.indikator as string) ?? '',
    caraPengukuran: (row.cara_pengukuran as string) ?? '',
    targetTahun: (row.target_tahun as number) ?? 0,
    realisasiTW1: (row.realisasi_tw1 as number) ?? null,
    persentaseTW1: (row.persentase_tw1 as number) ?? 0,
    ketTW1: (row.ket_tw1 as string) ?? '',
    realisasiTW2: (row.realisasi_tw2 as number) ?? null,
    persentaseTW2: (row.persentase_tw2 as number) ?? 0,
    ketTW2: (row.ket_tw2 as string) ?? '',
    program: (row.program as string) ?? '',
    pagu: (row.pagu as number) ?? 0,
    realisasiAnggaranTW1: (row.realisasi_anggaran_tw1 as number) ?? 0,
    persentaseAnggaranTW1: (row.persentase_anggaran_tw1 as number) ?? 0,
    realisasiAnggaranTW2: (row.realisasi_anggaran_tw2 as number) ?? 0,
    persentaseAnggaranTW2: (row.persentase_anggaran_tw2 as number) ?? 0,
    tahun: (row.tahun as number) ?? 2026,
  });
}

function persistLocal(rows: LaporanIKU[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (err) {
    console.error('Laporan localStorage persist error:', err);
  }
}

function loadLocal(): LaporanIKU[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LaporanIKU[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map(r => computePercentages(r));
  } catch (err) {
    console.error('Laporan localStorage load error:', err);
    return null;
  }
}

interface LaporanContextType {
  rows: LaporanIKU[];
  loading: boolean;
  dispatch: React.Dispatch<LaporanAction>;
}

const LaporanContext = createContext<LaporanContextType | null>(null);

export function LaporanProvider({ children }: { children: ReactNode }) {
  const [rows, dispatch] = useReducer(laporanReducer, sampleLaporanIKU);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const local = loadLocal();
      if (local) {
        if (mounted) dispatch({ type: 'SET_ROWS', payload: local });
      }
      try {
        const { data, error } = await supabase
          .from('laporan_iku')
          .select('*')
          .order('no');
        if (!mounted) return;
        if (!error && data && data.length > 0) {
          dispatch({ type: 'SET_ROWS', payload: data.map(d => laporanFromDb(d)) });
        }
      } catch (err) {
        console.error('Laporan Supabase load error:', err);
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    persistLocal(rows);
  }, [rows]);

  return (
    <LaporanContext.Provider value={{ rows, loading, dispatch }}>
      {children}
    </LaporanContext.Provider>
  );
}

export function useLaporan(): LaporanContextType {
  const ctx = useContext(LaporanContext);
  if (!ctx) throw new Error('useLaporan harus dipakai di dalam LaporanProvider');
  return ctx;
}

export { laporanToDb, laporanFromDb };
