import { Component, OnInit, Output, EventEmitter, ElementRef, HostListener, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course } from '../../../../../core/models/user.model';

interface AcademicYear {
  value: string;
  label: string;
}

@Component({
  selector: 'app-search-matkul',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-matkul.component.html',
  styleUrls: ['./search-matkul.component.scss']
})
export class SearchMatkulComponent implements OnInit {
  @Input() initialSearchTerm: string = '';

  searchTerm: string = '';
  searchPlaceholder: string = 'Contoh: PEMROGRAMAN WEB';
  searchInputNote: string = '* Masukkan nama mata kuliah yang ingin di tambahkan';

  availableCourses: Course[] = [
    { id: 'CRI3I3', name: 'PEMROGRAMAN PERANGKAT BERGERAK', pic: 'SEAL', code: 'CRI3I3', sks: 3, statusMatkul: 'Aktif', metodePerkuliahan: 'Daring', praktikum: 'Ya' },
    { id: 'CRI3B3', name: 'PEMROGRAMAN WEB', pic: 'SEAL', code: 'CRI3I3', sks: 3, statusMatkul: 'Aktif', metodePerkuliahan: 'Daring', praktikum: 'Ya' },
    { id: 'CII3B4', name: 'PEMROGRAMAN BERORIENTASI OBJEK', pic: 'SEAL', code: 'CRI3I3', sks: 3, statusMatkul: 'Aktif', metodePerkuliahan: 'Daring', praktikum: 'Ya' },
    { id: 'CSH2A3', name: 'ALGORITMA DAN STRUKTUR DATA', pic: 'SEAL', code: 'CRI3I3', sks: 3, statusMatkul: 'Aktif', metodePerkuliahan: 'Daring', praktikum: 'Ya' },
    { id: 'CSI3A3', name: 'BASIS DATA', pic: 'SEAL', code: 'CRI3I3', sks: 3, statusMatkul: 'Aktif', metodePerkuliahan: 'Daring', praktikum: 'Ya' },
  ];

  filteredCourses: Course[] = [];
  selectedCourse: Course | null = null;

  academicYears: AcademicYear[] = [
    { value: '2024/2025', label: '2024/2025' },
    { value: '2023/2024', label: '2023/2024' },
    { value: '2022/2023', label: '2022/2023' },
    { value: '2021/2022', label: '2021/2022' },
    { value: '2020/2021', label: '2020/2021' },
  ];
  selectedAcademicYear: string | null = null;
  showDropdown: boolean = false;

  @Output() selectionConfirmed = new EventEmitter<{ course: Course, academicYear: string }>();
  @Output() selectionClosed = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    if (this.initialSearchTerm) {
      this.searchTerm = this.initialSearchTerm;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && this.showDropdown) {
      this.closeDropdown();
    }
  }

  onSearchFocus(): void {
    this.showDropdown = true;
    this.filterCourses();
  }

  onSearchInput(): void {
    this.showDropdown = true;
    this.filterCourses();
  }

  filterCourses(): void {
    if (this.searchTerm.trim() === '' && !this.selectedCourse) {
      this.filteredCourses = [];
    } else if (this.searchTerm.trim() !== '') {
      if (this.selectedCourse && (this.searchTerm !== `${this.selectedCourse.id} - ${this.selectedCourse.name}`)) {
        this.selectedCourse = null;
      }
      this.filteredCourses = this.availableCourses.filter(course =>
        course.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.id.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else if (this.selectedCourse && this.searchTerm === `${this.selectedCourse.id} - ${this.selectedCourse.name}`) {
      this.filteredCourses = [];
    }
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    this.searchTerm = `${course.id} - ${course.name}`;
    this.filteredCourses = [];
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCourse = null;
    this.selectedAcademicYear = null;
    this.filteredCourses = [];
    this.showDropdown = true;
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }

  onDone(): void {
    if (this.selectedCourse && this.selectedAcademicYear) {
      this.selectionConfirmed.emit({ course: this.selectedCourse, academicYear: this.selectedAcademicYear });
      this.showDropdown = false;
    } else if (!this.selectedCourse) {
      alert('Please select a course.');
    } else {
      alert('Please select an academic year.');
    }
  }

  closeDropdown(): void {
    if (this.showDropdown) {
      this.showDropdown = false;
      this.selectionClosed.emit();
    }
  }

  showPlaceholder(): boolean {
    return this.searchTerm.trim() === '' && this.filteredCourses.length === 0 && !this.selectedCourse && this.showDropdown;
  }

  public setSearchTermDisplay(term: string, course: Course | null, academicYear: string | null) {
    this.searchTerm = term;
    this.selectedCourse = course;
    this.selectedAcademicYear = academicYear;
    this.showDropdown = false;
  }
}