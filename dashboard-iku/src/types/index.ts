export interface IKUData {
  id: number;
  program: string;
  programIndikator: string;
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
  level: number;
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

export interface LaporanIKU {
  id: number;
  no: number;
  sasaranStrategis: string;
  indikator: string;
  caraPengukuran: string;
  targetTahun: number;
  realisasiTW1: number | null;
  persentaseTW1: number;
  ketTW1: string;
  realisasiTW2: number | null;
  persentaseTW2: number;
  ketTW2: string;
  realisasiTW3: number | null;
  persentaseTW3: number;
  ketTW3: string;
  realisasiTW4: number | null;
  persentaseTW4: number;
  ketTW4: string;
  program: string;
  pagu: number;
  realisasiAnggaranTW1: number;
  persentaseAnggaranTW1: number;
  realisasiAnggaranTW2: number;
  persentaseAnggaranTW2: number;
  realisasiAnggaranTW3: number;
  persentaseAnggaranTW3: number;
  realisasiAnggaranTW4: number;
  persentaseAnggaranTW4: number;
  tahun: number;
}
