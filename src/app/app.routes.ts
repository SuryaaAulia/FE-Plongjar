import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard, RoleGuard, LoginGuard } from '../app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
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
        path: 'admin',
        canActivate: [RoleGuard],
        data: { role: 'Superadmin' },
        children: [
          {
            path: '',
            redirectTo: 'assign',
            pathMatch: 'full',
          },
          {
            path: 'assign',
            loadComponent: () =>
              import('./features/admin/assign-role/assign-role.component').then(
                (m) => m.AssignRoleComponent
              ),
          },
          {
            path: 'manage-role',
            loadComponent: () =>
              import('./features/admin/manage-role/manage-role.component').then(
                (m) => m.ManageRoleComponent
              ),
          },
          {
            path: 'assign-jabatan',
            loadComponent: () =>
              import('./features/admin/assign-jabatan/assign-jabatan.component').then(
                (m) => m.AssignJabatanComponent
              ),
          },
          {
            path: 'tambah-jabatan',
            loadComponent: () =>
              import('./features/admin/tambah-jabatan/tambah-jabatan.component').then(
                (m) => m.TambahJabatanComponent
              ),
          },
          {
            path: 'tahun-ajaran',
            loadComponent: () =>
              import('./features/admin/manage-tahun-ajaran/manage-tahun-ajaran.component').then(
                (m) => m.ManageTahunAjaranComponent
              ),
          },
        ]
      },
      {
        path: 'ketua-kk',
        canActivate: [RoleGuard],
        data: { role: 'KelompokKeahlian' },
        children: [
          {
            path: '',
            redirectTo: 'list-dosen',
            pathMatch: 'full',
          },
          {
            path: 'list-dosen',
            loadComponent: () =>
              import(
                './features/shared-pages/list-dosen/list-dosen.component'
              ).then((m) => m.ListDosenComponent),
          },
          {
            path: 'detail-dosen/:id',
            loadComponent: () =>
              import(
                './features/shared-pages/detail-dosen/detail-dosen.component'
              ).then((m) => m.DetailDosenComponent),
          },
          {
            path: 'riwayat-mengajar/:id',
            loadComponent: () =>
              import(
                './features/shared-pages/riwayat-mengajar/riwayat-mengajar.component'
              ).then((m) => m.RiwayatMengajarComponent),
          },
          {
            path: 'plotting',
            loadComponent: () =>
              import(
                './features/shared-pages/plotting/plotting.component'
              ).then((m) => m.PlottingComponent),
          },
          {
            path: 'preview',
            loadComponent: () =>
              import(
                './features/shared-pages/preview/preview.component'
              ).then((m) => m.PreviewComponent),
          },
          {
            path: 'beban-sks',
            loadComponent: () =>
              import(
                './features/ketua-kk/beban-sks/beban-sks.component'
              ).then((m) => m.BebanSksComponent),
          },
        ]
      },
      {
        path: 'ketua-prodi',
        canActivate: [RoleGuard],
        data: { role: 'ProgramStudi' },
        children: [
          {
            path: '',
            redirectTo: 'list-dosen',
            pathMatch: 'full',
          },
          {
            path: 'preview',
            loadComponent: () =>
              import(
                './features/shared-pages/preview/preview.component'
              ).then((m) => m.PreviewComponent),
          },
          {
            path: 'list-dosen',
            loadComponent: () =>
              import(
                './features/shared-pages/list-dosen/list-dosen.component'
              ).then((m) => m.ListDosenComponent),
          },
          {
            path: 'riwayat-mengajar/:id',
            loadComponent: () =>
              import(
                './features/shared-pages/riwayat-mengajar/riwayat-mengajar.component'
              ).then((m) => m.RiwayatMengajarComponent),
          },
          {
            path: 'detail-dosen/:id',
            loadComponent: () =>
              import(
                './features/shared-pages/detail-dosen/detail-dosen.component'
              ).then((m) => m.DetailDosenComponent),
          },
          {
            path: 'plotting',
            loadComponent: () =>
              import(
                './features/shared-pages/plotting/plotting.component'
              ).then((m) => m.PlottingComponent),
          },
          {
            path: 'hasil-plotting',
            loadComponent: () =>
              import(
                './features/shared-pages/hasil-plotting/hasil-plotting.component'
              ).then((m) => m.HasilPlottingComponent),
          },
          {
            path: 'beban-sks',
            loadComponent: () =>
              import(
                './features/ketua-kk/beban-sks/beban-sks.component'
              ).then((m) => m.BebanSksComponent),
          },
          {
            path: 'tambah-matkul',
            loadComponent: () =>
              import(
                './features/kaprodi/tambah-matkul/tambah-matkul.component'
              ).then((m) => m.TambahMatkulComponent),
          },
          {
            path: 'matkul/edit/:id',
            loadComponent: () =>
              import('./features/kaprodi/tambah-matkul/tambah-matkul.component')
                .then(m => m.TambahMatkulComponent)
          },
          {
            path: 'mapping-matkul',
            loadComponent: () =>
              import(
                './features/kaprodi/mapping-matkul/mapping-matkul.component'
              ).then((m) => m.MappingMatkulComponent),
          },
          {
            path: 'manage-matkul',
            loadComponent: () =>
              import(
                './features/kaprodi/manage-matkul/manage-matkul.component'
              ).then((m) => m.ManageMatkulComponent),
          },
          {
            path: 'detail-matkul/:id',
            loadComponent: () =>
              import(
                './features/kaprodi/detail-matkul/detail-matkul.component'
              ).then((m) => m.DetailMatkulComponent),
          },
        ]
      },
      {
        path: 'kaur-lab',
        canActivate: [RoleGuard],
        data: { role: 'KepalaUrusanLab' },
        children: [
          {
            path: '',
            redirectTo: 'rekap-hasil-plotting',
            pathMatch: 'full',
          },
          {
            path: 'rekap-hasil-plotting',
            loadComponent: () =>
              import(
                './features/shared-pages/rekap-plotting/rekap-plotting.component'
              ).then((m) => m.RekapPlottingComponent),
          },
          {
            path: 'hasil-plotting/:id',
            loadComponent: () =>
              import(
                './features/shared-pages/hasil-plotting/hasil-plotting.component'
              ).then((m) => m.HasilPlottingComponent),
          },
        ]
      },
      {
        path: 'laak',
        canActivate: [RoleGuard],
        data: { role: 'LayananAkademik' },
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./pages/dashboard/dashboard.component').then(
                (c) => c.DashboardComponent
              ),
          },
        ]
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        canActivate: [LoginGuard],
        loadComponent: () =>
          import('./pages/login/login.component').then(
            (c) => c.LoginComponent
          ),
      }
    ],
  },
];