import { Component, EventEmitter, Output, Input, inject, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, map } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { PlottingService } from '../../../../core/services/plotting.service';
import { Lecturer } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { SearchNotFoundComponent } from '../../search-not-found/search-not-found.component';
import { PaginationComponent } from '../../index';
import { FormInputComponent, SelectOption } from '../../form-input/form-input.component';

export interface TeamTeachingSelection {
  lecturer: Lecturer;
  sks: number;
}

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    SearchNotFoundComponent,
    PaginationComponent,
    FormInputComponent
  ],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.scss',
})
export class SearchModalComponent implements OnInit, OnDestroy, OnChanges {
  @Output() lecturerSelected = new EventEmitter<Lecturer>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() coordinatorAssigned = new EventEmitter<Lecturer>();
  @Output() teamLecturersSelected = new EventEmitter<TeamTeachingSelection[]>();

  @Input() mode: 'coordinator' | 'dosen' | null = null;
  @Input() courseId: number | null = null;
  @Input() academicYearId: number | null = null;
  @Input() isTeamTeaching: boolean = false;
  @Input() totalSks: number = 0;
  @Input() initialSelections: TeamTeachingSelection[] = [];

  private apiService = inject(ApiService);
  private plottingService = inject(PlottingService);

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

  selectedLecturers = new Map<number, TeamTeachingSelection>();
  sksOptions: SelectOption[] = [];

  private searchTerms$ = new Subject<void>();
  private searchSubscription!: Subscription;

  ngOnInit(): void {
    if (this.mode === 'coordinator' && (this.courseId === null || this.academicYearId === null)) {
      throw new Error('courseId and academicYearId are required in coordinator mode.');
    }
    this.generateSksOptions();
    this.setupSearchDebounce();
    this.populateInitialSelections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalSks']) {
      this.generateSksOptions();
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  private populateInitialSelections(): void {
    this.selectedLecturers.clear();

    if (this.initialSelections && this.initialSelections.length > 0) {
      this.initialSelections.forEach(selection => {
        if (selection.lecturer && typeof selection.lecturer.id === 'number') {
          this.selectedLecturers.set(selection.lecturer.id, {
            lecturer: selection.lecturer,
            sks: selection.sks
          });
        }
      });
    }
  }

  private generateSksOptions(): void {
    this.sksOptions = Array.from({ length: this.totalSks }, (_, i) => {
      const sks = i + 1;
      return { value: sks, label: `${sks} SKS` };
    });
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
  selectAndClose(lecturer: Lecturer): void {
    if (this.mode === 'coordinator') {
      this.coordinatorAssigned.emit(lecturer);
      this.resetModalState(true);
    } else {
      this.lecturerSelected.emit(lecturer);
      this.resetModalState(true);
    }
  }

  toggleLecturerSelection(lecturer: Lecturer, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedLecturers.set(lecturer.id, { lecturer, sks: 1 });
    } else {
      this.selectedLecturers.delete(lecturer.id);
    }
  }

  updateSks(lecturerId: number, sksValue: string | number): void {
    const sksAsNumber = typeof sksValue === 'string' ? parseInt(sksValue, 10) : sksValue;
    if (this.selectedLecturers.has(lecturerId)) {
      const selection = this.selectedLecturers.get(lecturerId)!;
      selection.sks = sksAsNumber;
    }
  }

  handleSubmitTeamTeaching(): void {
    const selections = Array.from(this.selectedLecturers.values());
    if (selections.length === 0) {
      alert('Please select at least one lecturer.');
      return;
    }

    const totalAssignedSks = selections.reduce((sum, item) => sum + item.sks, 0);
    if (totalAssignedSks > this.totalSks) {
      alert(`Total assigned SKS (${totalAssignedSks}) cannot exceed the course's total SKS (${this.totalSks}).`);
      return;
    }

    this.teamLecturersSelected.emit(selections);
    this.resetModalState(true);
  }

  requestClose(): void {
    this.resetModalState(true);
  }
  onPageChange(page: number): void {
    this.fetchData(page).subscribe();
  }
  private handleError(message: string): void {
    this.error = message;
    this.searchResults = [];
    this.totalItems = 0;
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
    this.selectedLecturers.clear();
    if (shouldEmitClose) {
      this.closeModal.emit();
    }
  }
  getSelectedSks(lecturerId: number): number {
    return this.selectedLecturers.get(lecturerId)?.sks || 1;
  }
}