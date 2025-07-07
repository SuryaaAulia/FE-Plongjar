import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../shared/components/error-page/error-page.component';
@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [ErrorPageComponent],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss'
})
export class ServerErrorComponent {

}
