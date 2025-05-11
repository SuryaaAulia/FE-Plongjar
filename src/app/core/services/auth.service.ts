import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'admin' | 'lecturer' | 'student';

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
        let role: UserRole = 'student';

        if (email.includes('admin')) {
            role = 'admin';
        } else if (email.includes('lecturer')) {
            role = 'lecturer';
        }

        const user: User = {
            id: '123',
            name: 'Test User',
            email,
            role
        };

        this.currentUserSubject.next(user);
        return true;
    }

    logout() {
        this.currentUserSubject.next({ role: 'student' });
    }
}