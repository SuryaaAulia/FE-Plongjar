export interface User {
  id: string;
  name: string;
  department: string;
  kodeDosen: string;
  email?: string;
  roles?: string[];
  avatar?: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
