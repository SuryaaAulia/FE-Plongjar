import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges } from '@angular/core'; // Import OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss'],
})
export class SearchHeaderComponent implements OnInit {
  @Input() title = 'Search Area';
  @Input() itemsPerPage: number = 9;
  @Input() pageSizeOptions: number[] = [5, 9, 15, 30, 50];
  @Input() searchType: 'lecturer' | 'teaching' = 'lecturer';

  @Input() placeholder1: string = '';
  @Input() placeholder2: string = '';

  @Output() search = new EventEmitter<{ query1: string; query2: string }>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  query1: string = '';
  query2: string = '';
  showDropdown: boolean = false;

  ngOnInit(): void {
    this.updatePlaceholders();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchType']) {
      this.updatePlaceholders();
    }
  }

  updatePlaceholders(): void {
    if (this.searchType === 'lecturer') {
      this.placeholder1 = this.placeholder1 || 'Nama/NIP';
      this.placeholder2 = this.placeholder2 || 'Kode Dosen';
    } else if (this.searchType === 'teaching') {
      this.placeholder1 = this.placeholder1 || 'Mata Kuliah/Kelas';
      this.placeholder2 = this.placeholder2 || 'Periode';
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  onSearch(): void {
    this.search.emit({
      query1: this.query1,
      query2: this.query2,
    });
  }

  clearSearch(): void {
    this.query1 = '';
    this.query2 = '';
    this.search.emit({ query1: '', query2: '' });
  }

  changeItemsPerPage(size: number): void {
    this.itemsPerPageChange.emit(size);
    this.showDropdown = false;
  }
}