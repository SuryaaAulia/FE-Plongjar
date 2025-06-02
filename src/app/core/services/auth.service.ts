import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

export type UserRole = 'Superadmin' | 'ProgramStudi' | 'KelompokKeahlian' | 'LayananAkademik' | 'KepalaUrusanLab';

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Role {
    role_id: number;
    role_name: UserRole;
    roleable_type: string | null;
    roleable_id: number | null;
    roleable_name: string | null;
}

export interface LoginResponse {
    status: string;
    message: string;
    token: {
        accessToken: {
            name: string;
            abilities: string[];
            expires_at: string | null;
            tokenable_id: number;
            tokenable_type: string;
            updated_at: string;
            created_at: string;
            id: number;
        };
        plainTextToken: string;
    };
    user: User;
    roles: Role[];
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    currentRole?: Role;
    token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';

    private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const userStr = localStorage.getItem(this.USER_KEY);

        if (token && userStr) {
            try {
                const user: AuthUser = JSON.parse(userStr);
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Error loading user from storage:', error);
                this.logout();
            }
        }
    }

    login(email: string, password: string): Observable<LoginResponse> {
        return this.apiService.login(email, password).pipe(
            tap(response => {
                if (response.status === 'success') {
                    this.handleLoginSuccess(response);
                }
            }),
            catchError(error => {
                console.error('Login error:', error);
                return throwError(() => error);
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.apiService.register(userData).pipe(
            catchError(error => {
                console.error('Registration error:', error);
                return throwError(() => error);
            })
        );
    }

    private handleLoginSuccess(response: LoginResponse): void {
        const authUser: AuthUser = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            roles: response.roles,
            currentRole: response.roles[0],
            token: response.token.plainTextToken
        };

        localStorage.setItem(this.TOKEN_KEY, response.token.plainTextToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authUser));

        this.currentUserSubject.next(authUser);

        this.navigateToRoleBasedRoute(authUser.currentRole!.role_name);
    }

    private navigateToRoleBasedRoute(role: UserRole): void {
        const roleRoutes: Record<UserRole, string> = {
            'Superadmin': '/admin',
            'ProgramStudi': '/ketua-prodi',
            'KelompokKeahlian': '/ketua-kk',
            'LayananAkademik': '/laak',
            'KepalaUrusanLab': '/kaur-lab'
        };

        const route = roleRoutes[role] || '/home';
        this.router.navigate([route]);
    }

    logout(): void {
        this.apiService.logout().subscribe({
            next: () => console.log('Logout successful'),
            error: (error) => console.error('Logout error:', error)
        });

        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);

        this.currentUserSubject.next(null);

        this.router.navigate(['/auth/login']);
    }

    getCurrentUserFromAPI(): Observable<any> {
        return this.apiService.getCurrentUser().pipe(
            catchError(error => {
                console.error('Error fetching current user:', error);
                return throwError(() => error);
            })
        );
    }

    isAuthenticated(): boolean {
        return !!this.currentUserSubject.value?.token;
    }

    getToken(): string | null {
        return this.currentUserSubject.value?.token || null;
    }

    getCurrentUser(): AuthUser | null {
        return this.currentUserSubject.value;
    }

    getCurrentRole(): Role | null {
        return this.currentUserSubject.value?.currentRole || null;
    }

    hasRole(roleName: UserRole): boolean {
        const user = this.currentUserSubject.value;
        return !!user?.roles.some(role => role.role_name === roleName);
    }

    hasAnyRole(roleNames: UserRole[]): boolean {
        const user = this.currentUserSubject.value;
        return !!user?.roles.some(role => roleNames.includes(role.role_name));
    }

    switchRole(role: Role): void {
        const user = this.currentUserSubject.value;
        if (user && user.roles.some(r => r.role_id === role.role_id)) {
            const updatedUser = { ...user, currentRole: role };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
            this.navigateToRoleBasedRoute(role.role_name);
        }
    }

    getNavRole(): keyof typeof import('../services/nav.service').NavService.prototype.menuConfig {
        const currentRole = this.getCurrentRole()?.role_name;

        const roleMapping: Record<UserRole, string> = {
            'Superadmin': 'admin',
            'ProgramStudi': 'ketua_prodi',
            'KelompokKeahlian': 'ketua_kk',
            'LayananAkademik': 'laak',
            'KepalaUrusanLab': 'kaur_lab'
        };

        return (roleMapping[currentRole!] as any) || 'admin';
    }

    getAllRoles(): Observable<any> {
        return this.apiService.getAllRoles().pipe(
            catchError(error => {
                console.error('Error fetching roles:', error);
                return throwError(() => error);
            })
        );
    }

    getAllUsers(): Observable<any> {
        return this.apiService.getAllUsers().pipe(
            catchError(error => {
                console.error('Error fetching users:', error);
                return throwError(() => error);
            })
        );
    }

    getAllAssignedUserRoles(): Observable<any> {
        return this.apiService.getAllAssignedUserRoles().pipe(
            catchError(error => {
                console.error('Error fetching assigned user roles:', error);
                return throwError(() => error);
            })
        );
    }

    getAllUnassignedUsers(): Observable<any> {
        return this.apiService.getAllUnassignedUsers().pipe(
            catchError(error => {
                console.error('Error fetching unassigned users:', error);
                return throwError(() => error);
            })
        );
    }

    getAllUsersByRole(roleId: number): Observable<any> {
        return this.apiService.getAllUsersByRole(roleId).pipe(
            catchError(error => {
                console.error('Error fetching users by role:', error);
                return throwError(() => error);
            })
        );
    }

    assignRole(userId: number, roleId: number, roleableType?: string, roleableId?: number): Observable<any> {
        const data = {
            user_id: userId,
            role_id: roleId,
            roleable_type: roleableType,
            roleable_id: roleableId
        };

        return this.apiService.assignRole(data).pipe(
            catchError(error => {
                console.error('Error assigning role:', error);
                return throwError(() => error);
            })
        );
    }

    revokeRole(userId: number, roleId: number): Observable<any> {
        const data = {
            user_id: userId,
            role_id: roleId
        };

        return this.apiService.revokeRole(data).pipe(
            catchError(error => {
                console.error('Error revoking role:', error);
                return throwError(() => error);
            })
        );
    }

    refreshUserData(): Observable<any> {
        return this.getCurrentUserFromAPI().pipe(
            tap(response => {
                const currentUser = this.getCurrentUser();
                if (currentUser && response.user) {
                    const updatedUser: AuthUser = {
                        ...currentUser,
                        id: response.user.id,
                        name: response.user.name,
                        email: response.user.email,
                        roles: response.roles || currentUser.roles
                    };

                    this.currentUserSubject.next(updatedUser);
                    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                }
            })
        );
    }

    canAccessRole(requiredRole: UserRole): boolean {
        return this.hasRole(requiredRole);
    }

    canAccessAnyRole(requiredRoles: UserRole[]): boolean {
        return this.hasAnyRole(requiredRoles);
    }

    getRoleContext(): { type: string | null, id: number | null, name: string | null } | null {
        const currentRole = this.getCurrentRole();
        if (!currentRole) return null;

        return {
            type: currentRole.roleable_type,
            id: currentRole.roleable_id,
            name: currentRole.roleable_name
        };
    }

    hasRoleContext(roleType: string, roleId: number): boolean {
        const user = this.getCurrentUser();
        return !!user?.roles.some(role =>
            role.roleable_type === roleType && role.roleable_id === roleId
        );
    }
}