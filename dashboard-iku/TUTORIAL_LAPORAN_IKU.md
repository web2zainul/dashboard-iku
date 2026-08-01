# Tutorial: Tab Laporan IKU (Formulir Pengukuran Kinerja TW I & TW II)

Tutorial ini menjelaskan:

1. Cara menggunakan **Tab Laporan IKU** (satu tabel Formulir Pengukuran Kinerja TW I & TW II)
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
| Triwulan I & Triwulan II | Masing-masing berisi **Realisasi**, **%** (otomatis), dan **Ket** (keterangan) |
| Program | Program terkait |
| Pagu | Jumlah pagu anggaran |
| Realisasi TW I / % TW I | Realisasi anggaran Triwulan I dan persentasenya (otomatis) |
| Realisasi TW II / % TW II | Realisasi anggaran Triwulan II dan persentasenya (otomatis) |

> Kolom **%** dihitung otomatis: `% realisasi = realisasi ÷ target × 100` dan `% anggaran = realisasi anggaran ÷ pagu × 100`. Tidak perlu diisi manual.

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

> Jalankan sekali agar data tersimpan di database (bukan hanya localStorage).

### 2.1 Buka isi file migrasi

Buka file `supabase/migration_laporan_iku.sql` di project ini — isinya perintah `CREATE TABLE laporan_iku ...`, kebijakan akses (RLS), dan **seed 3 baris data** Laporan TW I & TW II.

### 2.2 Login ke Supabase

- Buka browser, masuk ke **https://supabase.com/dashboard**
- Login dengan akun yang dipakai membuat project dashboard-iku

### 2.3 Pilih project

- Pilih project dashboard-iku dari daftar project

### 2.4 Buka SQL Editor

- Di menu kiri, klik **SQL Editor**
- Klik tombol **+ New query** (kanan atas)

### 2.5 Tempel & jalankan SQL

- Hapus teks contoh bawaan editor
- Salin seluruh isi `supabase/migration_laporan_iku.sql` dan tempel (Ctrl+V)
- Klik tombol **Run** (kanan bawah)
- Jika berhasil muncul hijau **"Success. No rows returned"** — tabel `laporan_iku` sudah dibuat dan terisi 3 baris

### 2.6 Verifikasi (opsional)

Jalankan query berikut di SQL Editor:

```sql
SELECT COUNT(*) AS jumlah_baris FROM laporan_iku;
```

Hasil `3` berarti seed berhasil (3 sasaran). Hasil `0` berarti tabel kosong — isi/edit dari aplikasi akan menambah baris.

> Catatan: jika muncul "table already exists", itu aman — berarti migrasi sudah pernah dijalankan sebelumnya.
