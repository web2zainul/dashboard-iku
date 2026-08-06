import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { Pegawai } from '../data/pegawaiBkpsdm';
import { pegawaiBkpsdm, normalizeNip } from '../data/pegawaiBkpsdm';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'pegawai_pk_data_v2';

type PegawaiAction =
  | { type: 'SET_ROWS'; payload: Pegawai[] }
  | { type: 'ADD_ROW'; payload: Pegawai }
  | { type: 'UPDATE_ROW'; payload: { id: number; changes: Partial<Pegawai> } }
  | { type: 'DELETE_ROW'; payload: number };

function pegawaiReducer(state: Pegawai[], action: PegawaiAction): Pegawai[] {
  switch (action.type) {
    case 'SET_ROWS':
      return action.payload;
    case 'ADD_ROW':
      return [...state, action.payload];
    case 'UPDATE_ROW':
      return state.map(p => (p.no !== action.payload.id ? p : { ...p, ...action.payload.changes }));
    case 'DELETE_ROW':
      return state.filter(p => p.no !== action.payload);
    default:
      return state;
  }
}

function pegawaiToDb(row: Partial<Pegawai>) {
  return {
    no: row.no,
    nama: row.nama,
    nip: row.nip !== undefined ? normalizeNip(row.nip) : undefined,
    jabatan: row.jabatan,
  };
}

function pegawaiFromDb(row: Record<string, unknown>): Pegawai {
  return {
    no: (row.no as number) ?? 0,
    nama: (row.nama as string) ?? '',
    nip: normalizeNip((row.nip as string) ?? ''),
    jabatan: (row.jabatan as string) ?? '',
  };
}

function persistLocal(rows: Pegawai[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (err) {
    console.error('Pegawai localStorage persist error:', err);
  }
}

function loadLocal(): Pegawai[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Pegawai[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map(p => ({ ...p, nip: normalizeNip(p.nip) }));
  } catch (err) {
    console.error('Pegawai localStorage load error:', err);
    return null;
  }
}

interface PegawaiContextType {
  rows: Pegawai[];
  loading: boolean;
  dispatch: React.Dispatch<PegawaiAction>;
}

const PegawaiContext = createContext<PegawaiContextType | null>(null);

export function PegawaiProvider({ children }: { children: ReactNode }) {
  const [rows, dispatch] = useReducer(pegawaiReducer, pegawaiBkpsdm);
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
          .from('pegawai')
          .select('*')
          .order('no');
        if (!mounted) return;
        if (!error && data && data.length > 0) {
          dispatch({ type: 'SET_ROWS', payload: data.map(d => pegawaiFromDb(d)) });
        }
      } catch (err) {
        console.error('Pegawai Supabase load error:', err);
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
    <PegawaiContext.Provider value={{ rows, loading, dispatch }}>
      {children}
    </PegawaiContext.Provider>
  );
}

export function usePegawai(): PegawaiContextType {
  const ctx = useContext(PegawaiContext);
  if (!ctx) throw new Error('usePegawai harus dipakai di dalam PegawaiProvider');
  return ctx;
}

export { pegawaiToDb, pegawaiFromDb };
