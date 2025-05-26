import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSearchComponent, SearchQuery } from '../base-search/base-search.component';

@Component({
  selector: 'app-search-dosen',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseSearchComponent],
  templateUrl: './search-dosen.component.html',
  styleUrls: ['./search-dosen.component.scss'],
})
export class SearchDosenComponent {
  title = 'Search Dosen';
  itemsPerPage: number = 9;
  pageSizeOptions: number[] = [5, 9, 15, 30, 50];

  namaOrNip: string = '';
  kodeDosen: string = '';

  onSearch(): void {
    const query: SearchQuery = {
      namaOrNip: this.namaOrNip,
      kodeDosen: this.kodeDosen,
    };
    console.log('Search Dosen:', query);
  }

  clearSearch(): void {
    this.namaOrNip = '';
    this.kodeDosen = '';
    this.onSearch();
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage = size;
    console.log('Items per page changed to:', size);
  }
}