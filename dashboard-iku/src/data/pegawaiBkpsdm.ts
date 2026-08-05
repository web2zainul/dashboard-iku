export interface Pegawai {
  no: number;
  nama: string;
  jabatan: string;
  nip: string;
}

// Data bersih dari "DATA PEGAWAI LALALA NIP.xlsx" (Sheet 1) — 41 pegawai BKPSDM Kota Cirebon
export const pegawaiBkpsdm: Pegawai[] = [
  { no: 1, nama: 'SUWARSO BUDI WINARNO', jabatan: 'KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA', nip: '19750101 199503 1 001' },
  { no: 2, nama: 'Hj. ERIZA, SE, M.Si', jabatan: 'Sekretaris BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA', nip: '19721014 199203 2 005' },
  { no: 3, nama: 'MOH. RISWANTO, SH, MH', jabatan: 'Kepala Bidang Pengembangan Kompetensi ASN', nip: '19720816 200212 1 006' },
  { no: 4, nama: 'ENI RUSMINI, S.Sos', jabatan: 'Kepala Bidang Pengadaan, Pemberhentian, Mutasi dan Promosi', nip: '19740113 199703 2 001' },
  { no: 5, nama: 'ANDI SUKMANA, SE, Akt, M.Ec.Dev', jabatan: 'Analis SDM Aparatur Ahli Muda', nip: '19760726 200604 1 013' },
  { no: 6, nama: 'OLLY INDIRA FEBIANTY, S.Psi', jabatan: 'Kepala Sub Bagian Umum dan Kepegawaian', nip: '19800205 200312 2 011' },
  { no: 7, nama: 'ARIS RISMANTO, SE, M.E.', jabatan: 'Kasubbag Program dan Keuangan', nip: '19831014 200312 1 001' },
  { no: 8, nama: 'RULY TAUFIK FERDIANSYAH, SE', jabatan: 'Analis SDM Aparatur Ahli Madya', nip: '19750527 199901 1 001' },
  { no: 9, nama: 'SLAMET MULYANA, SE, MT', jabatan: 'Penelaah Teknis Kebijakan', nip: '19720518 200501 1 004' },
  { no: 10, nama: 'ACHMAD SAFRUDIN, S.Sos', jabatan: 'Kepala UPT Penyelenggaraan Pendidikan, Pelatihan dan Kesejahteraan Pegawai', nip: '19690930 200901 1 001' },
  { no: 11, nama: 'NURLEHA, SE', jabatan: 'Kepala Sub Bagian Tata Usaha UPT Penyelenggaraan Pendidikan, Pelatihan dan Kesejahteraan Pegawai', nip: '19710101 199403 2 010' },
  { no: 12, nama: 'HELMY BAWONO PUTRO, SH', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19811008 200902 1 003' },
  { no: 13, nama: 'DINNUR ISMAIL, S.Kom', jabatan: 'Pranata Komputer Ahli Pertama', nip: '19861003 201903 1 001' },
  { no: 14, nama: 'HERYANTO, S.Kom, M.T.', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19920424 201903 1 009' },
  { no: 15, nama: 'AHMAD RIYADI SIDIK, S.I. Pust', jabatan: 'Pustakawan Ahli Pertama', nip: '19901115 202012 1 002' },
  { no: 16, nama: 'DATOHARI, A.Md', jabatan: 'Arsiparis Terampil', nip: '19900919 201903 1 002' },
  { no: 17, nama: 'HATI HARTATI, S.AP', jabatan: 'Analis SDM Aparatur Ahli Muda', nip: '19750127 200501 2 011' },
  { no: 18, nama: 'LILY MUKHLISHOH MARDLIYATI, Psi', jabatan: 'Analis SDM Aparatur Ahli Madya', nip: '19760326 200604 2 011' },
  { no: 19, nama: 'NINE ISNAENI AGUSTINE, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '19860829 200812 2 002' },
  { no: 20, nama: 'RATNAWATI, S.Psi.', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19790129 200604 2 005' },
  { no: 21, nama: 'ROSMALA HERDIASTUTI, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '19750519 200604 2 013' },
  { no: 22, nama: 'NURRUL NURFADHILAH, S.I.Kom', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19861221 201001 2 008' },
  { no: 23, nama: 'TATIK KARTIKA, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '19690221 200801 2 004' },
  { no: 24, nama: 'SRI RAHAJENG GUSTI, S.Sos', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19770819 201001 2 002' },
  { no: 25, nama: 'CHIRLIE JUNTA SUCI, ST', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19840608 201101 2 009' },
  { no: 26, nama: 'SOFFIA WULANDARI, S.Kep, M.A.P', jabatan: 'Pengolah Data dan Informasi', nip: '19810923 200604 2 018' },
  { no: 27, nama: 'MEINA MARTINI, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '19770503 201001 2 006' },
  { no: 28, nama: 'MUSTAMAN, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '19750813 200901 1 003' },
  { no: 29, nama: 'RACHDIJANTO, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '19710926 200901 1 003' },
  { no: 30, nama: 'JARNET DEDY SONETHA REANGAN, SE', jabatan: 'Penelaah Teknis Kebijakan', nip: '19810126 201001 2 006' },
  { no: 31, nama: 'ADI SUSANTO, SH', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19930904 202012 1 007' },
  { no: 32, nama: 'AHMAD MUKOROBIN, S.Kom', jabatan: 'Penelaah Teknis Kebijakan', nip: '19960314 202012 1 001' },
  { no: 33, nama: 'NABILAH QISTHI WIBOWO, S.Tr.IP', jabatan: 'Penelaah Teknis Kebijakan', nip: '19980807 202108 2 001' },
  { no: 34, nama: 'TULAH', jabatan: 'Pengadministrasi Perkantoran', nip: '19770817 200701 1 011' },
  { no: 35, nama: 'ARIPIN', jabatan: 'Pengadministrasi Perkantoran', nip: '19800517 200801 1 004' },
  { no: 36, nama: 'FAUZIYYAH HANIF BASUKI, A.Md', jabatan: 'Analis SDM Aparatur Ahli Pertama', nip: '19920512 202012 2 011' },
  { no: 37, nama: 'IRMA RAHMAWATI, S.Kom.', jabatan: 'Penelaah Teknis Kebijakan', nip: '19910515 202203 2 002' },
  { no: 38, nama: 'CHAIRANI NURUL IZZAH, S.H.', jabatan: 'Penata Kelola Hukum dan Perundang-Undangan', nip: '20010227 202504 2 001' },
  { no: 39, nama: 'ARI DWI PRASETIA, A.Md', jabatan: 'Pranata Komputer Terampil', nip: '19990610 202504 1 004' },
  { no: 40, nama: 'MOCHAMAD RIFKY SUGANDHI, A.Md.', jabatan: 'Pranata Sumber Daya Manusia Aparatur Terampil', nip: '19930824 202504 1 001' },
  { no: 41, nama: 'JEREMY SETIAWAN, A.Md.', jabatan: 'Pranata Sumber Daya Manusia Aparatur Terampil', nip: '20001006 202504 1 001' },
];
