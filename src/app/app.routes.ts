import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
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
          import(
            './features/shared-pages/list-dosen/list-dosen.component'
          ).then((m) => m.ListDosenComponent),
      },
      {
        path: 'ketua-kk/detail-dosen/:id',
        loadComponent: () =>
          import(
            './features/shared-pages/detail-dosen/detail-dosen.component'
          ).then((m) => m.DetailDosenComponent),
      },
      {
        path: 'ketua-kk/riwayat-mengajar/:id',
        loadComponent: () =>
          import(
            './features/shared-pages/riwayat-mengajar/riwayat-mengajar.component'
          ).then((m) => m.RiwayatMengajarComponent),
      },
      {
        path: 'ketua-kk/plotting',
        loadComponent: () =>
          import(
            './features/ketua-kk/plotting/plotting.component'
          ).then((m) => m.PlottingComponent),
      },
      {
        path: 'ketua-kk/preview',
        loadComponent: () =>
          import(
            './features/shared-pages/preview/preview.component'
          ).then((m) => m.PreviewComponent),
      },
      {
        path: 'ketua-kk/beban-sks',
        loadComponent: () =>
          import(
            './features/ketua-kk/beban-sks/beban-sks.component'
          ).then((m) => m.BebanSksComponent),
      },
      {
        path: 'ketua-prodi/preview',
        loadComponent: () =>
          import(
            './features/shared-pages/preview/preview.component'
          ).then((m) => m.PreviewComponent),
      },
      {
        path: 'ketua-prodi/list-dosen',
        loadComponent: () =>
          import(
            './features/shared-pages/list-dosen/list-dosen.component'
          ).then((m) => m.ListDosenComponent),
      },
      {
        path: 'ketua-prodi/riwayat-mengajar/:id',
        loadComponent: () =>
          import(
            './features/shared-pages/riwayat-mengajar/riwayat-mengajar.component'
          ).then((m) => m.RiwayatMengajarComponent),
      },
    ],
  },
];
