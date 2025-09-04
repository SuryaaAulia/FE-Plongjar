import { Component } from '@angular/core';
import { ActionButtonComponent } from '../../shared/components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  openUserManual() {
    const pdfUrl = 'assets/user_manual/User Manual Siplongjar V1.pdf';
    window.open(pdfUrl, '_blank');
  }
}
