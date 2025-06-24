import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavService {
  readonly menuConfig = {
    admin: [
      { label: 'Home', icon: 'house', routerLink: '/home' },
      {
        label: 'Roles',
        icon: 'user-group',
        routerLink: '',
        children: [
          { label: 'Assign', routerLink: '/admin/assign' },
          { label: 'Manage Role', routerLink: '/admin/manage-role' },
        ],
      },
      {
        label: 'Jabatan',
        icon: 'sitemap',
        routerLink: '',
        children: [
          { label: 'Add Jabatan', routerLink: '/admin/tambah-jabatan' },
          { label: 'Assign', routerLink: '/admin/assign-jabatan' },
        ],
      },
      { label: 'Tahun Ajaran', icon: 'calendar-days', routerLink: '/admin/tahun-ajaran' },
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
        label: 'Dosen',
        icon: 'user-group',
        routerLink: '',
        children: [
          { label: 'List Dosen', routerLink: '/ketua-prodi/list-dosen' },
        ],
      },
      {
        label: 'Plotting',
        icon: 'table-list',
        routerLink: '',
        children: [
          { label: 'Start Plotting', routerLink: '/ketua-prodi/plotting' },
          { label: 'Beban SKS', routerLink: '/ketua-prodi/beban-sks' }, 
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
        label: 'Hasil Plotting',
        icon: 'table-list',
        routerLink: '/kaur-lab/rekap-hasil-plotting'
      },
    ],
    laak: [
      { label: 'Home', icon: 'house', routerLink: '/home' },
      {
        label: 'Layanan Akademik',
        icon: 'academic-cap',
        routerLink: '',
        children: [
          { label: 'Dashboard', routerLink: '/laak/dashboard' },
        ],
      },
    ],
  };

  getMenu(role: keyof typeof this.menuConfig = 'admin') {
    return of(this.menuConfig[role] || this.menuConfig.admin);
  }
}