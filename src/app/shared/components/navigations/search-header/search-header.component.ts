import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss'],
})
export class SearchHeaderComponent implements OnInit, OnDestroy {
  @Input() title = 'Search Area';
  @Input() itemsPerPage: number = 9;
  @Input() pageSizeOptions: number[] = [5, 9, 15, 30, 50];
  @Input() searchType: 'lecturer' | 'teaching' = 'lecturer';
  @Input() placeholder1: string = '';
  @Input() placeholder2: string = '';
  @Input() debounceTime: number = 300;
  @Input() showSecondInput: boolean = true;

  @Output() search = new EventEmitter<{ query1: string; query2: string }>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  query1: string = '';
  query2: string = '';
  showDropdown: boolean = false;

  private searchSubject = new Subject<{ query1: string; query2: string }>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updatePlaceholders();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchType']) {
      this.updatePlaceholders();
    }
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(
          (prev, curr) =>
            prev.query1.trim() === curr.query1.trim() &&
            prev.query2.trim() === curr.query2.trim()
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((searchQueries) => {
        this.search.emit(searchQueries);
      });
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

  onSearchInput(): void {
    this.searchSubject.next({
      query1: this.query1,
      query2: this.showSecondInput ? this.query2 : '',
    });
  }

  onSearch(): void {
    this.search.emit({
      query1: this.query1,
      query2: this.showSecondInput ? this.query2 : '',
    });
  }

  clearSearch(): void {
    this.query1 = '';
    this.query2 = '';
    this.search.emit({ query1: '', query2: '' });
  }

  changeItemsPerPage(size: number): void {
    this.itemsPerPage = size;
    this.itemsPerPageChange.emit(size);
    this.showDropdown = false;
  }

  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showDropdown = false;
    }
  }
}