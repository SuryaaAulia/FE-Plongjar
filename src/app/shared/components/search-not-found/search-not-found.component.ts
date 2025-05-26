import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-not-found.component.html',
  styleUrl: './search-not-found.component.scss'
})
export class SearchNotFoundComponent {
  @Input() keyword: string = '';
}
