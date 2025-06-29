export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  nip: string;
  role?: Role;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface KelompokKeahlian {
  id: number;
  nama: string;
}

export interface Lecturer {
  id: number;
  name: string;
  lecturerCode: string;
  nip: string | null;
  nidn: string | null;
  email: string;
  jabatanFungsionalAkademik: string;
  idJabatanStruktural: number | null;
  statusPegawai: string;
  pendidikanTerakhir: string;
  idKelompokKeahlian: number;
  kelompokKeahlian?: KelompokKeahlian;
}

export interface TeachingRecord {
  id: string;
  subject: string;
  pic: string;
  class_type: 'Online' | 'Onsite';
  class: string;
  quota: number;
  period: string;
  lecturerName?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  sks: number | string;
  pic: string;
  statusMatkul: string;
  metodePerkuliahan: string;
  praktikum: string;
  koordinator?: Lecturer;
}

export interface JabatanStruktural {
  id: number;
  nama: string;
  konversi_sks: number;
}

export interface TahunAjaran {
  id: number;
  tahun_ajaran: string;
  semester: 'ganjil' | 'genap';
  status: number;
}
