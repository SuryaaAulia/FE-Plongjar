import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService, UserRole } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkAuth(route, state);
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkAuth(route, state);
    }

    private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authService.currentUser$.pipe(
            take(1),
            map(user => {
                if (!user || !this.authService.isAuthenticated()) {
                    this.router.navigate(['/auth/login'], {
                        queryParams: { returnUrl: state.url }
                    });
                    return false;
                }
                const requiredRoles = route.data?.['roles'] as UserRole[];
                if (requiredRoles && requiredRoles.length > 0) {
                    const hasRequiredRole = this.authService.hasAnyRole(requiredRoles);
                    if (!hasRequiredRole) {
                        this.router.navigate(['/unauthorized']);
                        return false;
                    }
                }

                return true;
            })
        );
    }
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return this.authService.currentUser$.pipe(
            take(1),
            map(user => {
                if (!user) {
                    this.router.navigate(['/auth/login']);
                    return false;
                }

                const requiredRole = route.data?.['role'] as UserRole;
                if (requiredRole && !this.authService.hasRole(requiredRole)) {
                    this.router.navigate(['/unauthorized']);
                    return false;
                }

                return true;
            })
        );
    }
}

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): Observable<boolean> {
        return this.authService.currentUser$.pipe(
            take(1),
            map(user => {
                if (user && this.authService.isAuthenticated()) {
                    const currentRole = this.authService.getCurrentRole();
                    if (currentRole) {
                        this.router.navigate([this.getRoleBasedRoute(currentRole.role_name)]);
                    } else {
                        this.router.navigate(['/home']);
                    }
                    return false;
                }
                return true;
            })
        );
    }

    private getRoleBasedRoute(role: UserRole): string {
        const roleRoutes: Record<UserRole, string> = {
            'Superadmin': '/admin',
            'ProgramStudi': '/ketua-prodi',
            'KelompokKeahlian': '/ketua-kk',
            'LayananAkademik': '/laak',
            'KepalaUrusanLab': '/kaur-lab'
        };
        return roleRoutes[role] || '/home';
    }
}