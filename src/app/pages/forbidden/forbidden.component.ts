import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../shared/components/error-page/error-page.component';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [
    ErrorPageComponent
  ],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss'
})
export class ForbiddenComponent {

}
