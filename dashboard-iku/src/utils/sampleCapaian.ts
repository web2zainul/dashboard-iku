import type { CapaianIKU } from '../types';

const TW = 2026;

function row(r: Omit<CapaianIKU, 'persentaseTW1' | 'persentaseTW2' | 'persentaseTW3' | 'persentaseTW4' | 'persentaseAnggaran' | 'id'>): CapaianIKU {
  return {
    id: 0,
    persentaseTW1: 0,
    persentaseTW2: 0,
    persentaseTW3: 0,
    persentaseTW4: 0,
    persentaseAnggaran: 0,
    ...r,
  };
}

export const sampleCapaian: CapaianIKU[] = [
  row({
    no: 1,
    sasaranStrategis: 'Meningkatnya kinerja, kompetensi dan disiplin ASN',
    indikator: 'Persentase capaian kinerja, kompetensi, dan disiplin ASN',
    caraPengukuran:
      'Persentase kinerja ditambah persentase kompetensi ditambah persentase disiplin dibagi 3',
    targetTahun: 16.46,
    realisasiTW1: null,
    ketTW1:
      'Kinerja: Perhitungan dilakukan pada akhir tahun. Kompetensi: Belum dilakukan pemetaan kompetensi di Triwulan I 2026 karena tidak ada anggaran. Disiplin: di Triwulan I tidak ada ASN yang melanggar disiplin',
    realisasiTW2: 0.59,
    ketTW2:
      'Kinerja: Perhitungan dilakukan pada akhir tahun. Kompetensi: Pada Triwulan II, ada 126 pegawai yang terdiri dari jabatan fungsional guru, kesehatan, dan teknis yang mengikuti Uji Kompetensi. Disiplin: Pada Triwulan II ada 1 orang yang melanggar disiplin, hukdis tingkat berat (Pemberhentian dengan hormat tidak atas permintaan sendiri sebagai PNS)',
    realisasiTW3: null,
    ketTW3: '',
    realisasiTW4: null,
    ketTW4: '',
    program: 'Program Kepegawaian Daerah',
    pagu: 364134300,
    realisasiAnggaran: 210426590,
    tahun: TW,
  }),
  row({
    no: 2,
    sasaranStrategis:
      'Meningkatnya Kualitas Tata Kelola dan Dukungan Administratif Dalam Penyelenggaraan Pemerintahan Daerah',
    indikator: 'Nilai SAKIP Perangkat Daerah',
    caraPengukuran: 'Nilai LHE AKIP yang dikeluarkan Inspektorat Daerah',
    targetTahun: 80.02,
    realisasiTW1: null,
    ketTW1: 'Belum dilakukan evaluasi AKIP',
    realisasiTW2: null,
    ketTW2: 'Proses evaluasi AKIP masih berjalan',
    realisasiTW3: null,
    ketTW3: '',
    realisasiTW4: null,
    ketTW4: '',
    program: 'Program Penunjang Urusan Pemerintah Daerah Kabupaten/Kota',
    pagu: 7263549243,
    realisasiAnggaran: 3486879210,
    tahun: TW,
  }),
  row({
    no: 3,
    sasaranStrategis: 'Meningkatnya Kualifikasi dan Kompetensi ASN',
    indikator: 'Indeks Profesionalisme ASN Dimensi Kompetensi',
    caraPengukuran:
      'Persentase ASN yang melanjutkan jenjang pendidikan formal ditambah Persentase ASN yang telah mengikuti pelatihan dibagi 2',
    targetTahun: 10.83,
    realisasiTW1: 6.12,
    ketTW1:
      'Pendidikan: Jumlah Pegawai dengan Pendidikan S2/S3 sebanyak 524 orang dibagi jumlah pegawai dengan Pendidikan S1 sebanyak 4.395 orang. Pelatihan: Nilai rata-rata pelatihan (Kepemimpinan = 0/195, Teknis = 63/7.221, dan Fungsional = 3/3212)',
    realisasiTW2: 6.2,
    ketTW2:
      'Pendidikan: Jumlah Pegawai dengan Pendidikan S2/S3 sebanyak 527 orang dibagi jumlah pegawai dengan Pendidikan S1 sebanyak 4.395 orang. Pelatihan: Nilai rata-rata pelatihan (Kepemimpinan = 0/195, Teknis = 74/7.195, dan Fungsional = 7/3212)',
    realisasiTW3: null,
    ketTW3: '',
    realisasiTW4: null,
    ketTW4: '',
    program: 'Program Pengembangan Sumber Daya Manusia',
    pagu: 18499835,
    realisasiAnggaran: 0,
    tahun: TW,
  }),
];
