import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss']
})
export class SearchHeaderComponent {
  @Input() title: string = '';
  @Input() itemsPerPage: number = 9;
  @Output() search = new EventEmitter<{ name: string, code: string }>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  searchName: string = '';
  searchCode: string = '';
  showDropdown: boolean = false;
  pageSizeOptions: number[] = [5, 9, 15, 30, 50];

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  onSearchClick(): void {
    this.search.emit({
      name: this.searchName,
      code: this.searchCode
    });
  }

  changeItemsPerPage(size: number): void {
    this.itemsPerPage = size;
    this.itemsPerPageChange.emit(size);
    this.showDropdown = false;
  }
}