import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

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
            './features/shared-pages/plotting/plotting.component'
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
      {
        path: 'ketua-prodi/detail-dosen/:id',
        loadComponent: () =>
          import(
            './features/shared-pages/detail-dosen/detail-dosen.component'
          ).then((m) => m.DetailDosenComponent),
      },
      {
        path: 'ketua-prodi/hasil-plotting',
        loadComponent: () =>
          import(
            './features/shared-pages/hasil-plotting/hasil-plotting.component'
          ).then((m) => m.HasilPlottingComponent),
      },
      {
        path: 'ketua-prodi/tambah-matkul',
        loadComponent: () =>
          import(
            './features/kaprodi/tambah-matkul/tambah-matkul.component'
          ).then((m) => m.TambahMatkulComponent),
      },
      {
        path: 'ketua-prodi/matkul/edit/:code',
        loadComponent: () =>
          import('./features/kaprodi/tambah-matkul/tambah-matkul.component')
            .then(m => m.TambahMatkulComponent)
      },
      {
        path: 'ketua-prodi/mapping-matkul',
        loadComponent: () =>
          import(
            './features/kaprodi/mapping-matkul/mapping-matkul.component'
          ).then((m) => m.MappingMatkulComponent),
      },
      {
        path: 'ketua-prodi/manage-matkul',
        loadComponent: () =>
          import(
            './features/kaprodi/manage-matkul/manage-matkul.component'
          ).then((m) => m.ManageMatkulComponent),
      },
      {
        path: 'ketua-prodi/detail-matkul/:code',
        loadComponent: () =>
          import(
            './features/kaprodi/detail-matkul/detail-matkul.component'
          ).then((m) => m.DetailMatkulComponent),
      },
      {
        path: 'kaur-lab/rekap-hasil-plotting',
        loadComponent: () =>
          import(
            './features/shared-pages/rekap-plotting/rekap-plotting.component'
          ).then((m) => m.RekapPlottingComponent),
      },
      {
        path: 'kaur-lab/hasil-plotting/:id',
        loadComponent: () =>
          import(
            './features/shared-pages/hasil-plotting/hasil-plotting.component'
          ).then((m) => m.HasilPlottingComponent),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then(
            (c) => c.LoginComponent
          ),
      }
    ],
  },
];
