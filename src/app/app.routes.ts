import { Routes } from '@angular/router';

// Layouts
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

// Guards
import { AuthGuard, RoleGuard, LoginGuard } from '../app/core/guards/auth.guard';

// Page Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NoRoleComponent } from './pages/no-role/no-role.component';
import { LoginComponent } from './pages/login/login.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { ServerErrorComponent } from './pages/server-error/server-error.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

// Feature Components (Admin)
import { AssignRoleComponent } from './features/admin/assign-role/assign-role.component';
import { ManageRoleComponent } from './features/admin/manage-role/manage-role.component';
import { AssignJabatanComponent } from './features/admin/assign-jabatan/assign-jabatan.component';
import { TambahJabatanComponent } from './features/admin/tambah-jabatan/tambah-jabatan.component';
import { ManageTahunAjaranComponent } from './features/admin/manage-tahun-ajaran/manage-tahun-ajaran.component';
import { TambahProdiComponent } from './features/admin/tambah-prodi/tambah-prodi.component';

// Feature Components (Shared)
import { ListDosenComponent } from './features/shared-pages/list-dosen/list-dosen.component';
import { DetailDosenComponent } from './features/shared-pages/detail-dosen/detail-dosen.component';
import { RiwayatMengajarComponent } from './features/shared-pages/riwayat-mengajar/riwayat-mengajar.component';
import { PlottingComponent } from './features/shared-pages/plotting/plotting.component';
import { HasilPlottingComponent } from './features/shared-pages/hasil-plotting/hasil-plotting.component';
import { BebanSksComponent } from './features/shared-pages/beban-sks/beban-sks.component';
import { RekapPlottingComponent } from './features/shared-pages/rekap-plotting/rekap-plotting.component';

