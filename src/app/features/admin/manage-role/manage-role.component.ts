import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SearchHeaderComponent,
  UserCardComponent,
  PaginationComponent,
  AddRoleModalComponent,
} from '../../../shared/components/index';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-manage-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    UserCardComponent,
    PaginationComponent,
    AddRoleModalComponent,
  ],
  templateUrl: './manage-role.component.html',
  styleUrls: ['./manage-role.component.scss'],
})
export class ManageRoleComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  isLoading = true;
  availableRoles = ['Kaur Lab', 'Ket. KK', 'Kaprodi', 'LAA', 'Admin'];
  activeRoleFilter: string | null = null;

  showAddRoleModal = false;
  selectedUser: User | null = null;
  modalPosition = { top: 0, left: 0 };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  getShowingTo(): number {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredUsers.length
    );
  }

  loadUsers(): void {
    setTimeout(() => {
      this.users = this.generateMockUsers();
      this.filteredUsers = [...this.users];
      this.isLoading = false;
    }, 1000);
  }

  private generateMockUsers(): User[] {
    const departments = ['BPS', 'TI', 'SI', 'DKV', 'HBN'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: `6538${7547 + i}`,
      name: this.generateRandomName(),
      department: departments[Math.floor(Math.random() * departments.length)],
      lecturerCode: `D${7547 + i}`,
      jabatanFunctionalAkademik: [],
      email: `user${i + 1}@university.edu`,
      roles: this.generateRandomRoles(),
    }));
  }

  private generateRandomName(): string {
    const firstNames = ['Bambang', 'Siti', 'Ahmad', 'Dewi', 'Rudi', 'Hakim'];
    const lastNames = [
      'Pamungkas',
      'Wahyuni',
      'Santoso',
      'Kurniawan',
      'Burhanuddin',
    ];
    const degrees = [
      'S.T., M.T.',
      'S.Kom., M.Kom.',
      'S.Si., M.Si.',
      'S.T., M.Kom.',
    ];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }, ${degrees[Math.floor(Math.random() * degrees.length)]}`;
  }

  private generateRandomRoles(): string[] {
    const numRoles = Math.floor(Math.random() * 2);
    if (numRoles === 0) return [];

    return [
      this.availableRoles[
        Math.floor(Math.random() * this.availableRoles.length)
      ],
    ];
  }

  onSelectRole(role: string): void {
    if (this.selectedUser) {
      if (!this.selectedUser.jabatanFunctionalAkademik) {
        this.selectedUser.jabatanFunctionalAkademik = [];
      }
      if (!this.selectedUser.jabatanFunctionalAkademik.includes(role)) {
        this.selectedUser.jabatanFunctionalAkademik.push(role);
      }
    }
    this.closeModal();
    this.applyFilters();
  }

  closeModal(): void {
    this.showAddRoleModal = false;
    this.selectedUser = null;
  }

  onRemoveRole(user: User, role: string): void {
    user.jabatanFunctionalAkademik = user.jabatanFunctionalAkademik?.filter(
      (r) => r !== role
    );
    this.applyFilters();
  }

  filterByRole(role: string | null): void {
    this.activeRoleFilter = role;
    this.applyFilters();
    this.currentPage = 1;
  }

  applyFilters(): void {
    if (this.activeRoleFilter) {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.jabatanFunctionalAkademik &&
          user.jabatanFunctionalAkademik.includes(this.activeRoleFilter!)
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  onSearch(searchQuery: { nama: string; kode: string }): void {
    const { nama, kode } = searchQuery;

    let filtered = this.users;

    if (this.activeRoleFilter) {
      filtered = filtered.filter(
        (user) =>
          user.jabatanFunctionalAkademik &&
          user.jabatanFunctionalAkademik.includes(this.activeRoleFilter!)
      );
    }

    this.filteredUsers = filtered.filter(
      (user) =>
        (nama
          ? user.name.toLowerCase().includes(nama.toLowerCase()) ||
            user.id.includes(nama) ||
            user.email?.toLowerCase().includes(nama.toLowerCase())
          : true) &&
        (kode
          ? user.lecturerCode?.toLowerCase().includes(kode.toLowerCase())
          : true)
    );

    this.currentPage = 1;
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  navigateToRolePermission(role: string): void {
    console.log(`Navigate to permissions for ${role}`);
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }
}
