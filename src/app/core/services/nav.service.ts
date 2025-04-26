import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { NavItem } from '../models/nav-item.model';

@Injectable({ providedIn: 'root' })
export class NavService {

readonly menuConfig = {
    admin: [
            { label: 'Home', icon: '', routerLink: '/admin/dashboard' },
            { 
                label: 'Roles', 
                icon: 'user-group', 
                routerLink: '/admin/reports',
                children: [
                    { label: 'Assign', routerLink: '/admin/assign' },
                    { label: 'Manage Role', routerLink: '/admin/manage-role' }, 
                    { label: 'Permission', routerLink: '/admin/manage-permission' } 
                ]
            },
            { label: 'Switch App', icon: 'dashboard', routerLink: '/switch-app' },
        ],
    dosen: [
            { label: 'Home', icon: '', routerLink: '/dosen/dashboard' },
            { label: 'Reports', icon: 'chart-bar', routerLink: '/dosen/reports' },
            { label: 'Switch App', icon: 'dashboard', routerLink: '/switch-app' },
        ],
    };

    getMenu(role: keyof typeof this.menuConfig = 'admin') {
        return of(this.menuConfig[role]);
    }
}