// Feature Components (Kaprodi)
import { TambahMatkulComponent } from './features/kaprodi/tambah-matkul/tambah-matkul.component';
import { MappingMatkulComponent } from './features/kaprodi/mapping-matkul/mapping-matkul.component';
import { ManageMatkulComponent } from './features/kaprodi/manage-matkul/manage-matkul.component';
import { DetailMatkulComponent } from './features/kaprodi/detail-matkul/detail-matkul.component';

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
        path: 'no-role',
        loadComponent: () =>
          import('./pages/no-role/no-role.component').then(
            (c) => c.NoRoleComponent
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
          {
            path: 'tambah-prodi',
            loadComponent: () =>
              import('./features/admin/tambah-prodi/tambah-prodi.component').then(
                (m) => m.TambahProdiComponent
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
                './features/shared-pages/beban-sks/beban-sks.component'
              ).then((m) => m.BebanSksComponent),
          },
          {
            path: 'beban-sks/:dosenId',
            loadComponent: () => import('./features/shared-pages/beban-sks/beban-sks.component').then(m => m.BebanSksComponent)
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
                './features/shared-pages/beban-sks/beban-sks.component'
              ).then((m) => m.BebanSksComponent),
          },
          {
            path: 'beban-sks/:dosenId',
            loadComponent: () => import('./features/shared-pages/beban-sks/beban-sks.component').then(m => m.BebanSksComponent)
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
            path: 'hasil-plotting/:prodiId/:tahunAjaranId',
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
          {
            path: 'rekap-hasil-plotting',
            loadComponent: () =>
              import(
                './features/shared-pages/rekap-plotting/rekap-plotting.component'
              ).then((m) => m.RekapPlottingComponent),
          },
          {
            path: 'hasil-plotting/:prodiId/:tahunAjaranId',
            loadComponent: () =>
              import(
                './features/shared-pages/hasil-plotting/hasil-plotting.component'
              ).then((m) => m.HasilPlottingComponent),
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
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: 'server-error',
    loadComponent: () => import('./pages/server-error/server-error.component').then(m => m.ServerErrorComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

// export const routes: Routes = [
//   {
//     path: '',
//     component: MainLayoutComponent,
//     canActivate: [AuthGuard],
//     canActivateChild: [AuthGuard],
//     children: [
//       {
//         path: '',
//         redirectTo: 'home',
//         pathMatch: 'full',
//       },
//       {
//         path: 'home',
//         component: DashboardComponent,
//       },
//       {
//         path: 'no-role',
//         component: NoRoleComponent,
//       },
//       {
//         path: 'admin',
//         canActivate: [RoleGuard],
//         data: { role: 'Superadmin' },
//         children: [
//           {
//             path: '',
//             redirectTo: 'assign',
//             pathMatch: 'full',
//           },
//           {
//             path: 'assign',
//             component: AssignRoleComponent,
//           },
//           {
//             path: 'manage-role',
//             component: ManageRoleComponent,
//           },
//           {
//             path: 'assign-jabatan',
//             component: AssignJabatanComponent,
//           },
//           {
//             path: 'tambah-jabatan',
//             component: TambahJabatanComponent,
//           },
//           {
//             path: 'tahun-ajaran',
//             component: ManageTahunAjaranComponent,
//           },
//           {
//             path: 'tambah-prodi',
//             component: TambahProdiComponent,
//           },
//         ],
//       },
//       {
//         path: 'ketua-kk',
//         canActivate: [RoleGuard],
//         data: { role: 'KelompokKeahlian' },
//         children: [
//           {
//             path: '',
//             redirectTo: 'list-dosen',
//             pathMatch: 'full',
//           },
//           {
//             path: 'list-dosen',
//             component: ListDosenComponent,
//           },
//           {
//             path: 'detail-dosen/:id',
//             component: DetailDosenComponent,
//           },
//           {
//             path: 'riwayat-mengajar/:id',
//             component: RiwayatMengajarComponent,
//           },
//           {
//             path: 'plotting',
//             component: PlottingComponent,
//           },
//           {
//             path: 'hasil-plotting',
//             component: HasilPlottingComponent,
//           },
//           {
//             path: 'beban-sks',
//             component: BebanSksComponent,
//           },
//           {
//             path: 'beban-sks/:dosenId',
//             component: BebanSksComponent,
//           },
//         ],
//       },
//       {
//         path: 'ketua-prodi',
//         canActivate: [RoleGuard],
//         data: { role: 'ProgramStudi' },
//         children: [
//           {
//             path: '',
//             redirectTo: 'list-dosen',
//             pathMatch: 'full',
//           },
//           {
//             path: 'list-dosen',
//             component: ListDosenComponent,
//           },
//           {
//             path: 'riwayat-mengajar/:id',
//             component: RiwayatMengajarComponent,
//           },
//           {
//             path: 'detail-dosen/:id',
//             component: DetailDosenComponent,
//           },
//           {
//             path: 'plotting',
//             component: PlottingComponent,
//           },
//           {
//             path: 'hasil-plotting',
//             component: HasilPlottingComponent,
//           },
//           {
//             path: 'beban-sks',
//             component: BebanSksComponent,
//           },
//           {
//             path: 'beban-sks/:dosenId',
//             component: BebanSksComponent,
//           },
//           {
//             path: 'tambah-matkul',
//             component: TambahMatkulComponent,
//           },
//           {
//             path: 'matkul/edit/:id',
//             component: TambahMatkulComponent,
//           },
//           {
//             path: 'mapping-matkul',
//             component: MappingMatkulComponent,
//           },
//           {
//             path: 'manage-matkul',
//             component: ManageMatkulComponent,
//           },
//           {
//             path: 'detail-matkul/:id',
//             component: DetailMatkulComponent,
//           },
//         ],
//       },
//       {
//         path: 'kaur-lab',
//         canActivate: [RoleGuard],
//         data: { role: 'KepalaUrusanLab' },
//         children: [
//           {
//             path: '',
//             redirectTo: 'rekap-hasil-plotting',
//             pathMatch: 'full',
//           },
//           {
//             path: 'rekap-hasil-plotting',
//             component: RekapPlottingComponent,
//           },
//           {
//             path: 'hasil-plotting/:prodiId/:tahunAjaranId',
//             component: HasilPlottingComponent,
//           },
//         ],
//       },
//       {
//         path: 'laak',
//         canActivate: [RoleGuard],
//         data: { role: 'LayananAkademik' },
//         children: [
//           {
//             path: '',
//             redirectTo: 'dashboard',
//             pathMatch: 'full',
//           },
//           {
//             path: 'dashboard',
//             component: DashboardComponent,
//           },
//           {
//             path: 'rekap-hasil-plotting',
//             component: RekapPlottingComponent,
//           },
//           {
//             path: 'hasil-plotting/:prodiId/:tahunAjaranId',
//             component: HasilPlottingComponent,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     path: 'auth',
//     component: AuthLayoutComponent,
//     children: [
//       {
//         path: '',
//         redirectTo: 'login',
//         pathMatch: 'full',
//       },
//       {
//         path: 'login',
//         canActivate: [LoginGuard],
//         component: LoginComponent,
//       },
//     ],
//   },
//   {
//     path: 'unauthorized',
//     component: ForbiddenComponent,
//   },
//   {
//     path: 'server-error',
//     component: ServerErrorComponent,
//   },
//   {
//     path: '**',
//     component: NotFoundComponent,
//   },
// ];