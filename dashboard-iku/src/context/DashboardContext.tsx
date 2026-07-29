import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { DashboardState, IKUData } from '../types';
import { sampleData } from '../utils/sampleData';

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

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
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
