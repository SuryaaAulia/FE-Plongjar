import { Component, OnInit, Output, EventEmitter, ElementRef, HostListener, ViewChild, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';

import { Course, Lecturer, TahunAjaran } from '../../../../../core/models/user.model';
import { ApiService } from '../../../../../core/services/api.service';
import { MatakuliahService } from '../../../../../core/services/matakuliah.service';
import { NotificationService } from '../../../../../core/services/notification.service'; // Import NotificationService
import { LoadingSpinnerComponent, SearchNotFoundComponent, ActionButtonComponent } from '../../../index';

@Component({
  selector: 'app-search-matkul',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, SearchNotFoundComponent, ActionButtonComponent],
  templateUrl: './search-matkul.component.html',
  styleUrls: ['./search-matkul.component.scss']
})
export class SearchMatkulComponent implements OnInit {
  @Input() initialSearchTerm: string = '';
  @Output() selectionConfirmed = new EventEmitter<{ course: Course, academicYear: { id: number; value: string }, coordinator?: Lecturer; }>();
  @Output() selectionClosed = new EventEmitter<void>();
  @Output() searchCleared = new EventEmitter<void>();

  searchTerm: string = '';
  searchPlaceholder: string = 'Contoh: PEMROGRAMAN WEB';
  searchInputNote: string = '* Masukkan setidaknya 2 huruf untuk nama mata kuliah';

  filteredCourses: Course[] = [];
  selectedCourse: Course | null = null;
  academicYears: TahunAjaran[] = [];
  selectedAcademicYear: TahunAjaran | null = null;
  showDropdown: boolean = false;
  isLoading: boolean = false;
  isSearching: boolean = false;
  errorMessage: string = '';

  private searchSubject = new Subject<string>();
  @ViewChild('searchInput') searchInput!: ElementRef;

  private matakuliahService = inject(MatakuliahService);
  private elementRef = inject(ElementRef);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(searchTerm => {
      if (this.selectedCourse && searchTerm === `${this.selectedCourse.code} - ${this.selectedCourse.name}`) return;
      this.performSearch(searchTerm);
    });
  }

  ngOnInit(): void {
    if (this.initialSearchTerm) {
      this.searchTerm = this.initialSearchTerm;
    }
    this.loadAcademicYears();
  }

  private performSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim().length < 2) {
      this.filteredCourses = [];
      this.isSearching = false;
      return;
    }

    this.isSearching = true;
    this.errorMessage = '';

    const params = new HttpParams()
      .set('nama_matakuliah', searchTerm)
      .set('per_page', '50');

    this.matakuliahService.getCourses(params)
      .pipe(finalize(() => this.isSearching = false))
      .subscribe({
        next: (courses) => {
          this.filteredCourses = courses;
        },
        error: (error) => {
          this.errorMessage = 'Error searching courses';
          console.error('Error searching courses:', error);
          this.filteredCourses = [];
        }
      });
  }

  private loadAcademicYears(): void {
    this.apiService.getAllTahunAjaran().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.academicYears = response.data;
        } else {
          console.error('Failed to load academic years:', response);
          this.notificationService.showError('Gagal memuat daftar tahun ajaran.');
        }
      },
      error: (error) => {
        console.error('Error loading academic years:', error);
        this.notificationService.showError('Gagal memuat daftar tahun ajaran.');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && this.showDropdown) {
      this.closeDropdown();
    }
  }

  onSearchFocus(): void {
    this.showDropdown = true;
    if (this.searchTerm.trim().length >= 2) {
      this.searchSubject.next(this.searchTerm);
    }
  }

  onSearchInput(): void {
    this.showDropdown = true;
    if (this.selectedCourse && this.searchTerm !== `${this.selectedCourse.id} - ${this.selectedCourse.name}`) {
      this.selectedCourse = null;
    }
    this.searchSubject.next(this.searchTerm);
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    if (this.selectedAcademicYear) {
      this.searchTerm = `${course.code} - ${course.name} | TA ${this.selectedAcademicYear.tahun_ajaran} - ${this.selectedAcademicYear.semester}`;
    } else {
      this.searchTerm = `${course.code} - ${course.name}`;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCourse = null;
    this.selectedAcademicYear = null;
    this.filteredCourses = [];
    this.errorMessage = '';
    this.showDropdown = true;
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
    this.searchCleared.emit();
  }

  onDone(): void {
    if (!this.selectedCourse) {
      this.notificationService.showWarning('Please select a course.');
      return;
    }
    if (!this.selectedAcademicYear) {
      this.notificationService.showWarning('Please select an academic year.');
      return;
    }

    const id_matakuliah = parseInt(this.selectedCourse.id);
    const id_tahun_ajaran = this.selectedAcademicYear.id;

    const params = new HttpParams()
      .set('id_matakuliah', id_matakuliah.toString())
      .set('id_tahun_ajaran', id_tahun_ajaran.toString());

    this.apiService.getAllKoordinatorMatakuliah(params).subscribe({
      next: (response) => {
        const data = response.data;
        let coordinator: Lecturer | undefined = undefined;

        if (data && data.id != null) {
          coordinator = {
            id: data.id,
            name: data.name,
            lecturerCode: data.lecturer_code,
            email: '', nip: '', nidn: '',
            jabatanFungsionalAkademik: '', idJabatanStruktural: null,
            statusPegawai: '', pendidikanTerakhir: '', idKelompokKeahlian: 0
          };
        }

        this.selectionConfirmed.emit({
          course: this.selectedCourse!,
          academicYear: {
            id: this.selectedAcademicYear!.id,
            value: `TA ${this.selectedAcademicYear!.tahun_ajaran}/${this.selectedAcademicYear!.semester}`
          },
          coordinator
        });

        this.showDropdown = false;
      },
      error: (error) => {
        console.error('Failed to load coordinator:', error);
        this.notificationService.showError('Gagal memuat koordinator mata kuliah.');
      }
    });
  }

  closeDropdown(): void {
    if (this.showDropdown) {
      this.showDropdown = false;
      this.selectionClosed.emit();
    }
  }

  onAcademicYearSelect(): void {
    if (this.selectedCourse && this.selectedAcademicYear) {
      this.searchTerm = `${this.selectedCourse.code} - ${this.selectedCourse.name} | TA ${this.selectedAcademicYear.tahun_ajaran} - ${this.selectedAcademicYear.semester}`;
    }
  }

  showPlaceholder(): boolean {
    return this.searchTerm.trim().length < 2 && this.filteredCourses.length === 0 && !this.selectedCourse && this.showDropdown && !this.isLoading && !this.isSearching;
  }

  public retrySearch(): void {
    this.errorMessage = '';
    if (this.searchTerm.trim().length >= 2) {
      this.performSearch(this.searchTerm);
    }
  }

  public setSearchTermDisplay(term: string, course: Course | null, academicYear: TahunAjaran | null) {
    this.searchTerm = term;
    this.selectedCourse = course;
    this.selectedAcademicYear = academicYear;
    this.showDropdown = false;
  }
}