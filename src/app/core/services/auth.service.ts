import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'admin' | 'ketua_kk' | 'ketua_prodi' | 'LAAK' | 'kaurlab';

export interface User {
    id?: string;
    name?: string;
    email?: string;
    role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User>({ role: 'admin' });

    currentUser$ = this.currentUserSubject.asObservable();

    get currentUserRole(): UserRole {
        return this.currentUserSubject.value.role;
    }

    setRole(role: UserRole) {
        const currentUser = this.currentUserSubject.value;
        this.currentUserSubject.next({ ...currentUser, role });
    }

    login(email: string, password: string) {
        let role: UserRole;

        if (email.includes('admin')) {
            role = 'admin';
        } else if (email.includes('lecturer')) {
            role = 'ketua_kk';
        } else if (email.includes('kaprodi')) {
            role = 'ketua_prodi';
        } else if (email.includes('laak')) {
            role = 'LAAK';
        } else if (email.includes('kaurlab')) {
            role = 'kaurlab';
        }

        const user: User = {
            id: '123',
            name: 'Test User',
            email,
            role: 'LAAK',
        };

        this.currentUserSubject.next(user);
        return true;
    }

    logout() {

    }
}