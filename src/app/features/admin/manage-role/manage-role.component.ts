import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SearchHeaderComponent,
  UserCardComponent,
  PaginationComponent,
  AddRoleModalComponent,
  LoadingSpinnerComponent,
  SearchNotFoundComponent
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
    LoadingSpinnerComponent,
    SearchNotFoundComponent,
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

  currentSearchKeyword: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.currentSearchKeyword = '';
    setTimeout(() => {
      this.users = this.generateMockUsers();
      this.applyFilters();
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
      jabatanFunctionalAkademik: this.generateRandomRolesForUser(),
      email: `user${i + 1}@university.edu`,
    }));
  }

  private generateRandomName(): string {
    const firstNames = ['Bambang', 'Siti', 'Ahmad', 'Dewi', 'Rudi', 'Hakim'];
    const lastNames = [
      'Pamungkas', 'Wahyuni', 'Santoso', 'Kurniawan', 'Burhanuddin',
    ];
    const degrees = [
      'S.T., M.T.', 'S.Kom., M.Kom.', 'S.Si., M.Si.', 'S.T., M.Kom.',
    ];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]
      }, ${degrees[Math.floor(Math.random() * degrees.length)]}`;
  }

  private generateRandomRolesForUser(): string[] {
    const rolesToAssign: string[] = [];
    const numberOfRoles = Math.floor(Math.random() * 3);
    const shuffledRoles = [...this.availableRoles].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numberOfRoles; i++) {
      rolesToAssign.push(shuffledRoles[i]);
    }
    return rolesToAssign;
  }


  onSelectRole(role: string): void {
    if (this.selectedUser) {
      if (!this.selectedUser.jabatanFunctionalAkademik) {
        this.selectedUser.jabatanFunctionalAkademik = [];
      }
      if (!this.selectedUser.jabatanFunctionalAkademik.includes(role)) {
        this.selectedUser.jabatanFunctionalAkademik.push(role);
        this.applyFilters();
      }
    }
    this.closeModal();
  }

  closeModal(): void {
    this.showAddRoleModal = false;
    this.selectedUser = null;
  }

  onRemoveRole(user: User, role: string): void {
    if (user.jabatanFunctionalAkademik) {
      user.jabatanFunctionalAkademik = user.jabatanFunctionalAkademik.filter(
        (r) => r !== role
      );
      this.applyFilters();
    }
  }

  filterByRole(role: string | null): void {
    this.activeRoleFilter = role;
    this.applyFilters();
    this.currentPage = 1;
  }

  applyFilters(searchTerm: string = this.currentSearchKeyword): void {
    let tempUsers = [...this.users];

    if (this.activeRoleFilter) {
      tempUsers = tempUsers.filter(
        (user) =>
          user.jabatanFunctionalAkademik &&
          user.jabatanFunctionalAkademik.includes(this.activeRoleFilter!)
      );
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempUsers = tempUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerSearchTerm) ||
          user.id.includes(searchTerm) || // ID might not need toLowerCase
          (user.email && user.email.toLowerCase().includes(lowerSearchTerm))
      );
    }
    this.filteredUsers = tempUsers;
  }

  onSearch(searchQuery: { query1: string; query2: string }): void {
    this.currentSearchKeyword = searchQuery.query1 || '';
    this.applyFilters(this.currentSearchKeyword);
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