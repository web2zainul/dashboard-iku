# Tutorial: Menjalankan Migrasi Kolom `level` di Supabase

Tutorial ini menjelaskan cara menjalankan SQL migrasi untuk fitur "data tersendiri per level (Program/Kegiatan/Sub Kegiatan)" pada Dashboard IKU.

## Persiapan

Buka file `supabase/migration_level.sql` di project ini, isinya:

```sql
ALTER TABLE iku_data ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 3;
```

Salin baris SQL tersebut (nanti akan ditempel di Supabase).

## Langkah-langkah

### 1. Login ke Supabase

- Buka browser, masuk ke **https://supabase.com/dashboard**
- Login dengan akun yang dipakai membuat project dashboard-iku

### 2. Pilih Project

- Pilih project dashboard-iku dari daftar project

### 3. Buka SQL Editor

- Di menu kiri, klik **SQL Editor**
- Klik tombol **+ New query** (kanan atas)

### 4. Tempel SQL

- Hapus teks contoh bawaan di editor
- Tempel (Ctrl+V) baris SQL di atas

### 5. Jalankan

- Klik tombol **Run** (kanan bawah)
- Jika berhasil, akan muncul pesan hijau **"Success. No rows returned"**
- Jika muncul "column already exists" — itu aman, berarti migrasi sudah pernah dijalankan

### 6. Selesai

- Setelah sukses, **deploy ulang kode terbaru** (Vercel biasanya auto-deploy saat kode di-push ke GitHub)
- Buka aplikasi dashboard dan **refresh halaman**
- Record Program/Kegiatan/Sub Kegiatan akan dibuat otomatis dari data yang ada

## Verifikasi (opsional)

Untuk memastikan migrasi berhasil:

```sql
SELECT level, COUNT(*) FROM iku_data GROUP BY level;
```

Hasil yang diharapkan:

| level | count |
|-------|-------|
| 0     | (jumlah Program) |
| 1     | (jumlah Kegiatan) |
| 2     | (jumlah Sub Kegiatan) |
| 3     | (jumlah baris detail/indikator) |

## Catatan

- Jika langkah 5 belum dilakukan, aplikasi tetap bisa dibuka, tapi **edit baris Program/Kegiatan/Sub Kegiatan tidak akan tersimpan**.
- Untuk database baru, `supabase/migration.sql` sudah menyertakan kolom `level`, jadi cukup jalankan file tersebut seperti biasa.
