# Tutorial: Tab Capaian IKU & Deploy Vercel Baru

Tutorial ini menjelaskan:

1. Cara menggunakan **Tab Capaian IKU** (tabel Formulir Pengukuran Kinerja + grafik Target vs Realisasi)
2. Cara menjalankan **migrasi tabel `capaian_iku`** di Supabase
3. Cara membuat **project Vercel baru** dan mendeploy aplikasi

---

## Bagian 1 — Menggunakan Tab Capaian IKU

### 1.1 Pindah ke tab Capaian IKU

- Buka aplikasi dashboard
- Di bawah header, ada navigasi tab: **Dashboard** | **Capaian IKU**
- Klik **Capaian IKU** untuk membuka halaman baru yang berisi:
  - **Grafik** Target vs Realisasi per indikator
  - **Tabel** Formulir Pengukuran Kinerja (Capaian IKU) Tahun 2026

### 1.2 Struktur tabel

Tabel mengikuti format Formulir Pengukuran Kinerja, dengan kolom:

| Kolom | Keterangan |
|-------|------------|
| No | Nomor urut |
| Sasaran Strategis | Sasaran strategis perangkat daerah |
| Indikator | Nama indikator kinerja |
| Cara Pengukuran Indikator Sasaran | Rumus/cara menghitung indikator |
| Target Tahun 2026 | Target kinerja tahunan (persen) |
| Triwulan I–IV | Masing-masing berisi **Realisasi**, **%** (otomatis), dan **Ket** (keterangan) |
| Program | Program terkait |
| Jumlah Realisasi Anggaran | Berisi **Pagu**, **Realisasi**, dan **%** (otomatis) |

> Kolom **%** dihitung otomatis oleh sistem: `% = realisasi ÷ target × 100`. Anda tidak perlu mengisinya manual.

### 1.3 Mengedit isi tabel

Semua isi tabel bisa diedit:

1. Klik ikon **pensil** (kuning) pada baris yang ingin diubah
2. Baris berubah menjadi kolom input berwarna biru — ubah sel mana saja:
   - Teks (sasaran strategis, indikator, cara pengukuran, ket, program) → ketik langsung
   - Angka (no, target, realisasi, pagu, realisasi anggaran) → isi angka; kolom realisasi boleh dikosongkan (dianggap belum dilaksanakan, tampil `-`)
3. Klik ikon **centang** (hijau) untuk menyimpan, atau **X** (merah) untuk membatalkan
4. Perubahan langsung tersimpan ke database dan grafik di atasnya ikut berubah

### 1.4 Menambah dan menghapus baris

- **Tambah baris**: klik tombol hijau **"+ Tambah Baris"** di kanan atas tabel, lalu isi baris baru yang muncul
- **Hapus baris**: klik ikon **tempat sampah** (merah) pada baris, konfirmasi dengan OK

### 1.5 Grafik Target vs Realisasi

- Grafik batang menampilkan **Target** (abu-abu) vs **Realisasi** (biru tua) per indikator
- Nama indikator tampil **di bawah grafik** (sumbu X)
- Pilih periode dengan tombol **TW I / TW II / TW III / TW IV / Total** di kanan atas grafik
- Grafik **statis** (tanpa tooltip/animasi) dan datanya otomatis mengikuti isi tabel

### 1.6 Penyimpanan data

- Data disimpan di tabel **`capaian_iku`** (Supabase)
- Jika Supabase belum dikonfigurasi/dijalankan migrasinya, data otomatis tersimpan di **localStorage browser** (tetap bisa diedit, tapi hanya tersimpan di perangkat Anda)
- Data contoh awal (3 indikator dari Laporan TW I & TW II) otomatis terisi saat pertama kali dibuka

---

## Bagian 2 — Migrasi Tabel `capaian_iku` di Supabase

> Supaya data Capaian IKU tersimpan di database (bukan hanya localStorage), jalankan migrasi ini satu kali.

### 2.1 Buka isi file migrasi

Buka file `supabase/migration_capaian.sql` di project ini — isinya perintah `CREATE TABLE capaian_iku ...` lengkap dengan kebijakan akses (RLS).

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
- Salin seluruh isi `supabase/migration_capaian.sql` dan tempel (Ctrl+V)
- Klik tombol **Run** (kanan bawah)
- Jika berhasil muncul pesan hijau **"Success. No rows returned"** — tabel `capaian_iku` sudah dibuat

### 2.6 Verifikasi (opsional)

Jalankan query berikut di SQL Editor:

```sql
SELECT COUNT(*) AS jumlah_baris FROM capaian_iku;
```

Hasil `0` berarti tabel sudah siap; baris akan bertambah saat Anda menyimpan edit dari aplikasi.

> Catatan: jika muncul "table already exists", itu aman — berarti migrasi sudah pernah dijalankan sebelumnya.

---

## Bagian 3 — Membuat Project Vercel Baru & Deploy

> Bagian ini untuk mendeploy kode branch `tab-iku` ke project Vercel baru (terpisah dari project lama).

### 3.1 Prasyarat

- Sudah terpasang **Vercel CLI** (cek dengan `vercel --version`)
- Sudah login: jalankan `vercel whoami` — pastikan menampilkan nama akun Anda

### 3.2 Deploy

Buka terminal di folder project aplikasi:

