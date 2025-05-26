import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { NavItem } from '../models/nav-item.model';

@Injectable({ providedIn: 'root' })
export class NavService {
  readonly menuConfig = {
    admin: [
      { label: 'Home', icon: 'house', routerLink: '/home' },
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
      { label: 'Home', icon: 'house', routerLink: '/home' },
      { label: 'Dosen', icon: 'user-group', routerLink: '/ketua-kk/list-dosen' },
      {
        label: 'Plotting',
        icon: 'table-list',
        routerLink: '',
        children: [
          { label: 'Start Plotting', routerLink: '/ketua-kk/plotting' },
          { label: 'Preview', routerLink: '/ketua-kk/preview' },
          { label: 'Beban SKS', routerLink: '/ketua-kk/beban-sks' },
        ],
      },
      { label: 'Switch App', icon: 'dashboard', routerLink: '/switch-app' },
    ],
    ketua_prodi: [
      { label: 'Home', icon: 'house', routerLink: '/home' },
      {
        label: 'Dosen', icon: 'user-group', routerLink: '', children: [
          { label: 'List Dosen', routerLink: '/ketua-prodi/list-dosen' },
        ],
      },
      {
        label: 'Plotting',
        icon: 'table-list',
        routerLink: '',
        children: [
          { label: 'Start Plotting', routerLink: '/ketua-kk/plotting' },
          { label: 'Preview', routerLink: '/ketua-prodi/preview' },
          { label: 'Hasil', routerLink: '/ketua-prodi/hasil-plotting' },
        ],
      },
      {
        label: 'Matkul',
        icon: 'graduation-cap',
        routerLink: '',
        children: [
          { label: 'Tambah Matkul', routerLink: '/ketua-prodi/tambah-matkul' },
          { label: 'Mapping', routerLink: '/ketua-prodi/mapping-matkul' },
          { label: 'Manage', routerLink: '/ketua-prodi/manage-matkul' },
        ],
      },
      { label: 'Switch App', icon: 'dashboard', routerLink: '/switch-app' },
    ],
    kaur_lab: [
      { label: 'Home', icon: 'house', routerLink: '/home' },
      {
        label: 'Hasil Plotting', icon: 'table-list', routerLink: 'kaur-lab/rekap-hasil-plotting'
      },
      { label: 'Switch App', icon: 'dashboard', routerLink: '/switch-app' },
    ],
  };

  getMenu(role: keyof typeof this.menuConfig = 'admin') {
    return of(this.menuConfig[role]);
  }
}
