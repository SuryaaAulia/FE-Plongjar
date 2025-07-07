import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from '../buttons/action-button/action-button.component';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../../core/services/auth.service';


@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, ActionButtonComponent],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
  @Input() imageUrl: string = 'assets/images/404.svg';
  @Input() title: string = 'Error';
  @Input() message: string = 'Something went wrong.';
  @Input() showBackButton: boolean = true;

  private router = inject(Router);
  private authService = inject(AuthService);

  goBack(): void {
    const user = this.authService.getCurrentUser();
    const currentRole = user?.currentRole?.role_name;

    if (user && currentRole) {
      this.navigateToRoleBasedRoute(currentRole);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  private navigateToRoleBasedRoute(role: UserRole): void {
    const roleRoutes: Record<UserRole, string> = {
      'Superadmin': '/admin',
      'ProgramStudi': '/ketua-prodi',
      'KelompokKeahlian': '/ketua-kk',
      'LayananAkademik': '/laak',
      'KepalaUrusanLab': '/kaur-lab'
    };
    const route = roleRoutes[role] || '/home';
    this.router.navigate([route]);
  }
}