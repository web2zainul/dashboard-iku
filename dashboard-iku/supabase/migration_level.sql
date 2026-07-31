-- Migration: add level column to iku_data
-- Jalankan di Supabase SQL Editor (sekali saja)
-- level: 0 = Program, 1 = Kegiatan, 2 = Sub Kegiatan, 3 = Detail (baris indikator)

ALTER TABLE iku_data ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 3;
