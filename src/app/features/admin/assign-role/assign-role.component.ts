import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  SearchHeaderComponent,
  UserCardComponent,
  PaginationComponent,
  AddRoleModalComponent,
  LoadingSpinnerComponent,
  SearchNotFoundComponent,
} from '../../../shared/components/index';
import { User, Role } from '../../../core/models/user.model';
import { RoleService, UserWithRoles, RoleAssignment } from '../../../core/services/admin/role.service';
import { NotificationService } from '../../../core/services/notification.service';

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
    LoadingSpinnerComponent,
    SearchNotFoundComponent,
  ],
  templateUrl: './assign-role.component.html',
  styleUrls: ['./assign-role.component.scss'],
})
export class AssignRoleComponent implements OnInit, OnDestroy {
  users: UserWithRoles[] = [];
  filteredUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  isLoading = true;
  selectedUserId: number | null = null;

  availableRoles: string[] = [];
  roles: Role[] = [];

  showAddRoleModal = false;
  selectedUser: UserWithRoles | null = null;
  modalPosition = { top: 0, left: 0 };

  currentSearchKeyword: string = '';

  private destroy$ = new Subject<void>();

  private roleService = inject(RoleService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;

    this.roleService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.availableRoles = roles.map(role =>
            this.roleService.getRoleDisplayName(role.name)
          );
          this.loadUsersWithRoles();
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.isLoading = false;
        }
      });
  }

  private loadUsersWithRoles(): void {
    this.roleService.getAllUnassignedUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          this.filteredUsers = this.transformUsersForDisplay(this.users);
        },
        error: (error) => {
          console.error('Error loading unassigned users:', error);
          this.isLoading = false;
        }
      });
  }

  private transformUsersForDisplay(users: UserWithRoles[]): User[] {
    return this.roleService.transformUsersForDisplay(users);
  }

  onAddRole(user: User, event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const originalUser = this.users.find(u => u.id === user.id);
    this.selectedUser = originalUser || null;
    this.selectedUserId = user.id;
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

  onSelectRole(displayName: string): void {
    if (!this.selectedUser) return;

    const actualRoleName = this.roleService.getRoleByDisplayName(displayName);
    if (!actualRoleName) {
      console.error('Could not find role for display name:', displayName);
      return;
    }

    const role = this.roles.find(r => r.name === actualRoleName);
    if (!role) {
      console.error('Could not find role object for:', actualRoleName);
      return;
    }

    const userId = this.selectedUser.id;
    const roleId = role.id;

    this.isLoading = true;
    this.roleService
      .assignRole(userId, roleId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.closeModal();
        })
      )
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Role assigned successfully!');
          this.loadData();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to assign role. Please try again.';
          this.notificationService.showError(errorMessage);
          console.error('Error assigning role:', error);
        },
      });
  }

  closeModal(): void {
    this.showAddRoleModal = false;
    this.selectedUser = null;
    this.selectedUserId = null;
  }

  onRemoveRole(user: User): void {
    if (!user.role) {
      console.error('User has no role to remove');
      return;
    }

    this.isLoading = true;
    this.roleService.revokeRole(user.id, user.role.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.loadData();
        },
        error: (error) => {
          console.error('Error revoking role:', error);
          console.error('Failed to remove role. Please try again.');
        }
      });
  }

  onSearch(searchQuery: { query1: string; query2: string }): void {
    const { query1 } = searchQuery;
    this.currentSearchKeyword = query1 || '';

    const displayUsers = this.transformUsersForDisplay(this.users);

    this.filteredUsers = displayUsers.filter(user =>
    (query1
      ? user.name.toLowerCase().includes(query1.toLowerCase()) ||
      user.id.toString().includes(query1) ||
      user.nip?.toLowerCase().includes(query1.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(query1.toLowerCase()))
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