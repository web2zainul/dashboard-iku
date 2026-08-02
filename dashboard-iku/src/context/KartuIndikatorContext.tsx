import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { KartuIndikator, KategoriKartu } from '../types';
import { sampleKartuIndikator } from '../utils/sampleKartuIndikator';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'kartu_indikator_data_v2';

type KartuAction =
  | { type: 'SET_ROWS'; payload: KartuIndikator[] }
  | { type: 'UPDATE_ROW'; payload: { id: number; changes: Partial<KartuIndikator> } };

function kartuReducer(state: KartuIndikator[], action: KartuAction): KartuIndikator[] {
  switch (action.type) {
    case 'SET_ROWS':
      return action.payload;
    case 'UPDATE_ROW':
      return state.map(r => (r.id !== action.payload.id ? r : { ...r, ...action.payload.changes }));
    default:
      return state;
  }
}

function kartuToDb(row: Partial<KartuIndikator>) {
  return {
    no: row.no,
    nama: row.nama,
    target: row.target,
    realisasi: row.realisasi,
    icon: row.icon,
  };
}

function kartuFromDb(row: Record<string, unknown>): KartuIndikator {
  return {
    id: row.id as number,
    no: (row.no as number) ?? 0,
    nama: (row.nama as string) ?? '',
    target: (row.target as number) ?? 0,
    realisasi: (row.realisasi as number) ?? 0,
    icon: (row.icon as string) ?? '',
  };
}

function persistLocal(rows: KartuIndikator[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (err) {
    console.error('Kartu localStorage persist error:', err);
  }
}

function loadLocal(): KartuIndikator[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KartuIndikator[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch (err) {
    console.error('Kartu localStorage load error:', err);
    return null;
  }
}

export function getKartuKategori(realisasi: number, target: number): KategoriKartu {
  if (realisasi >= target) return 'hijau';
  if (realisasi > 0) return 'kuning';
  return 'merah';
}

export const KARTU_KATEGORI_WARNA: Record<KategoriKartu, string> = {
  merah: '#EF4444',
  kuning: '#F59E0B',
  hijau: '#10B981',
};

interface KartuContextType {
  rows: KartuIndikator[];
  loading: boolean;
  dispatch: React.Dispatch<KartuAction>;
}

const KartuContext = createContext<KartuContextType | null>(null);

export function KartuProvider({ children }: { children: ReactNode }) {
  const [rows, dispatch] = useReducer(kartuReducer, sampleKartuIndikator);
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
          .from('kartu_indikator')
          .select('*')
          .order('no');
        if (!mounted) return;
        if (!error && data && data.length > 0) {
          dispatch({ type: 'SET_ROWS', payload: data.map(d => kartuFromDb(d)) });
        }
      } catch (err) {
        console.error('Kartu Supabase load error:', err);
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
    <KartuContext.Provider value={{ rows, loading, dispatch }}>
      {children}
    </KartuContext.Provider>
  );
}

export function useKartu(): KartuContextType {
  const ctx = useContext(KartuContext);
  if (!ctx) throw new Error('useKartu harus dipakai di dalam KartuProvider');
  return ctx;
}

export { kartuToDb, kartuFromDb };
