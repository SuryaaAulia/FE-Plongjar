import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
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
import { RoleService, ScopedRoleAssignment } from '../../../core/services/admin/role.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  paginatedUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;
  isLoading = true;

  availableRoles: string[] = [];
  roles: Role[] = [];
  activeRoleFilter: string | null = null;
  activeRoleId: number | null = null;
  currentSearchKeyword: string = '';

  programStudiOptions: ScopeOption[] = [];
  kelompokKeahlianOptions: ScopeOption[] = [];

  private destroy$ = new Subject<void>();

  public roleService = inject(RoleService);
  private notificationService = inject(NotificationService);

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
          this.availableRoles = roles.map(role => this.roleService.getRoleDisplayName(role.name));

          if (this.availableRoles.length > 0) {
            this.filterByRole(this.availableRoles[0]);
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          this.notificationService.showError("Failed to load initial page data.");
          this.isLoading = false;
        }
      });
  }

  private loadUsers(): void {
    if (!this.activeRoleId) return;

    this.isLoading = true;
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('per_page', this.itemsPerPage.toString());

    if (this.currentSearchKeyword) {
      params = params.set('nama', this.currentSearchKeyword);
    }

    this.roleService.getAllUsersByRole(this.activeRoleId, params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.paginatedUsers = this.transformUsersForDisplay(response.data);
          this.totalItems = response.total;
          this.currentPage = response.current_page;
        },
        error: (error) => {
          console.error('Error loading users by role:', error);
          this.notificationService.showError("Failed to load users for the selected role.");
          this.paginatedUsers = [];
          this.totalItems = 0;
        }
      });
  }

  private transformUsersForDisplay(users: any[]): User[] {
    return users.map(user => {
      const roleName = this.roleService.getRoleByDisplayName(this.activeRoleFilter!);
      return {
        ...user,
        role: { id: this.activeRoleId, name: roleName } as Role,
        assignment_detail: user.assignment_detail
      } as User;
    });
  }

  filterByRole(displayName: string | null): void {
    if (!displayName || this.activeRoleFilter === displayName) return;

    this.activeRoleFilter = displayName;
    const actualRoleName = this.roleService.getRoleByDisplayName(displayName);
    const role = this.roles.find(r => r.name === actualRoleName);

    if (!role) return;

    this.activeRoleId = role.id;
    this.currentPage = 1;
    this.currentSearchKeyword = '';
    this.loadUsers();
  }

  onSearch(searchQuery: { query1: string; query2: string }): void {
    this.currentSearchKeyword = searchQuery.query1 || '';
    this.currentPage = 1;
    this.loadUsers();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onAssignScope(event: { userId: number, scopeId: number }): void {
    if (!this.activeRoleId) {
      this.notificationService.showError("Cannot assign scope, active role is not set.");
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
          this.notificationService.showSuccess("Scope assigned successfully.");
          this.loadUsers();
        },
        error: (err) => {
          console.error('Failed to assign scope', err);
          this.notificationService.showError("Failed to assign scope.");
        }
      });
  }

  onRemoveRole(user: User): void {
    if (!user.role) {
      this.notificationService.showError('User has no role to remove.');
      return;
    }

    this.notificationService.showConfirmation(
      'Konfirmasi Hapus Role',
      `Anda yakin ingin menghapus role "${this.activeRoleFilter}" dari pengguna ${user.name}?`
    ).then(result => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.roleService.revokeRole(user.id, user.role!.id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoading = false)
          )
          .subscribe({
            next: () => {
              this.notificationService.showSuccess("Role successfully revoked.");
              this.loadUsers();
            },
            error: (error) => {
              console.error('Error revoking role:', error);
              this.notificationService.showError("Failed to revoke role.");
            }
          });
      }
    });
  }
}