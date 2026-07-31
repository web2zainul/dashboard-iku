import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { CapaianIKU } from '../types';
import { sampleCapaian } from '../utils/sampleCapaian';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'capaian_iku_data';

type CapaianAction =
  | { type: 'SET_ROWS'; payload: CapaianIKU[] }
  | { type: 'UPDATE_ROW'; payload: { id: number; changes: Partial<CapaianIKU> } }
  | { type: 'ADD_ROW'; payload: CapaianIKU }
  | { type: 'DELETE_ROW'; payload: number };

function computePercentages(row: CapaianIKU): CapaianIKU {
  const pct = (realisasi: number | null | undefined, target: number) =>
    realisasi != null && target > 0 ? (realisasi / target) * 100 : 0;
  row.persentaseTW1 = pct(row.realisasiTW1, row.targetTahun);
  row.persentaseTW2 = pct(row.realisasiTW2, row.targetTahun);
  row.persentaseTW3 = pct(row.realisasiTW3, row.targetTahun);
  row.persentaseTW4 = pct(row.realisasiTW4, row.targetTahun);
  row.persentaseAnggaran = row.pagu > 0 ? (row.realisasiAnggaran / row.pagu) * 100 : 0;
  return row;
}

function capaianReducer(state: CapaianIKU[], action: CapaianAction): CapaianIKU[] {
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

function toDb(row: Partial<CapaianIKU>) {
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
    realisasi_tw3: row.realisasiTW3 ?? null,
    persentase_tw3: row.persentaseTW3,
    ket_tw3: row.ketTW3,
    realisasi_tw4: row.realisasiTW4 ?? null,
    persentase_tw4: row.persentaseTW4,
    ket_tw4: row.ketTW4,
    program: row.program,
    pagu: row.pagu,
    realisasi_anggaran: row.realisasiAnggaran,
    persentase_anggaran: row.persentaseAnggaran,
    tahun: row.tahun,
  };
}

function fromDb(row: Record<string, unknown>): CapaianIKU {
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
    realisasiTW3: (row.realisasi_tw3 as number) ?? null,
    persentaseTW3: (row.persentase_tw3 as number) ?? 0,
    ketTW3: (row.ket_tw3 as string) ?? '',
    realisasiTW4: (row.realisasi_tw4 as number) ?? null,
    persentaseTW4: (row.persentase_tw4 as number) ?? 0,
    ketTW4: (row.ket_tw4 as string) ?? '',
    program: (row.program as string) ?? '',
    pagu: (row.pagu as number) ?? 0,
    realisasiAnggaran: (row.realisasi_anggaran as number) ?? 0,
    persentaseAnggaran: (row.persentase_anggaran as number) ?? 0,
    tahun: (row.tahun as number) ?? 2026,
  });
}

function persistLocal(rows: CapaianIKU[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (err) {
    console.error('Capaian localStorage persist error:', err);
  }
}

function loadLocal(): CapaianIKU[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CapaianIKU[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map(r => computePercentages(r));
  } catch (err) {
    console.error('Capaian localStorage load error:', err);
    return null;
  }
}

interface CapaianContextType {
  rows: CapaianIKU[];
  loading: boolean;
  dispatch: React.Dispatch<CapaianAction>;
}

const CapaianContext = createContext<CapaianContextType | undefined>(undefined);

export function CapaianProvider({ children }: { children: ReactNode }) {
  const [rows, dispatch] = useReducer(capaianReducer, []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      let loaded: CapaianIKU[] | null = null;

      try {
        const { data, error } = await supabase
          .from('capaian_iku')
          .select('*')
          .order('id');
        if (error) throw error;
        if (data && data.length > 0) {
          loaded = data.map(fromDb);
        }
      } catch (err) {
        console.error('Capaian Supabase load error:', err);
      }

      if (!loaded) {
        loaded = loadLocal();
      }

      if (!loaded) {
        loaded = sampleCapaian.map((r, i) => ({ ...r, id: -(i + 1) }));
        persistLocal(loaded);
      }

      dispatch({ type: 'SET_ROWS', payload: loaded });
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) persistLocal(rows);
  }, [rows, loading]);

  return (
    <CapaianContext.Provider value={{ rows, loading, dispatch }}>
      {children}
    </CapaianContext.Provider>
  );
}

export function useCapaian() {
  const context = useContext(CapaianContext);
  if (!context) {
    throw new Error('useCapaian must be used within CapaianProvider');
  }
  return context;
}

export { toDb as capaianToDb, fromDb as capaianFromDb };
export type { CapaianAction };
