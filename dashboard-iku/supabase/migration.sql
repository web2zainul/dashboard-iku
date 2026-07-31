-- Migration: create iku_data table
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS iku_data (
  id              BIGSERIAL PRIMARY KEY,
  program         TEXT NOT NULL DEFAULT '',
  kegiatan        TEXT NOT NULL DEFAULT '',
  sub_kegiatan    TEXT NOT NULL DEFAULT '',
  indikator       TEXT NOT NULL DEFAULT '',
  satuan          TEXT NOT NULL DEFAULT '',
  target_renstra  NUMERIC DEFAULT 0,
  target_tahun    NUMERIC DEFAULT 0,
  realisasi_tw1   NUMERIC,
  realisasi_tw2   NUMERIC,
  realisasi_tw3   NUMERIC,
  realisasi_tw4   NUMERIC,
  target_anggaran NUMERIC DEFAULT 0,
  realisasi_anggaran NUMERIC DEFAULT 0,
  tahun           INTEGER DEFAULT 2026,
  level           INTEGER DEFAULT 3,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional, aman by default)
ALTER TABLE iku_data ENABLE ROW LEVEL SECURITY;

-- Izinkan anon key untuk read/write (karena app ini single-user)
CREATE POLICY "Allow anon select" ON iku_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON iku_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON iku_data FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON iku_data FOR DELETE USING (true);
