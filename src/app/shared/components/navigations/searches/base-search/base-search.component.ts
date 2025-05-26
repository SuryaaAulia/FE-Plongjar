import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SearchQuery {
  [key: string]: string;
}

@Component({
  selector: 'app-base-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-search.component.html',
  styleUrls: ['./base-search.component.scss'],
})
export class BaseSearchComponent {
  @Input() title = 'Search Area';
  @Input() itemsPerPage: number = 9;
  @Input() pageSizeOptions: number[] = [5, 9, 15, 30, 50];

  @Output() search = new EventEmitter<SearchQuery>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  showDropdown: boolean = false;

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  changeItemsPerPage(size: number): void {
    this.itemsPerPageChange.emit(size);
    this.showDropdown = false;
  }

  onSearch(): void {
    // To be implemented by child components
  }

  clearSearch(): void {
    // To be implemented by child components
  }
}