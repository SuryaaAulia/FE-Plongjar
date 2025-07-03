import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { Role, User } from '../../models/user.model';

export interface RoleAssignment {
    user_id: number;
    role_id: number;
    roleable_id?: number | null;
    roleable_type?: string | null;
}

export interface ScopedRoleAssignment {
    user_id: number;
    role_id: number;
    roleable_id: number;
}

export interface ScopeOption {
    id: number;
    name: string;
}

interface ApiResponse<T> {
    status: string;
    data: T;
}
interface ApiScopeItem {
    id: number;
    nama: string;
}

export interface UserWithRoles extends Omit<User, 'role'> {
    roles?: Role[];
}

export interface UserWithSingleRole extends Omit<User, 'role'> {
    role?: Role;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private rolesSubject = new BehaviorSubject<Role[]>([]);
    public roles$ = this.rolesSubject.asObservable();

    private usersSubject = new BehaviorSubject<UserWithRoles[]>([]);
    public users$ = this.usersSubject.asObservable();

    private roleDisplayNames: { [key: string]: string } = {
        'Superadmin': 'Admin',
        'ProgramStudi': 'Kaprodi',
        'KelompokKeahlian': 'Ket. KK',
        'LayananAkademik': 'LAA',
        'KepalaUrusanLab': 'Kaur Lab'
    };

    constructor(private apiService: ApiService) { }

    getAllRoles(): Observable<Role[]> {
        return this.apiService.getAllRoles().pipe(
            map((response: any) => {
                const roles = Array.isArray(response) ? response : (response.data || []);
                this.rolesSubject.next(roles);
                return roles;
            }),
            catchError(error => {
                console.error('Error fetching roles:', error);
                throw error;
            })
        );
    }

    getAllUnassignedUsers(): Observable<UserWithRoles[]> {
        return this.apiService.getAllUnassignedUsers().pipe(
            map((response: any) => {
                const users = response.data || [];
                this.usersSubject.next(users);
                return users;
            }),
            catchError(error => {
                console.error('Error fetching unassigned users:', error);
                throw error;
            })
        );
    }

    getAllUsersByRole(roleId: number): Observable<UserWithRoles[]> {
        return this.apiService.getAllUsersByRole(roleId).pipe(
            map((response: any) => {
                let users: any[] = [];
                
                if (Array.isArray(response)) {
                    users = response;
                } else if (response?.data) {
                    if (response.data.data && Array.isArray(response.data.data)) {
                        users = response.data.data;
                    } else if (Array.isArray(response.data)) {
                        users = response.data;
                    }
                }

                if (!Array.isArray(users)) {
                    return [];
                }

                const currentRoles = this.rolesSubject.value;
                const currentRole = currentRoles.find(role => role.id === roleId);

                return users.map((user: any): UserWithRoles => {
                    return {
                        ...user,
                        roles: currentRole ? [currentRole] : []
                    };
                });
            }),
            catchError(error => {
                console.error('Error fetching users by role:', error);
                return of([]);
            })
        );
    }

    getAllAssignedUserRoles(): Observable<any> {
        return this.apiService.getAllAssignedUserRoles().pipe(
            map((response: any) => {
                const users = response.data || response;
                if (Array.isArray(users)) {
                    users.forEach((user: UserWithRoles) => {
                        if (user.roles && user.roles.length > 1) {
                            console.warn(`User ${user.name} has multiple roles, only first will be considered:`, user.roles);
                        }
                    });
                }

                return response;
            }),
            catchError(error => {
                console.error('Error fetching assigned user roles:', error);
                throw error;
            })
        );
    }

    assignRole(assignment: RoleAssignment): Observable<any> {
        const payload: RoleAssignment = {
            user_id: assignment.user_id,
            role_id: assignment.role_id,
            roleable_id: assignment.roleable_id || null,
            roleable_type: assignment.roleable_type || null
        };

        return this.apiService.assignRole(payload).pipe(
            tap((response) => {
                this.getAllAssignedUserRoles().subscribe();
            }),
            catchError(error => {
                console.error('Error assigning role:', error);
                throw error;
            })
        );
    }

