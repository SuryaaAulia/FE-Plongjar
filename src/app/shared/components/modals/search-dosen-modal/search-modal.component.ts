import { Component, EventEmitter, Output, Input, inject, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, map } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { PlottingService } from '../../../../core/services/plotting.service';
import { NotificationService } from '../../../../core/services/notification.service'; // Import NotificationService
import { Lecturer } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { SearchNotFoundComponent } from '../../search-not-found/search-not-found.component';
import { PaginationComponent } from '../../index';
import { FormInputComponent, SelectOption } from '../../form-input/form-input.component';

export interface TeamTeachingSelection {
  plottingId?: number;
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

  private apiService = inject(ApiService);
  private plottingService = inject(PlottingService);
  private notificationService = inject(NotificationService);

  @Output() lecturerSelected = new EventEmitter<Lecturer>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() coordinatorAssigned = new EventEmitter<Lecturer>();
  @Output() teamLecturersSelected = new EventEmitter<TeamTeachingSelection[]>();
  @Output() coordinatorUnassigned = new EventEmitter<void>();
  @Output() assignmentChanged = new EventEmitter<void>();

  @Input() mode: 'coordinator' | 'dosen' | null = null;
  @Input() courseId: number | null = null;
  @Input() academicYearId: number | null = null;
  @Input() isTeamTeaching: boolean = false;
  @Input() totalSks: number = 0;
  @Input() initialSelections: TeamTeachingSelection[] = [];

  searchNameTerm: string = '';
  searchCodeTerm: string = '';
  searchKeyword: string = '';
  hasSearched: boolean = false;
  isLoading: boolean = false;
  public hasChanges: boolean = false;

  searchResults: Lecturer[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  selectedLecturers = new Map<number, TeamTeachingSelection>();
  sksOptions: SelectOption[] = [];

  private searchTerms$ = new Subject<void>();
  private searchSubscription!: Subscription;
  private assignedLecturerIds = new Set<number>();

  ngOnInit(): void {
    if (this.mode === 'coordinator' && (this.courseId === null || this.academicYearId === null)) {
      throw new Error('courseId and academicYearId are required for coordinator mode.');
    }
    this.generateSksOptions();
    this.setupSearchDebounce();
    this.populateInitialSelections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalSks']) {
      this.generateSksOptions();
    }
    if (changes['initialSelections']) {
      this.populateInitialSelections();
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  get selectedLecturersArray(): TeamTeachingSelection[] {
    return Array.from(this.selectedLecturers.values());
  }

  public getInitialSks(lecturerId: number): number {
    const selection = this.initialSelections.find(s => s.lecturer.id === lecturerId);
    return selection ? selection.sks : 0;
  }

  private populateInitialSelections(): void {
    this.selectedLecturers.clear();
    this.assignedLecturerIds.clear();
    this.hasChanges = false;
    if (this.initialSelections && this.initialSelections.length > 0) {
      this.searchResults = this.initialSelections.map(selection => selection.lecturer);
      this.hasSearched = true;
      this.initialSelections.forEach(selection => {
        if (selection.lecturer?.id) {
          this.selectedLecturers.set(selection.lecturer.id, { ...selection });
          this.assignedLecturerIds.add(selection.lecturer.id);
        }
      });
    }
  }

  private generateSksOptions(): void {
    this.sksOptions = Array.from({ length: this.totalSks }, (_, i) => ({ value: i + 1, label: `${i + 1} SKS` }));
  }

  private setupSearchDebounce(): void {
    this.searchSubscription = this.searchTerms$.pipe(
      debounceTime(400),
      map(() => `${this.searchNameTerm.trim()}|${this.searchCodeTerm.trim()}`),
      distinctUntilChanged(),
      tap(() => this.searchKeyword = [this.searchNameTerm.trim(), this.searchCodeTerm.trim()].filter(Boolean).join(', ')),
      switchMap(() => this.fetchData(1))
    ).subscribe();
  }

  private fetchData(page: number) {
    const name = this.searchNameTerm.trim();
    const code = this.searchCodeTerm.trim();

    if (name === '' && code === '') {
      this.hasSearched = false;
      this.searchResults = [];
      this.totalItems = 0;
      this.currentPage = 1;
      return of(null);
    }

    this.isLoading = true;
    this.hasSearched = true;
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
            this.searchResults = response.data.data.map((item: any) => ({ /* ... mapping logic ... */ }));
            this.totalItems = response.data.total;
            this.currentPage = response.data.current_page;
          }
        },
        error: (err) => {
          console.error('Failed to fetch lecturers:', err);
          this.notificationService.showError('Failed to fetch lecturers. Please try again later.');
          this.searchResults = [];
          this.totalItems = 0;
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
    } else {
      this.lecturerSelected.emit(lecturer);
    }
    this.resetModalState(true);
  }

