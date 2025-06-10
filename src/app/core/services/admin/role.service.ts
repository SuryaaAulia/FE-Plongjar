import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { Role, User } from '../../models/user.model';

export interface RoleAssignment {
    user_id: number;
    role_id: number;
    roleable_id: number;
    roleable_type: string;
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
                const users = response.data || [];

                users.forEach((user: UserWithRoles) => {
                    if (user.roles && user.roles.length > 1) {
                        console.warn(`User ${user.name} (ID: ${user.id}) has multiple roles:`, user.roles);
                        console.warn('Only the first role will be used for display purposes');
                    }
                });

                return users;
            }),
            catchError(error => {
                console.error('Error fetching users by role:', error);
                throw error;
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
        return this.apiService.assignRole(assignment).pipe(
            tap((response) => {
                console.log('Role assigned successfully:', response);
                // Refresh the assigned user roles data
                this.getAllAssignedUserRoles().subscribe();
            }),
            catchError(error => {
                console.error('Error assigning role:', error);
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
                console.log('Role revoked successfully:', response);
                // Refresh the assigned user roles data
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

    getRoleableInfo(roleId: number, roleName: string): { type: string, id: number } | null {
        const roleableMapping: { [key: string]: { type: string, id: number } } = {
            'ProgramStudi': { type: 'App\\Models\\ProgramStudi', id: 2 },
            'KelompokKeahlian': { type: 'App\\Models\\KelompokKeahlian', id: 1 },
        };

        return roleableMapping[roleName] || null;
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