    assignScopedRole(assignment: ScopedRoleAssignment): Observable<any> {
        return this.apiService.assignScopedRole(assignment).pipe(
            catchError(error => {
                console.error('Error assigning scoped role:', error);
                throw error;
            })
        );
    }


    revokeRole(userId: number, roleId: number): Observable<any> {
        const data = {
            user_id: userId,
            role_id: roleId
        };
        return this.apiService.revokeRole(data).pipe(
            tap((response) => {
                this.getAllAssignedUserRoles().subscribe();
            }),
            catchError(error => {
                console.error('Error revoking role:', error);
                throw error;
            })
        );
    }

    getRoleDisplayName(roleName: string): string {
        return this.roleDisplayNames[roleName] || roleName;
    }

    getRoleByDisplayName(displayName: string): string | null {
        for (const [key, value] of Object.entries(this.roleDisplayNames)) {
            if (value === displayName) {
                return key;
            }
        }
        return null;
    }

    transformToSingleRoleUser(userWithRoles: UserWithRoles): UserWithSingleRole {
        return {
            id: userWithRoles.id,
            name: userWithRoles.name,
            email: userWithRoles.email,
            nip: userWithRoles.nip,
            role: userWithRoles.roles && userWithRoles.roles.length > 0
                ? userWithRoles.roles[0]
                : undefined
        };
    }

    transformUsersForDisplay(users: UserWithRoles[]): User[] {
        return users.map(user => {
            const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : undefined;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                nip: user.nip,
                role: userRole
            } as User;
        });
    }

    userHasRole(user: UserWithRoles, roleName: string): boolean {
        if (!user.roles || user.roles.length === 0) {
            return false;
        }
        return user.roles[0].name === roleName;
    }

    getUserPrimaryRole(user: UserWithRoles): Role | null {
        return user.roles && user.roles.length > 0 ? user.roles[0] : null;
    }

    validateSingleRoleConstraint(users: UserWithRoles[]): { valid: boolean, violations: any[] } {
        const violations: any[] = [];

        users.forEach(user => {
            if (user.roles && user.roles.length > 1) {
                violations.push({
                    userId: user.id,
                    userName: user.name,
                    roleCount: user.roles.length,
                    roles: user.roles.map(r => r.name)
                });
            }
        });

        return {
            valid: violations.length === 0,
            violations: violations
        };
    }

    getRoleOptions(): Observable<{ value: string, label: string }[]> {
        return this.getAllRoles().pipe(
            map(roles => roles.map(role => ({
                value: role.name,
                label: this.getRoleDisplayName(role.name)
            })))
        );
    }

    getAllProgramStudi(): Observable<ScopeOption[]> {
        return this.apiService.getAllProgramStudi().pipe(
            map((response: ApiResponse<ApiScopeItem[]>) => {
                if (response && Array.isArray(response.data)) {
                    return response.data.map(item => ({
                        id: item.id,
                        name: item.nama
                    }));
                }
                return [];
            })
        );
    }

    getAllKelompokKeahlian(): Observable<ScopeOption[]> {
        return this.apiService.getAllKelompokKeahlian().pipe(
            map((response: ApiResponse<ApiScopeItem[]>) => {
                if (response && Array.isArray(response.data)) {
                    return response.data.map(item => ({
                        id: item.id,
                        name: item.nama
                    }));
                }
                return [];
            })
        );
    }

    isValidRole(roleName: string): boolean {
        return Object.keys(this.roleDisplayNames).includes(roleName);
    }

    getRoleColor(roleName: string): string {
        const displayName = this.getRoleDisplayName(roleName).toLowerCase();

        if (displayName.includes('kaur lab')) return 'var(--red)';
        if (displayName.includes('ket. kk')) return 'var(--blue)';
        if (displayName.includes('kaprodi')) return 'var(--green)';
        if (displayName.includes('laa')) return 'var(--yellow)';
        if (displayName.includes('admin')) return 'var(--purple)';
        return 'var(--grey)';
    }
}