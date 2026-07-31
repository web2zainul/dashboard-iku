-- Migration: create capaian_iku table
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS capaian_iku (
  id              BIGSERIAL PRIMARY KEY,
  no              INTEGER DEFAULT 0,
  sasaran_strategis TEXT NOT NULL DEFAULT '',
  indikator       TEXT NOT NULL DEFAULT '',
  cara_pengukuran TEXT NOT NULL DEFAULT '',
  target_tahun    NUMERIC DEFAULT 0,
  realisasi_tw1   NUMERIC,
  persentase_tw1  NUMERIC,
  ket_tw1         TEXT NOT NULL DEFAULT '',
  realisasi_tw2   NUMERIC,
  persentase_tw2  NUMERIC,
  ket_tw2         TEXT NOT NULL DEFAULT '',
  realisasi_tw3   NUMERIC,
  persentase_tw3  NUMERIC,
  ket_tw3         TEXT NOT NULL DEFAULT '',
  realisasi_tw4   NUMERIC,
  persentase_tw4  NUMERIC,
  ket_tw4         TEXT NOT NULL DEFAULT '',
  program         TEXT NOT NULL DEFAULT '',
  pagu            NUMERIC DEFAULT 0,
  realisasi_anggaran NUMERIC DEFAULT 0,
  persentase_anggaran NUMERIC DEFAULT 0,
  tahun           INTEGER DEFAULT 2026,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (aman by default)
ALTER TABLE capaian_iku ENABLE ROW LEVEL SECURITY;

-- Izinkan anon key untuk read/write (karena app ini single-user)
CREATE POLICY "Allow anon select" ON capaian_iku FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON capaian_iku FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON capaian_iku FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON capaian_iku FOR DELETE USING (true);
