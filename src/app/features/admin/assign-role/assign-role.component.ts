import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SearchHeaderComponent,
  UserCardComponent,
  PaginationComponent,
  AddRoleModalComponent,
} from '../../../shared/components/index';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-assign-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    UserCardComponent,
    PaginationComponent,
    AddRoleModalComponent,
  ],
  templateUrl: './assign-role.component.html',
  styleUrls: ['./assign-role.component.scss'],
})
export class AssignRoleComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  isLoading = true;
  availableRoles = ['Kaur Lab', 'Ket. KK', 'Kaprodi', 'LAA', 'Admin'];

  showAddRoleModal = false;
  selectedUser: User | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    setTimeout(() => {
      this.users = this.generateMockUsers();
      this.filteredUsers = [...this.users];
      this.isLoading = false;
    }, 1000);
  }

  private generateMockUsers(): User[] {
    const departments = ['BPS', 'TI', 'SI', 'DKV'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: `6538${7547 + i}`,
      name: this.generateRandomName(),
      department: departments[Math.floor(Math.random() * departments.length)],
      kodeDosen: `D${7547 + i}`,
      email: `user${i + 1}@university.edu`,
      roles: this.generateRandomRoles(),
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    }));
  }

  private generateRandomName(): string {
    const firstNames = ['Bambang', 'Siti', 'Ahmad', 'Dewi', 'Rudi'];
    const lastNames = ['Pamungkas', 'Wahyuni', 'Santoso', 'Kurniawan'];
    const degrees = ['S.T., M.T.', 'S.Kom., M.Kom.', 'S.Si., M.Si.'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }, ${degrees[Math.floor(Math.random() * degrees.length)]}`;
  }

  private generateRandomRoles(): string[] {
    if (Math.random() > 0.7) {
      return [
        this.availableRoles[
          Math.floor(Math.random() * this.availableRoles.length)
        ],
      ];
    }
    return [];
  }

  onAddRole(user: User): void {
    this.selectedUser = user;
    this.showAddRoleModal = true;
  }

  onSelectRole(role: string): void {
    if (this.selectedUser) {
      if (!this.selectedUser.roles) {
        this.selectedUser.roles = [];
      }
      if (!this.selectedUser.roles.includes(role)) {
        this.selectedUser.roles.push(role);
      }
    }
    this.closeModal();
  }
  closeModal(): void {
    this.showAddRoleModal = false;
    this.selectedUser = null;
  }

  onRemoveRole(user: User, role: string): void {
    user.roles = user.roles?.filter((r) => r !== role);
  }

  onSearch(searchQuery: { nama: string; kode: string }): void {
    const { nama, kode } = searchQuery;

    this.filteredUsers = this.users.filter(
      (user) =>
        (nama
          ? user.name.toLowerCase().includes(nama.toLowerCase()) ||
            user.id.includes(nama) ||
            user.email?.toLowerCase().includes(nama.toLowerCase()) ||
            user.department.toLowerCase().includes(nama.toLowerCase())
          : true) &&
        (kode
          ? user.kodeDosen?.toLowerCase().includes(kode.toLowerCase())
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

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }
}
