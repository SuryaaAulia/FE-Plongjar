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
