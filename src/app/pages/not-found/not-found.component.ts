import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../shared/components/error-page/error-page.component';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ErrorPageComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent { }
