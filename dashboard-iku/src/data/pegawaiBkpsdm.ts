export interface Pegawai {
  no: number;
  nama: string;
  jabatan: string;
  nip: string;
}

export const normalizeNip = (nip: string): string => nip.replace(/\s+/g, '').trim();

// Data bersih dari "DATA PEGAWAI LALALA NIP.xlsx" (Sheet 1) — 41 pegawai BKPSDM Kota Cirebon
export const pegawaiBkpsdm: Pegawai[] = [
  { no: 1, nama: 'SUWARSO BUDI WINARNO', jabatan: 'KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA', nip: '197501011995031001' },
  { no: 2, nama: 'Hj. ERIZA, SE, M.Si', jabatan: 'Sekretaris BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA', nip: '197210141992032005' },
  { no: 3, nama: 'MOH. RISWANTO, SH, MH', jabatan: 'Kepala Bidang Pengembangan Kompetensi ASN', nip: '197208162002121006' },
  { no: 4, nama: 'ENI RUSMINI, S.Sos', jabatan: 'Kepala Bidang Pengadaan, Pemberhentian, Mutasi dan Promosi', nip: '197401131997032001' },
  { no: 5, nama: 'ANDI SUKMANA, SE, Akt, M.Ec.Dev', jabatan: 'Analis SDM Aparatur Ahli Muda', nip: '197607262006041013' },
  { no: 6, nama: 'OLLY INDIRA FEBIANTY, S.Psi', jabatan: 'Kepala Sub Bagian Umum dan Kepegawaian', nip: '198002052003122011' },
  { no: 7, nama: 'ARIS RISMANTO, SE, M.E.', jabatan: 'Kasubbag Program dan Keuangan', nip: '198310142003121001' },
  { no: 8, nama: 'RULY TAUFIK FERDIANSYAH, SE', jabatan: 'Analis SDM Aparatur Ahli Madya', nip: '197505271999011001' },
  { no: 9, nama: 'SLAMET MULYANA, SE, MT', jabatan: 'Penelaah Teknis Kebijakan', nip: '197205182005011004' },
  { no: 10, nama: 'ACHMAD SAFRUDIN, S.Sos', jabatan: 'Kepala UPT Penyelenggaraan Pendidikan, Pelatihan dan Kesejahteraan Pegawai', nip: '196909302009011001' },
  { no: 11, nama: 'NURLEHA, SE', jabatan: 'Kepala Sub Bagian Tata Usaha UPT Penyelenggaraan Pendidikan, Pelatihan dan Kesejahteraan Pegawai', nip: '197101011994032010' },
  { no: 12, nama: 'HELMY BAWONO PUTRO, SH', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '198110082009021003' },
  { no: 13, nama: 'DINNUR ISMAIL, S.Kom', jabatan: 'Pranata Komputer Ahli Pertama', nip: '198610032019031001' },
  { no: 14, nama: 'HERYANTO, S.Kom, M.T.', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '199204242019031009' },
  { no: 15, nama: 'AHMAD RIYADI SIDIK, S.I. Pust', jabatan: 'Pustakawan Ahli Pertama', nip: '199011152020121002' },
  { no: 16, nama: 'DATOHARI, A.Md', jabatan: 'Arsiparis Terampil', nip: '199009192019031002' },
  { no: 17, nama: 'HATI HARTATI, S.AP', jabatan: 'Analis SDM Aparatur Ahli Muda', nip: '197501272005012011' },
  { no: 18, nama: 'LILY MUKHLISHOH MARDLIYATI, Psi', jabatan: 'Analis SDM Aparatur Ahli Madya', nip: '197603262006042011' },
  { no: 19, nama: 'NINE ISNAENI AGUSTINE, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '198608292008122002' },
  { no: 20, nama: 'RATNAWATI, S.Psi.', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '197901292006042005' },
  { no: 21, nama: 'ROSMALA HERDIASTUTI, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '197505192006042013' },
  { no: 22, nama: 'NURRUL NURFADHILAH, S.I.Kom', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '198612212010012008' },
  { no: 23, nama: 'TATIK KARTIKA, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '196902212008012004' },
  { no: 24, nama: 'SRI RAHAJENG GUSTI, S.Sos', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '197708192010012002' },
  { no: 25, nama: 'CHIRLIE JUNTA SUCI, ST', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '198406082011012009' },
  { no: 26, nama: 'SOFFIA WULANDARI, S.Kep, M.A.P', jabatan: 'Pengolah Data dan Informasi', nip: '198109232006042018' },
  { no: 27, nama: 'MEINA MARTINI, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '197705032010012006' },
  { no: 28, nama: 'MUSTAMAN, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '197508132009011003' },
  { no: 29, nama: 'RACHDIJANTO, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '197109262009011003' },
  { no: 30, nama: 'JARNET DEDY SONETHA REANGAN, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '198101262010012006' },
  { no: 31, nama: 'ADI SUSANTO, SH', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '199309042020121007' },
  { no: 32, nama: 'AHMAD MUKOROBIN, S.Kom', jabatan: 'Penelaah Teknis Kebijakan', nip: '199603142020121001' },
  { no: 33, nama: 'NABILAH QISTHI WIBOWO, S.Tr.IP', jabatan: 'Penelaah Teknis Kebijakan', nip: '199808072021082001' },
  { no: 34, nama: 'TULAH', jabatan: 'Pengadministrasi Perkantoran', nip: '197708172007011011' },
  { no: 35, nama: 'ARIPIN', jabatan: 'Pengadministrasi Perkantoran', nip: '198005172008011004' },
  { no: 36, nama: 'FAUZIYYAH HANIF BASUKI, A.Md', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '199205122020122011' },
  { no: 37, nama: 'IRMA RAHMAWATI, S.Kom.', jabatan: 'Penelaah Teknis Kebijakan', nip: '199105152022032002' },
  { no: 38, nama: 'CHAIRANI NURUL IZZAH, S.H.', jabatan: 'Penata Kelola Hukum dan Perundang-Undangan', nip: '200102272025042001' },
  { no: 39, nama: 'ARI DWI PRASETIA, A.Md', jabatan: 'Pranata Komputer Terampil', nip: '199906102025041004' },
  { no: 40, nama: 'MOCHAMAD RIFKY SUGANDHI, A.Md.', jabatan: 'Pranata Sumber Daya Manusia Aparatur Terampil', nip: '199308242025041001' },
  { no: 41, nama: 'JEREMY SETIAWAN, A.Md.', jabatan: 'Pranata Sumber Daya Manusia Aparatur Terampil', nip: '200010062025041001' },
];
