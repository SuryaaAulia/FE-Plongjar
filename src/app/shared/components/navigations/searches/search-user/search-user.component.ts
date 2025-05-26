import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSearchComponent, SearchQuery } from '../base-search/base-search.component';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseSearchComponent],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss'],
})
export class SearchUserComponent {
  title = 'Search User';
  itemsPerPage: number = 9;
  pageSizeOptions: number[] = [5, 9, 15, 30, 50];

  namaOrEmail: string = '';

  onSearch(): void {
    const query: SearchQuery = {
      namaOrEmail: this.namaOrEmail,
    };
    console.log('Search User:', query);
  }

  clearSearch(): void {
    this.namaOrEmail = '';
    this.onSearch();
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage = size;
    console.log('Items per page changed to:', size);
  }
}