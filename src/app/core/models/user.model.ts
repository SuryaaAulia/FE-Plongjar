export interface User {
  id: string;
  name: string;
  lecturerCode: string;
  email: string;
  jabatanFunctionalAkademik: string[];
  statusPegawai?: string;
  pendidikanTerakhir?: string;
  department?: string;
  nidn?: string;
  kelompokKeahlian?: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Lecturer {
  id: number;
  name: string;
  lecturerCode: string;
  email?: string;
  jabatanFunctionalAkademik: string[];
  statusPegawai: string;
  pendidikanTerakhir?: string[];
  department?: string;
  nidn?: string;
  nip?: string;
  kelompokKeahlian?: string;
  idJabatanStruktural?: number;
  idKelompokKeahlian?: number;
  createdAt?: string;
  updatedAt?: string;
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
}