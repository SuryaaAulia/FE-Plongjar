import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  SearchHeaderComponent,
  UserCardComponent,
  PaginationComponent,
  LoadingSpinnerComponent,
  SearchNotFoundComponent,
  AssignScopeCardComponent,
  ScopeOption
} from '../../../shared/components/index';
import { User, Role } from '../../../core/models/user.model';
import { RoleService, UserWithRoles, ScopedRoleAssignment } from '../../../core/services/admin/role.service';

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
    AssignScopeCardComponent,
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

  programStudiOptions: ScopeOption[] = [];
  kelompokKeahlianOptions: ScopeOption[] = [];

  currentSearchKeyword: string = '';
  private destroy$ = new Subject<void>();

  constructor(public roleService: RoleService) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      roles: this.roleService.getAllRoles(),
      programStudi: this.roleService.getAllProgramStudi(),
      kelompokKeahlian: this.roleService.getAllKelompokKeahlian()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ roles, programStudi, kelompokKeahlian }) => {
          this.roles = roles;
          this.programStudiOptions = programStudi;
          this.kelompokKeahlianOptions = kelompokKeahlian;

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
          console.error('Error loading initial data:', error);
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

  private transformUsersForDisplay(users: UserWithRoles[]): User[] {
    return users.map(user => {
      const userRole = (user.roles && user.roles.length > 0) ? user.roles[0] : undefined;
      const assignmentDetail = (user as any).assignment_detail
        ? { id: (user as any).assignment_detail.id, nama: (user as any).assignment_detail.nama }
        : undefined;

      return {
        ...user,
        role: userRole,
        assignment_detail: assignmentDetail
      } as User;
    });
  }

  filterByRole(displayName: string | null): void {
    if (!displayName) return;
    this.activeRoleFilter = displayName;
    const actualRoleName = this.roleService.getRoleByDisplayName(displayName);
    if (!actualRoleName) return;
    const role = this.roles.find(r => r.name === actualRoleName);
    if (!role) return;
    this.activeRoleId = role.id;
    this.currentPage = 1;
    this.loadUsersByRole(role.id);
  }

  applyFilters(searchTerm: string = this.currentSearchKeyword): void {
    const displayUsers = this.transformUsersForDisplay(this.users);
    this.filteredUsers = displayUsers.filter(user =>
      searchTerm
        ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm) ||
        user.nip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );
  }

  onAssignScope(event: { userId: number, scopeId: number }): void {
    if (!this.activeRoleId) {
      console.error("Cannot assign scope, active role ID is not set.");
      return;
    }

    const assignment: ScopedRoleAssignment = {
      user_id: event.userId,
      role_id: this.activeRoleId,
      roleable_id: event.scopeId
    };

    this.isLoading = true;
    this.roleService.assignScopedRole(assignment)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.loadUsersByRole(this.activeRoleId!);
        },
        error: (err) => console.error('Failed to assign scope', err)
      });
  }

  onRemoveRole(user: User): void {
    if (!user.role) {
      console.error('User has no role to remove');
      return;
    }

    const roleDisplayName = this.roleService.getRoleDisplayName(user.role.name);


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