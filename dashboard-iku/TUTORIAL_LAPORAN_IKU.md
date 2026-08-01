# Tutorial: Tab Laporan IKU (Formulir Pengukuran Kinerja TW I s.d. TW IV)

Tutorial ini menjelaskan:

1. Cara menggunakan **Tab Laporan IKU** (satu tabel Formulir Pengukuran Kinerja TW I–IV)
2. Cara menjalankan **migrasi tabel `laporan_iku`** di Supabase

---

## Bagian 1 — Menggunakan Tab Laporan IKU

### 1.1 Pindah ke tab Laporan IKU

- Buka aplikasi dashboard
- Di bawah header, ada navigasi tab: **Dashboard** | **Laporan IKU**
- Klik **Laporan IKU** untuk membuka halaman yang berisi **hanya satu tabel** Formulir Pengukuran Kinerja Tahun 2026

### 1.2 Struktur tabel

Tabel mengikuti format Formulir Pengukuran Kinerja BKPSDM, dengan kolom:

| Kolom | Keterangan |
|-------|------------|
| No | Nomor urut |
| Sasaran Strategis | Sasaran strategis perangkat daerah |
| Indikator | Nama indikator kinerja |
| Cara Pengukuran Indikator Sasaran | Rumus/cara menghitung indikator |
| Target Tahun 2026 | Target kinerja tahunan (persen) |
| Triwulan I s.d. IV | Masing-masing berisi **Realisasi**, **%** (otomatis), dan **Ket** (keterangan) |
| Program | Program terkait |
| Pagu | Jumlah pagu anggaran |
| Jumlah Realisasi Anggaran | Per triwulan: **Realisasi (RP)** dan **%** (otomatis) |

> Kolom **%** dihitung otomatis: `% realisasi = realisasi ÷ target × 100` dan `% anggaran = realisasi anggaran ÷ pagu × 100`. Tidak perlu diisi manual.

> Tabel lebar → geser ke kanan (scroll horizontal) untuk melihat kolom Triwulan III/IV dan kolom anggaran.

### 1.3 Mengedit isi tabel

Semua isi tabel bisa diedit:

1. Klik ikon **pensil** (kuning) pada baris yang ingin diubah
2. Baris berubah menjadi kolom input — ubah sel mana saja (teks atau angka; realisasi boleh dikosongkan → tampil `-`)
3. Klik ikon **centang** (hijau) untuk menyimpan, atau **X** (merah) untuk membatalkan
4. Perubahan langsung tersimpan ke database

### 1.4 Menambah dan menghapus baris

- **Tambah baris**: klik tombol hijau **"+ Tambah Baris"** di kanan atas tabel
- **Hapus baris**: klik ikon **tempat sampah** (merah) pada baris, konfirmasi dengan OK

### 1.5 Penyimpanan data

- Data disimpan di tabel **`laporan_iku`** (Supabase)
- Jika Supabase belum dikonfigurasi/migrasi belum dijalankan, data otomatis tersimpan di **localStorage browser** (tetap bisa diedit, hanya tersimpan di perangkat Anda)
- Data awal (3 sasaran dari Laporan TW I & TW II 2026) otomatis terisi

---

## Bagian 2 — Migrasi Tabel `laporan_iku` di Supabase

> Jalankan migrasi berikut agar data tersimpan di database (bukan hanya localStorage). Jalankan **dua kali** (dua file berbeda).

### 2.1 Migration pertama: `migration_laporan_iku.sql`

Buka file `supabase/migration_laporan_iku.sql` — isinya `CREATE TABLE laporan_iku ...`, kebijakan akses (RLS), dan **seed 3 baris data** Laporan TW I & TW II.

1. Buka browser, masuk ke **https://supabase.com/dashboard**
2. Pilih project dashboard-iku
3. Menu kiri → **SQL Editor** → **+ New query**
4. Salin seluruh isi `migration_laporan_iku.sql` → tempel → klik **Run**
5. Berhasil jika muncul hijau **"Success. No rows returned"**

### 2.2 Migration kedua: `migration_laporan_iku_tw34.sql`

Buka file `supabase/migration_laporan_iku_tw34.sql` — isinya perintah menambahkan kolom Triwulan III & IV.

1. **SQL Editor** → **+ New query** (baru)
2. Salin seluruh isi `migration_laporan_iku_tw34.sql` → tempel → klik **Run**
3. Berhasil jika muncul hijau **"Success. No rows returned"**

### 2.3 Verifikasi (opsional)

Jalankan query berikut di SQL Editor:

```sql
SELECT COUNT(*) AS jumlah_baris FROM laporan_iku;
```

Hasil `3` berarti seed berhasil (3 sasaran). Hasil `0` berarti tabel kosong — isi/edit dari aplikasi akan menambah baris.

> Catatan: jika muncul "table already exists" / "column already exists", itu aman — berarti migrasi sudah pernah dijalankan sebelumnya.
