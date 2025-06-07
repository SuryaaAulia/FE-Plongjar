import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-assign-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    UserCardComponent,
    PaginationComponent,
    AddRoleModalComponent,
    LoadingSpinnerComponent, // Add new component here
    SearchNotFoundComponent,     // Add new component here
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
  modalPosition = { top: 0, left: 0 };

  currentSearchKeyword: string = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.currentSearchKeyword = '';
    setTimeout(() => {
      this.users = this.generateMockUsers();
      this.filteredUsers = [...this.users];
      this.isLoading = false;
    }, 1000);
  }

  private generateMockUsers(): User[] {
    const lecturerCode = ['BPS', 'TI', 'SI', 'DKV'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: `6538${7547 + i}`,
      name: this.generateRandomName(),
      lecturerCode: lecturerCode[i % lecturerCode.length],
      jabatanFunctionalAkademik: [],
      email: `user${i + 1}@university.edu`,
    }));
  }

  private generateRandomName(): string {
    const firstNames = ['Surya', 'Suep', 'Ohayoyo', 'Keegan', 'Andi'];
    const lastNames = ['Aulia', '1170', 'Junaidi', 'Ijat'];
    const degrees = ['S.T., M.T.', 'S.Kom., M.Kom.', 'S.Si., M.Si.'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]
      }, ${degrees[Math.floor(Math.random() * degrees.length)]}`;
  }

  onAddRole(user: User, event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.selectedUser = user;
    this.modalPosition = {
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 180,
    };
    this.showAddRoleModal = true;
    setTimeout(() => {
      const clickHandler = (e: MouseEvent) => {
        const modalElement = document.querySelector('app-add-role-modal .modal-container');
        if (modalElement && !modalElement.contains(e.target as Node) && e.target !== target) {
          this.closeModal();
          document.removeEventListener('click', clickHandler, true);
        }
      };
      document.addEventListener('click', clickHandler, true);
    }, 0);
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
    }
  }

  onSearch(searchQuery: { query1: string; query2: string }): void {
    const { query1, query2 } = searchQuery;

    this.currentSearchKeyword = query1 || '';

    this.filteredUsers = this.users.filter(
      (user) =>
        (query1
          ? user.name.toLowerCase().includes(query1.toLowerCase()) ||
          user.id.includes(query1) ||
          (user.email && user.email.toLowerCase().includes(query1.toLowerCase()))
          : true) &&
        (query2
          ? user.lecturerCode?.toLowerCase().includes(query2.toLowerCase())
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