import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss'],
})
export class SearchHeaderComponent {
  @Input() placeholder: string = 'Search...';
  @Input() itemsPerPage: number = 9;
  @Output() search = new EventEmitter<{ nama: string; kode: string }>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  searchQueryNama: string = '';
  searchQueryKode: string = '';
  showDropdown: boolean = false;
  pageSizeOptions: number[] = [5, 9, 15, 30, 50];

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  onSearch(): void {
    this.search.emit({
      nama: this.searchQueryNama,
      kode: this.searchQueryKode,
    });
  }

  clearSearch(): void {
    this.searchQueryNama = '';
    this.searchQueryKode = '';
    this.search.emit({ nama: '', kode: '' });
  }

  changeItemsPerPage(size: number): void {
    this.itemsPerPage = size;
    this.itemsPerPageChange.emit(size);
    this.showDropdown = false;
  }
}
