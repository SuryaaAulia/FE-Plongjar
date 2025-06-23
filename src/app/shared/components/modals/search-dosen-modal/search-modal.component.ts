import { Component, EventEmitter, Output, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, map } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { Lecturer } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { SearchNotFoundComponent } from '../../search-not-found/search-not-found.component';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    SearchNotFoundComponent
  ],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.scss',
})
export class SearchModalComponent implements OnInit, OnDestroy {
  @Output() lecturerSelected = new EventEmitter<Lecturer>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() coordinatorAssigned = new EventEmitter<Lecturer>();

  @Input() mode: 'coordinator' | 'dosen' | null = null;
  @Input() courseId: number | null = null;
  @Input() academicYearId: number | null = null;

  private apiService = inject(ApiService);

  searchNameTerm: string = '';
  searchCodeTerm: string = '';
  searchKeyword: string = '';
  hasSearched: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  searchResults: Lecturer[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  private searchTerms$ = new Subject<void>();
  private searchSubscription!: Subscription;

  ngOnInit(): void {
    if (this.mode === 'coordinator') {
      if (this.courseId === null || this.academicYearId === null) {
        throw new Error('courseId and academicYearId are required in coordinator mode.');
      }
    }

    this.setupSearchDebounce();
  }


  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  private setupSearchDebounce(): void {
    this.searchSubscription = this.searchTerms$.pipe(
      debounceTime(400),
      map(() => `${this.searchNameTerm.trim()}|${this.searchCodeTerm.trim()}`),
      distinctUntilChanged(),
      tap(() => {
        const name = this.searchNameTerm.trim();
        const code = this.searchCodeTerm.trim();
        this.searchKeyword = [name, code].filter(Boolean).join(', ');
      }),
      switchMap(() => this.fetchData(1))
    ).subscribe();
  }

  private fetchData(page: number) {
    const name = this.searchNameTerm.trim();
    const code = this.searchCodeTerm.trim();

    if (name === '' && code === '') {
      this.resetModalState(false);
      return of(null);
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.error = null;
    this.currentPage = page;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('per_page', this.itemsPerPage.toString());
    if (name) params = params.set('nama', name);
    if (code) params = params.set('kode_dosen', code);

    return this.apiService.getAllDosen(params).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.searchResults = response.data.data.map((item: any) => ({
              ...item,
              lecturerCode: item.lecturer_code
            }));
            this.totalItems = response.data.total;
            this.currentPage = response.data.current_page;
          } else {
            this.handleError('Received a successful response but with no data.');
          }
        },
        error: (err) => {
          this.handleError('Failed to fetch lecturers. Please try again later.');
          console.error(err);
        }
      }),
      finalize(() => this.isLoading = false)
    );
  }

  onSearchTermChange(): void {
    this.searchTerms$.next();
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.fetchData(this.currentPage + 1).subscribe();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.fetchData(this.currentPage - 1).subscribe();
    }
  }

  private handleError(message: string): void {
    this.error = message;
    this.searchResults = [];
    this.totalItems = 0;
  }

  selectAndClose(lecturer: Lecturer): void {
    console.log('Mode:', this.mode, 'Course ID:', this.courseId, 'Year ID:', this.academicYearId);

    if (this.mode === 'coordinator' && this.courseId && this.academicYearId) {
      this.isLoading = true;
      const payload = {
        id_dosen: lecturer.id,
        id_tahun_ajaran: this.academicYearId,
        id_matakuliah: this.courseId
      };

      this.apiService.assignKoordinatorByProdiAuth(payload).subscribe({
        next: (response) => {
          console.log('Coordinator assigned successfully via modal:', response);
          this.coordinatorAssigned.emit(lecturer);
          this.resetModalState(true);
        },
        error: (err) => {
          console.error('Failed to assign coordinator via modal:', err);
          alert(`Failed to assign coordinator: ${err.message || 'Unknown error'}. The lecturer will be selected in the UI, but the assignment failed.`);
          this.lecturerSelected.emit(lecturer);
          this.resetModalState(true);
        }
      });
    } else {
      this.lecturerSelected.emit(lecturer);
      this.resetModalState(true);
    }
  }

  requestClose(): void {
    this.resetModalState(true);
  }

  private resetModalState(shouldEmitClose: boolean): void {
    this.searchNameTerm = '';
    this.searchCodeTerm = '';
    this.searchKeyword = '';
    this.hasSearched = false;
    this.isLoading = false;
    this.error = null;
    this.searchResults = [];
    this.totalItems = 0;
    this.currentPage = 1;
    if (shouldEmitClose) {
      this.closeModal.emit();
    }
  }

  get displayedItemsStart(): number {
    return this.totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
  }

  get displayedItemsEnd(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }
}