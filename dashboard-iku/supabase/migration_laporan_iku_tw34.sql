-- Migration: tambah kolom Triwulan III & IV di tabel laporan_iku
-- Jalankan di Supabase SQL Editor (setelah migration_laporan_iku.sql)

ALTER TABLE laporan_iku
  ADD COLUMN IF NOT EXISTS realisasi_tw3 NUMERIC,
  ADD COLUMN IF NOT EXISTS persentase_tw3 NUMERIC,
  ADD COLUMN IF NOT EXISTS ket_tw3 TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS realisasi_tw4 NUMERIC,
  ADD COLUMN IF NOT EXISTS persentase_tw4 NUMERIC,
  ADD COLUMN IF NOT EXISTS ket_tw4 TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS realisasi_anggaran_tw3 NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS persentase_anggaran_tw3 NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS realisasi_anggaran_tw4 NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS persentase_anggaran_tw4 NUMERIC DEFAULT 0;

-- Verifikasi: 3 baris seed tetap ada
-- SELECT COUNT(*) FROM laporan_iku;
