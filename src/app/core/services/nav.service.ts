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
        ],
      },
      { label: 'Switch App', icon: 'dashboard', routerLink: '/switch-app' },
    ],
    ketua_kk: [
      { label: 'Home', icon: '', routerLink: '/ketua-kk/dashboard' },
      { label: 'Dosen', icon: 'user-group', routerLink: '/ketua-kk/list-dosen' },
      {
        label: 'Plotting',
        icon: 'user-group',
        routerLink: '',
        children: [
          { label: 'Start Plotting', routerLink: '/ketua-kk/plotting' },
          { label: 'Preview', routerLink: '/ketua-kk/manage-role' },
          { label: 'Beban SKS', routerLink: '/ketua-kk/detail-dosen/:id' },
        ],
      },
      { label: 'Switch App', icon: 'dashboard', routerLink: '/switch-app' },
    ],
  };

  getMenu(role: keyof typeof this.menuConfig = 'admin') {
    return of(this.menuConfig[role]);
  }
}
