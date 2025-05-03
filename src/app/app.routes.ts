import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'admin/dashboard',
        loadComponent: () =>
          import('./features/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
      },
      {
        path: 'admin/assign',
        loadComponent: () =>
          import('./features/admin/assign-role/assign-role.component').then(
            (m) => m.AssignRoleComponent
          ),
      },
      {
        path: 'admin/manage-role',
        loadComponent: () =>
          import('./features/admin/manage-role/manage-role.component').then(
            (m) => m.ManageRoleComponent
          ),
      },
      {
        path: 'ketua-kk/dashboard',
        loadComponent: () =>
          import('./features/ketua-kk/ketua-kk.component').then(
            (m) => m.KetuaKkComponent
          ),
      },
      {
        path: 'ketua-kk/list-dosen',
        loadComponent: () =>
          import('./features/shared-pages/list-dosen/list-dosen.component').then(
            (m) => m.ListDosenComponent
          ),
      },
    ],
  },
];
