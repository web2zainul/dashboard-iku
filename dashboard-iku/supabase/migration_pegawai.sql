-- Migration: create pegawai table (Perjanjian Kinerja)
-- Jalankan di Supabase SQL Editor (satu kali)

CREATE TABLE IF NOT EXISTS pegawai (
  id           BIGSERIAL PRIMARY KEY,
  no           INTEGER DEFAULT 0,
  nama         TEXT NOT NULL DEFAULT '',
  nip          TEXT NOT NULL DEFAULT '',
  jabatan      TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (aman by default)
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;

-- Izinkan anon key untuk read/write (karena app ini single-user)
CREATE POLICY "Allow anon select" ON pegawai FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON pegawai FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON pegawai FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON pegawai FOR DELETE USING (true);

-- Seed 41 pegawai BKPSDM Kota Cirebon (NIP tanpa spasi)
INSERT INTO pegawai (no, nama, nip, jabatan) VALUES
(1,  'SUWARSO BUDI WINARNO', '197501011995031001', 'KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA'),
(2,  'Hj. ERIZA, SE, M.Si', '197210141992032005', 'Sekretaris BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA'),
(3,  'MOH. RISWANTO, SH, MH', '197208162002121006', 'Kepala Bidang Pengembangan Kompetensi ASN'),
(4,  'ENI RUSMINI, S.Sos', '197401131997032001', 'Kepala Bidang Pengadaan, Pemberhentian, Mutasi dan Promosi'),
(5,  'ANDI SUKMANA, SE, Akt, M.Ec.Dev', '197607262006041013', 'Analis SDM Aparatur Ahli Muda'),
(6,  'OLLY INDIRA FEBIANTY, S.Psi', '198002052003122011', 'Kepala Sub Bagian Umum dan Kepegawaian'),
(7,  'ARIS RISMANTO, SE, M.E.', '198310142003121001', 'Kasubbag Program dan Keuangan'),
(8,  'RULY TAUFIK FERDIANSYAH, SE', '197505271999011001', 'Analis SDM Aparatur Ahli Madya'),
(9,  'SLAMET MULYANA, SE, MT', '197205182005011004', 'Penelaah Teknis Kebijakan'),
(10, 'ACHMAD SAFRUDIN, S.Sos', '196909302009011001', 'Kepala UPT Penyelenggaraan Pendidikan, Pelatihan dan Kesejahteraan Pegawai'),
(11, 'NURLEHA, SE', '197101011994032010', 'Kepala Sub Bagian Tata Usaha UPT Penyelenggaraan Pendidikan, Pelatihan dan Kesejahteraan Pegawai'),
(12, 'HELMY BAWONO PUTRO, SH', '198110082009021003', 'Analis SDM Aparatur Ahli Pertama'),
(13, 'DINNUR ISMAIL, S.Kom', '198610032019031001', 'Pranata Komputer Ahli Pertama'),
(14, 'HERYANTO, S.Kom, M.T.', '199204242019031009', 'Analis SDM Aparatur Ahli Pertama'),
(15, 'AHMAD RIYADI SIDIK, S.I. Pust', '199011152020121002', 'Pustakawan Ahli Pertama'),
(16, 'DATOHARI, A.Md', '199009192019031002', 'Arsiparis Terampil'),
(17, 'HATI HARTATI, S.AP', '197501272005012011', 'Analis SDM Aparatur Ahli Muda'),
(18, 'LILY MUKHLISHOH MARDLIYATI, Psi', '197603262006042011', 'Analis SDM Aparatur Ahli Madya'),
(19, 'NINE ISNAENI AGUSTINE, SE', '198608292008122002', 'Penelaah Teknis Kebijakan'),
(20, 'RATNAWATI, S.Psi.', '197901292006042005', 'Analis SDM Aparatur Ahli Pertama'),
(21, 'ROSMALA HERDIASTUTI, SE', '197505192006042013', 'Penelaah Teknis Kebijakan'),
(22, 'NURRUL NURFADHILAH, S.I.Kom', '198612212010012008', 'Analis SDM Aparatur Ahli Pertama'),
(23, 'TATIK KARTIKA, SE', '196902212008012004', 'Penelaah Teknis Kebijakan'),
(24, 'SRI RAHAJENG GUSTI, S.Sos', '197708192010012002', 'Analis SDM Aparatur Ahli Pertama'),
(25, 'CHIRLIE JUNTA SUCI, ST', '198406082011012009', 'Analis SDM Aparatur Ahli Pertama'),
(26, 'SOFFIA WULANDARI, S.Kep, M.A.P', '198109232006042018', 'Pengolah Data dan Informasi'),
(27, 'MEINA MARTINI, SE', '197705032010012006', 'Penelaah Teknis Kebijakan'),
(28, 'MUSTAMAN, SE', '197508132009011003', 'Penelaah Teknis Kebijakan'),
(29, 'RACHDIJANTO, SE', '197109262009011003', 'Penelaah Teknis Kebijakan'),
(30, 'JARNET DEDY SONETHA REANGAN, SE', '198101262010012006', 'Penelaah Teknis Kebijakan'),
(31, 'ADI SUSANTO, SH', '199309042020121007', 'Analis SDM Aparatur Ahli Pertama'),
(32, 'AHMAD MUKOROBIN, S.Kom', '199603142020121001', 'Penelaah Teknis Kebijakan'),
(33, 'NABILAH QISTHI WIBOWO, S.Tr.IP', '199808072021082001', 'Penelaah Teknis Kebijakan'),
(34, 'TULAH', '197708172007011011', 'Pengadministrasi Perkantoran'),
(35, 'ARIPIN', '198005172008011004', 'Pengadministrasi Perkantoran'),
(36, 'FAUZIYYAH HANIF BASUKI, A.Md', '199205122020122011', 'Analis SDM Aparatur Ahli Pertama'),
(37, 'IRMA RAHMAWATI, S.Kom.', '199105152022032002', 'Penelaah Teknis Kebijakan'),
(38, 'CHAIRANI NURUL IZZAH, S.H.', '200102272025042001', 'Penata Kelola Hukum dan Perundang-Undangan'),
(39, 'ARI DWI PRASETIA, A.Md', '199906102025041004', 'Pranata Komputer Terampil'),
(40, 'MOCHAMAD RIFKY SUGANDHI, A.Md.', '199308242025041001', 'Pranata Sumber Daya Manusia Aparatur Terampil'),
(41, 'JEREMY SETIAWAN, A.Md.', '200010062025041001', 'Pranata Sumber Daya Manusia Aparatur Terampil')
ON CONFLICT (id) DO NOTHING;
