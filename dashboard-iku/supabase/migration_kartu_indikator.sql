-- Migration: create kartu_indikator table
-- Jalankan di Supabase SQL Editor (satu kali)

CREATE TABLE IF NOT EXISTS kartu_indikator (
  id           BIGSERIAL PRIMARY KEY,
  no           INTEGER DEFAULT 0,
  nama         TEXT NOT NULL DEFAULT '',
  target       NUMERIC DEFAULT 0,
  realisasi    NUMERIC DEFAULT 0,
  icon         TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (aman by default)
ALTER TABLE kartu_indikator ENABLE ROW LEVEL SECURITY;

-- Izinkan anon key untuk read/write (karena app ini single-user)
CREATE POLICY "Allow anon select" ON kartu_indikator FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON kartu_indikator FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON kartu_indikator FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON kartu_indikator FOR DELETE USING (true);

-- Seed data kartu indikator (data awal dari grafik statis)
INSERT INTO kartu_indikator (no, nama, target, realisasi, icon) VALUES
(1, 'Persentase Perencanaan Kebutuhan ASN yang Sesuai dengan Formasi', 83, 0, 'fa-clipboard-list'),
(2, 'Persentase Pengembangan Karier ASN sesuai Kompetensi', 100, 50, 'fa-person-running'),
(3, 'Persentase ASN yang Ditingkatkan Kompetensinya', 91, 70, 'fa-user-graduate'),
(4, 'Persentase Pegawai dengan SKP Bernilai Baik', 92, 0, 'fa-clipboard-check'),
(5, 'Persentase ASN Mendapatkan Pengembangan Kompetensi Teknis', 14.10, 12, 'fa-book-open'),
(6, 'Persentase Realisasi Pendidikan dan Pelatihan yang Dilaksanakan', 100, 50, 'fa-graduation-cap'),
(7, 'Indeks Kematangan Organisasi', 47.25, 0, 'fa-building-columns')
ON CONFLICT (id) DO NOTHING;
