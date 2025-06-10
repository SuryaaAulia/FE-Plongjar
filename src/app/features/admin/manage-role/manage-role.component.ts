import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  SearchHeaderComponent,
  UserCardComponent,
  PaginationComponent,
  LoadingSpinnerComponent,
  SearchNotFoundComponent
} from '../../../shared/components/index';
import { User, Role } from '../../../core/models/user.model';
import { RoleService, UserWithRoles } from '../../../core/services/admin/role.service';

@Component({
  selector: 'app-manage-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    UserCardComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    SearchNotFoundComponent,
  ],
  templateUrl: './manage-role.component.html',
  styleUrls: ['./manage-role.component.scss'],
})
export class ManageRoleComponent implements OnInit, OnDestroy {
  users: UserWithRoles[] = [];
  filteredUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  isLoading = true;

  availableRoles: string[] = [];
  roles: Role[] = [];
  activeRoleFilter: string | null = null;
  activeRoleId: number | null = null;

  currentSearchKeyword: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRoles(): void {
    this.isLoading = true;

    this.roleService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.availableRoles = roles.map(role =>
            this.roleService.getRoleDisplayName(role.name)
          );
          if (roles.length > 0) {
            this.filterByRole(this.availableRoles[0]);
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.isLoading = false;
        }
      });
  }

  private loadUsersByRole(roleId: number): void {
    this.isLoading = true;

    this.roleService.getAllUsersByRole(roleId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (users) => {
          this.validateSingleRole(users);

          this.users = users;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading users by role:', error);
          this.users = [];
          this.filteredUsers = [];
        }
      });
  }

  private validateSingleRole(users: UserWithRoles[]): void {
    users.forEach(user => {
      if (user.roles && user.roles.length > 1) {
        console.warn(`User ${user.name} (ID: ${user.id}) has multiple roles:`, user.roles);
        console.warn('Only the first role will be displayed');
      }
    });
  }

  private transformUsersForDisplay(users: UserWithRoles[]): User[] {
    return users.map(user => {
      let userRole: Role | undefined;

      if (user.roles && user.roles.length > 0) {
        userRole = user.roles[0];
      }

      console.log('Transforming user:', user.name);
      console.log('User has role:', userRole ? userRole.name : 'No role');

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        nip: user.nip,
        role: userRole
      } as User;
    });
  }

  filterByRole(displayName: string | null): void {
    if (!displayName) return;

    this.activeRoleFilter = displayName;

    const actualRoleName = this.roleService.getRoleByDisplayName(displayName);
    if (!actualRoleName) {
      console.error('Could not find role for display name:', displayName);
      return;
    }

    const role = this.roles.find(r => r.name === actualRoleName);
    if (!role) {
      console.error('Could not find role:', actualRoleName);
      return;
    }

    this.activeRoleId = role.id;
    this.currentPage = 1;
    this.loadUsersByRole(role.id);
  }

  applyFilters(searchTerm: string = this.currentSearchKeyword): void {
    const displayUsers = this.transformUsersForDisplay(this.users);
    let tempUsers = [...displayUsers];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempUsers = tempUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerSearchTerm) ||
          user.id.toString().includes(searchTerm) ||
          user.nip?.toLowerCase().includes(lowerSearchTerm) ||
          (user.email && user.email.toLowerCase().includes(lowerSearchTerm))
      );
    }

    this.filteredUsers = tempUsers;
  }

  onRemoveRole(user: User): void {
    if (!user.role) {
      console.error('User has no role to remove');
      return;
    }

    const roleDisplayName = this.roleService.getRoleDisplayName(user.role.name);

    if (!confirm(`Are you sure you want to remove the ${roleDisplayName} role from ${user.name}?`)) {
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
          if (this.activeRoleId) {
            this.loadUsersByRole(this.activeRoleId);
          }
        },
        error: (error) => {
          console.error('Error revoking role:', error);
          alert('Failed to remove role. Please try again.');
        }
      });
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