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
  id: string;
  name: string;
  lecturerCode: string;
  email?: string;
  jabatanFunctionalAkademik: string[];
  statusPegawai?: string;
  pendidikanTerakhir?: string;
  department?: string;
  nidn?: string;
  kelompokKeahlian?: string;
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