-- Migration: create laporan_iku table
-- Jalankan di Supabase SQL Editor (satu kali)

CREATE TABLE IF NOT EXISTS laporan_iku (
  id                    BIGSERIAL PRIMARY KEY,
  no                    INTEGER DEFAULT 0,
  sasaran_strategis     TEXT NOT NULL DEFAULT '',
  indikator             TEXT NOT NULL DEFAULT '',
  cara_pengukuran       TEXT NOT NULL DEFAULT '',
  target_tahun          NUMERIC DEFAULT 0,
  realisasi_tw1         NUMERIC,
  persentase_tw1        NUMERIC,
  ket_tw1               TEXT NOT NULL DEFAULT '',
  realisasi_tw2         NUMERIC,
  persentase_tw2        NUMERIC,
  ket_tw2               TEXT NOT NULL DEFAULT '',
  program               TEXT NOT NULL DEFAULT '',
  pagu                  NUMERIC DEFAULT 0,
  realisasi_anggaran_tw1 NUMERIC DEFAULT 0,
  persentase_anggaran_tw1 NUMERIC DEFAULT 0,
  realisasi_anggaran_tw2 NUMERIC DEFAULT 0,
  persentase_anggaran_tw2 NUMERIC DEFAULT 0,
  tahun                 INTEGER DEFAULT 2026,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (aman by default)
ALTER TABLE laporan_iku ENABLE ROW LEVEL SECURITY;

-- Izinkan anon key untuk read/write (karena app ini single-user)
CREATE POLICY "Allow anon select" ON laporan_iku FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON laporan_iku FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON laporan_iku FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON laporan_iku FOR DELETE USING (true);

-- Seed data dari Formulir Pengukuran Kinerja BKPSDM Kota Cirebon TW I & TW II 2026
INSERT INTO laporan_iku (
  no, sasaran_strategis, indikator, cara_pengukuran, target_tahun,
  realisasi_tw1, persentase_tw1, ket_tw1,
  realisasi_tw2, persentase_tw2, ket_tw2,
  program, pagu,
  realisasi_anggaran_tw1, persentase_anggaran_tw1,
  realisasi_anggaran_tw2, persentase_anggaran_tw2,
  tahun
) VALUES
(
  1,
  'Meningkatnya kinerja, kompetensi dan disiplin ASN',
  'Persentase capaian kinerja, kompetensi, dan disiplin ASN',
  'Persentase kinerja ditambah persentase kompetensi ditambah persentase disiplin dibagi 3',
  16.46,
  NULL, 0,
  'Kinerja: Perhitungan dilakukan pada akhir tahun. Kompetensi: Belum dilakukan pemetaan kompetensi di Triwulan I 2026 karena tidak ada anggaran. Disiplin: di Triwulan I tidak ada ASN yang melanggar disiplin',
  0.59, 3.57,
  'Kinerja: Perhitungan dilakukan pada akhir tahun. Kompetensi: Pada Triwulan II, ada 126 pegawai yang terdiri dari jabatan fungsional guru, kesehatan, dan teknis yang mengikuti Uji Kompetensi. Disiplin: Pada Triwulan II ada 1 orang yang melanggar disiplin, hukdis tingkat berat (Pemberhentian dengan hormat tidak atas permintaan sendiri sebagai PNS)',
  'Program Kepegawaian Daerah',
  364134300,
  17244445, 4.74,
  210426590, 57.79,
  2026
),
(
  2,
  'Meningkatnya Kualitas Tata Kelola dan Dukungan Administratif Dalam Penyelenggaraan Pemerintahan Daerah',
  'Nilai SAKIP Perangkat Daerah',
  'Nilai LHE AKIP yang dikeluarkan Inspektorat Daerah',
  80.02,
  NULL, 0,
  'Belum dilakukan evaluasi AKIP',
  NULL, 0,
  'Proses evaluasi AKIP masih berjalan',
  'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
  7263549243,
  1849143365, 25.46,
  3486879210, 48.01,
  2026
),
(
  3,
  'Meningkatnya Kualifikasi dan Kompetensi ASN',
  'Indeks Profesionalisme ASN Dimensi Kompetensi',
  'Persentase ASN yang melanjutkan jenjang pendidikan formal ditambah Persentase ASN yang telah mengikuti pelatihan dibagi 2',
  10.83,
  6.12, 56.53,
  'Pendidikan: Jumlah Pegawai dengan Pendidikan S2/S3 sebanyak 524 orang dibagi jumlah pegawai dengan Pendidikan S1 sebanyak 4.395 orang. Pelatihan: Nilai rata-rata pelatihan (Kepemimpinan = 0/195, Teknis = 63/7.221, dan Fungsional = 3/3.212)',
  6.20, 57.28,
  'Pendidikan: Jumlah Pegawai dengan Pendidikan S2/S3 sebanyak 527 orang dibagi jumlah pegawai dengan Pendidikan S1 sebanyak 4.395 orang. Pelatihan: Nilai rata-rata pelatihan (Kepemimpinan = 0/195, Teknis = 74/7.195, dan Fungsional = 7/3.212)',
  'Program Pengembangan Sumber Daya Manusia',
  18499835,
  0, 0,
  0, 0,
  2026
)
ON CONFLICT (id) DO NOTHING;
