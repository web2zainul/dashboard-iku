export interface Pegawai {
  no: number;
  nama: string;
  nip: string;
  jabatan: string;
}

// Data dari "DATA PEGAWAI LALALA NIP.xlsx" (Sheet 1) — best-effort,
// sebagian sel bergeser karena merged cells di file asli.
export const pegawaiBkpsdm: Pegawai[] = [
  { no: 1, nama: 'Penelaah Teknis Kebijakan', nip: '19721014 199203 2 005', jabatan: 'Sekretaris BKPSDM' },
  { no: 2, nama: 'Hj. Eriza, SE, M.Si', nip: '19740113 199703 2 001', jabatan: 'Kepala BKPSDM' },
  { no: 3, nama: 'Moh. Riswanto, SH, MH', nip: '19760726 200604 1 013', jabatan: 'Kepala Bidang Pengembangan Kompetensi ASN' },
  { no: 4, nama: 'Eni Rusmini, S.Sos', nip: '19720816 200212 1 006', jabatan: 'Kepala Bidang Pengadaan, Pemberhentian, Mutasi dan Promosi' },
  { no: 5, nama: 'Andi Sukmana, SE, Akt, M.Ec.Dev', nip: '19800205 200312 2 011', jabatan: 'Analis SDM Aparatur Ahli Muda' },
  { no: 6, nama: 'Olly Indira Febianty, S.Psi', nip: '19831014 200312 1 001', jabatan: 'Kepala Sub Bagian Umum dan Kepegawaian' },
  { no: 7, nama: 'Aris Rismanto, SE, M.E.', nip: '19750527 199901 1 001', jabatan: 'Suwarso Budi Winarno' },
  { no: 8, nama: 'Ruly Taufik Ferdiansyah, SE', nip: '19720518 200501 1 004', jabatan: 'Irma Rahmawati, S.Kom.' },
  { no: 9, nama: 'Slamet Mulyana, SE, MT', nip: '19690930 200901 1 001', jabatan: 'Widyaiswara Pertama' },
  { no: 10, nama: 'Achmad Safrudin, S.Sos', nip: '19710101 199403 2 010', jabatan: 'Kepala UPT Penyelenggaraan Pendidikan, Pelatihan dan Kesejahteraan Pegawai' },
  { no: 11, nama: 'Nurleha, SE', nip: '19811008 200902 1 003', jabatan: 'Kepala Sub Bagian Tata Usaha UPT Diklat dan Kesejahteraan Pegawai' },
  { no: 12, nama: 'Helmy Bawono Putro, SH', nip: '19861003 201903 1 001', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 13, nama: 'Dinnur Ismail, S.Kom', nip: '19920424 201903 1 009', jabatan: 'Pranata Komputer Ahli Pertama' },
  { no: 14, nama: 'Heryanto, S.Kom, M.T.', nip: '19901115 202012 1 002', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 15, nama: 'Ahmad Riyadi Sidik, S.I. Pust', nip: '19900919 201903 1 002', jabatan: 'Pustakawan Ahli Pertama' },
  { no: 16, nama: 'Datohari, A.Md', nip: '19750127 200501 2 011', jabatan: 'Arsiparis Terampil' },
  { no: 17, nama: 'Hati Hartati, S.AP', nip: '19760326 200604 2 011', jabatan: 'Analis SDM Aparatur Ahli Muda' },
  { no: 18, nama: 'Lily Mukhlishoh Mardliyati, Psi', nip: '19860829 200812 2 002', jabatan: 'Irma Rahmawati, S.Kom.' },
  { no: 19, nama: 'Nine Isnaeni Agustine, SE', nip: '19790129 200604 2 005', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 20, nama: 'Ratnawati, S.Psi.', nip: '19750519 200604 2 013', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 21, nama: 'Rosmala Herdiastuti, SE', nip: '19861221 201001 2 008', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 22, nama: 'Nurrul Nurfadhilah, S.I.Kom', nip: '19690221 200801 2 004', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 23, nama: 'Tatik Kartika, SE', nip: '19770819 201001 2 002', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 24, nama: 'Sri Rahajeng Gusti, S.Sos', nip: '19840608 201101 2 009', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 25, nama: 'Chirlie Junta Suci, ST', nip: '19810923 200604 2 018', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 26, nama: 'Soffia Wulandari, S.Kep, M.A.P', nip: '19770503 201001 2 006', jabatan: 'Pengolah Data dan Informasi' },
  { no: 27, nama: 'Meina Martini, SE', nip: '19750813 200901 1 003', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 28, nama: 'Mustaman, SE', nip: '19710926 200901 1 003', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 29, nama: 'Rachdijanto, SE', nip: '19810126 201001 2 006', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 30, nama: 'Jarnet Dedy Sonetha Reangan, SE', nip: '19930904 202012 1 007', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 31, nama: 'Adi Susanto, SH', nip: '19960314 202012 1 001', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 32, nama: 'Ahmad Mukorobin, S.Kom', nip: '19980807 202108 2 001', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 33, nama: 'Nabilah Qisthi Wibowo, S.Tr.IP', nip: '19770817 200701 1 011', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 34, nama: 'Tulah', nip: '19800517 200801 1 004', jabatan: 'Pengadministrasi Perkantoran' },
  { no: 35, nama: 'Aripin', nip: '19920512 202012 2 011', jabatan: 'Pengadministrasi Perkantoran' },
  { no: 36, nama: 'Fauziyyah Hanif Basuki, A.Md', nip: '19910515 202203 2 002', jabatan: 'Analis SDM Aparatur Ahli Pertama' },
  { no: 37, nama: 'Kasubbag Program dan Keuangan', nip: '20010227 202504 2 001', jabatan: 'Penelaah Teknis Kebijakan' },
  { no: 38, nama: 'Chairani Nurul Izzah, S.H.', nip: '19990610 202504 1 004', jabatan: 'Penata Kelola Hukum dan Perundang-Undangan' },
  { no: 39, nama: 'Ari Dwi Prasetia, A.Md', nip: '19930824 202504 1 001', jabatan: 'Pranata Komputer Terampil' },
  { no: 40, nama: 'Mochamad Rifky Sugandhi, A.Md.', nip: '20001006 202504 1 001', jabatan: 'Jeremy Setiawan, A.Md.' },
  { no: 41, nama: 'Analis SDM Aparatur Ahli Madya', nip: '', jabatan: 'Jeremy Setiawan, A.Md.' },
];
