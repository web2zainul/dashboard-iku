export interface IKUData {
  id: number;
  program: string;
  kegiatan: string;
  subKegiatan: string;
  indikator: string;
  satuan: string;
  targetRenstra: number;
  targetTahun: number;
  realisasiTW1: number | null;
  realisasiTW2: number | null;
  realisasiTW3: number | null;
  realisasiTW4: number | null;
  realisasiTahun: number;
  persentase: number;
  targetAnggaran: number;
  realisasiAnggaran: number;
  persentaseAnggaran: number;
  tahun: number;
}

export interface DashboardState {
  data: IKUData[];
  tahun: number;
  triwulan: string;
  searchQuery: string;
  filterKategori: string;
  filterProgram: string;
  filterKegiatan: string;
  filterSubKegiatan: string;
  currentPage: number;
  itemsPerPage: number;
  dataPerDate: string;
  selectedIndicator: IKUData | null;
  showImportModal: boolean;
}

export type KategoriCapaian = 'Sangat Baik' | 'Baik' | 'Kurang';

export interface DistributionItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface KPIResult {
  totalIndikator: number;
  totalTarget: number;
  realisasiKinerja: number;
  rataRataCapaian: number;
  totalAnggaran: number;
  realisasiAnggaran: number;
  persentaseAnggaran: number;
}