```powershell
cd C:\renja\dashboard-iku\dashboard-iku
vercel deploy --yes --name dashboard-iku-tab-iku
```

- `--yes` : menerima semua prompt default (tanpa tanya-tanya)
- `--name dashboard-iku-tab-iku` : membuat **project Vercel baru** dengan nama tersebut
- Vite terdeteksi otomatis sebagai framework; `vercel.json` sudah mengatur output ke folder `dist`

Setelah selesai, CLI menampilkan URL, contoh:

```
https://dashboard-iku-tab-iku-xxxx.vercel.app
```

Buka URL tersebut untuk melihat aplikasi.

### 3.3 (Opsional) Set environment variable Supabase

Jika ingin data tersimpan ke Supabase di production, tambahkan env vars lalu redeploy:

```powershell
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Kemudian deploy ulang:

```powershell
vercel --prod
```

### 3.4 Mengupdate aplikasi setelah ada perubahan kode

```powershell
vercel --prod
```

Perintah ini mendeploy ulang versi terbaru dari folder lokal ke project Vercel yang sudah dibuat.

---

## Bagian 4 — Setting Environment Variable Supabase di Vercel

> Bagian ini menjelaskan cara memasang kredensial Supabase (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`) ke project Vercel, supaya data tersimpan di database — bukan hanya localStorage browser.

### 4.1 Ambil kredensial dari Supabase Dashboard

1. Buka browser, masuk ke **https://supabase.com/dashboard**
2. Pilih project dashboard-iku dari daftar project
3. Di menu kiri, klik **Project Settings** (ikon gerigi)
4. Klik menu **API** (di bawah judul *Configuration*)
5. Salin dua nilai berikut:
   - **Project URL** → ini nilai untuk `VITE_SUPABASE_URL`, contoh: `https://xxxxxxxx.supabase.co`
   - **anon public** key (bukan `service_role`!) → ini nilai untuk `VITE_SUPABASE_ANON_KEY`, contoh: `eyJhbGciOiJIUzI1NiIs...`

> Peringatan: jangan pernah menyalin key `service_role` ke aplikasi web — key itu bersifat rahasia dan bisa mengubah semua data tanpa batasan keamanan.

### 4.2 Tambahkan environment variable di Vercel via CLI

Buka terminal di folder project aplikasi:

```powershell
cd C:\renja\dashboard-iku\dashboard-iku
```

Tambahkan variabel pertama:

```powershell
vercel env add VITE_SUPABASE_URL
```

- CLI akan bertanya `For what environments?` — pilih **Production** (tekan spasi untuk memilih, lalu Enter)
- Tempel (Ctrl+V) nilai **Project URL** dari langkah 4.1, lalu Enter

Tambahkan variabel kedua:

```powershell
vercel env add VITE_SUPABASE_ANON_KEY
```

- Pilih environment yang sama (**Production**)
- Tempel nilai **anon public** key, lalu Enter

> Tips: pilih juga **Preview** dan **Development** pada langkah pemilihan environment agar deployment preview dan lokal juga menggunakan Supabase. Untuk Production saja juga cukup.

### 4.3 Redeploy dengan env baru

```powershell
vercel --prod
```

Vercel akan build ulang aplikasi dengan environment variable yang sudah terpasang, lalu menampilkan URL production:

```
https://dashboard-iku-tab-iku.vercel.app
```

### 4.4 Verifikasi

1. Buka **https://dashboard-iku-tab-iku.vercel.app**
2. Klik tab **Capaian IKU**
3. Edit salah satu sel (klik pensil → ubah → centang simpan)
4. Cek di Supabase:
   - **Table Editor → capaian_iku** — baris yang diedit berubah; atau
   - **SQL Editor**, jalankan: `SELECT COUNT(*) FROM capaian_iku;` — jumlah baris bertambah/tidak 0

### 4.5 (Opsional) Env untuk pengembangan lokal

Agar `npm run dev` di komputer juga memakai Supabase, buat file `.env` di folder `dashboard-iku/`:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> File `.env` **tidak akan di-commit** ke GitHub (sudah masuk `.gitignore`). Jangan pernah mengekspos anon key di dokumen publik — anon key aman dipakai di aplikasi web, tapi tetap jaga dari penyalahgunaan dengan mengaktifkan RLS (sudah diaktifkan oleh migrasi).

### 4.6 Catatan

- Tanpa env vars ini, aplikasi tetap berjalan normal, tetapi data hanya tersimpan di **localStorage browser** masing-masing pengguna
- Jika data di halaman tidak berubah setelah setting env, lakukan **hard refresh** (Ctrl+Shift+R) untuk memuat ulang JavaScript terbaru
- Untuk melihat status environment variable: `vercel env ls`

---

## Ringkasan Alur Baru

| Langkah | Aksi |
|---------|------|
| 1 | Push kode ke branch `tab-iku` di GitHub |
| 2 | Jalankan `supabase/migration_capaian.sql` di Supabase SQL Editor |
| 3 | `vercel deploy --yes --name dashboard-iku-tab-iku` |
| 4 | `vercel env add VITE_SUPABASE_URL` dan `vercel env add VITE_SUPABASE_ANON_KEY` |
| 5 | `vercel --prod` untuk redeploy dengan env baru |
| 6 | Buka URL yang dihasilkan, isi/edit data di tab **Capaian IKU** |
