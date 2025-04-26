import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
            component: MainLayoutComponent,
        children: [
            {
                path: 'admin/dashboard',
                loadComponent: () => import('./features/admin/admin.component')
                .then(m => m.AdminComponent)
            },
            { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' }
        ]
    }
];