  public isAlreadyAssigned(lecturerId: number): boolean {
    return this.assignedLecturerIds.has(lecturerId);
  }

  toggleLecturerSelection(lecturer: Lecturer, event: Event): void {
    this.hasChanges = true;
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedLecturers.set(lecturer.id, { lecturer, sks: 1 });
    } else {
      this.selectedLecturers.delete(lecturer.id);
    }
  }

  updateSks(lecturerId: number, sksValue: string | number): void {
    this.hasChanges = true;
    const sksAsNumber = typeof sksValue === 'string' ? parseInt(sksValue, 10) : sksValue;
    if (this.selectedLecturers.has(lecturerId)) {
      this.selectedLecturers.get(lecturerId)!.sks = sksAsNumber;
    }
  }

  handleSubmitTeamTeaching(): void {
    const selections = this.selectedLecturersArray;
    if (selections.length === 0) {
      this.notificationService.showWarning('Please select at least one lecturer.');
      return;
    }
    const totalAssignedSks = selections.reduce((sum, item) => sum + item.sks, 0);
    if (totalAssignedSks > this.totalSks) {
      this.notificationService.showWarning(`Total assigned SKS (${totalAssignedSks}) cannot exceed the course's total SKS (${this.totalSks}).`);
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

  private resetModalState(shouldEmitClose: boolean, clearSelections: boolean = true): void {
    this.searchNameTerm = ''; this.searchCodeTerm = ''; this.searchKeyword = '';
    this.hasSearched = false; this.isLoading = false;
    this.searchResults = []; this.totalItems = 0; this.currentPage = 1;
    if (clearSelections) {
      this.selectedLecturers.clear();
    }
    if (shouldEmitClose) {
      this.closeModal.emit();
    }
  }

  getSelectedSks(lecturerId: number): number {
    return this.selectedLecturers.get(lecturerId)?.sks || 1;
  }

  removeLecturer(lecturerId: number): void {
    this.hasChanges = true;
    this.selectedLecturers.delete(lecturerId);
  }

  public unassignLecturer(lecturerId: number): void {
    const selection = this.selectedLecturers.get(lecturerId);
    if (!selection) return;

    if (this.mode === 'coordinator') {
      this.coordinatorUnassigned.emit();
      this.closeModal.emit();
      return;
    }

    const plottinganPengajaranId = selection.plottingId;
    if (!plottinganPengajaranId) {
      this.removeLecturer(lecturerId);
      return;
    }
    this.notificationService.showConfirmation(
      'Anda Yakin?',
      `Menghapus dosen "${selection.lecturer.name}" dari kelas ini?`,
      'Ya, Hapus'
    ).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.plottingService.unassignDosenFromPlotting(plottinganPengajaranId)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.notificationService.showSuccess(`Dosen "${selection.lecturer.name}" berhasil dihapus.`);
              this.assignmentChanged.emit();
            },
            error: (err) => {
              this.notificationService.showError(`Gagal menghapus dosen. Error: ${err.message}`);
            }
          });
      }
    });
  }
}