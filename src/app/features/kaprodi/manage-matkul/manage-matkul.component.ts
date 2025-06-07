import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Course } from '../../../core/models/user.model';
import {
  PaginationComponent,
  CourseCardComponent,
  ConfirmationModalComponent,
  LoadingSpinnerComponent,
  SearchNotFoundComponent
} from '../../../shared/components/index'

@Component({
  selector: 'app-manage-matkul',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CourseCardComponent,
    PaginationComponent,
    ConfirmationModalComponent,
    LoadingSpinnerComponent,
    SearchNotFoundComponent
  ],
  templateUrl: './manage-matkul.component.html',
  styleUrl: './manage-matkul.component.scss'
})
export class ManageMatkulComponent implements OnInit {
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  currentPage = 1;
  itemsPerPage = 12;
  isLoading = true;
  searchNamaMatkul: string = '';
  searchPIC: string = '';

  currentSearchDisplayKeyword: string = '';
  noResultsImagePath: string = 'assets/images/image_57e4f0.png';

  showDeleteModal = false;
  deleteModalMode: 'checkbox' | 'password' = 'checkbox';
  courseToDelete: Course | null = null;
  deleteModalTitle = '';
  deleteModalMessage = '';
  deletePasswordPrompt = 'Masukan password akun anda untuk melanjutkan tindakan penghapusan mata kuliah';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.currentSearchDisplayKeyword = '';
    setTimeout(() => {
      this.allCourses = this.generateMockCourses();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  private generateMockCourses(): Course[] {
    const courseNames = ['MOBILE PROGRAMMING', 'WEB DEVELOPMENT', 'DATABASE SYSTEMS', 'ALGORITHMS', 'DATA STRUCTURES', 'OPERATING SYSTEMS', 'NETWORKING', 'SOFTWARE ENGINEERING', 'ARTIFICIAL INTELLIGENCE', 'MACHINE LEARNING'];
    const courseCodes = ['CRI3I3', 'CS101', 'DB202', 'ALGO303', 'DS304', 'OS401', 'NET402', 'SE501', 'AI601', 'ML602'];
    const pics = ['SEAL', 'RPL', 'KBK', 'DOSEN X', 'DOSEN Y'];
    const sksValues = [1, 2, 3, 4, 5, 6];
    const statuses = ['active', 'inactive', 'new'];
    const metodes = ['online', 'offline', 'hybrid'];
    const praktikumValues = ['true', 'false'];

    return Array.from({ length: 20 }, (_, i) => {
      const code = courseCodes[i % courseCodes.length] + (i >= courseCodes.length ? `_V${Math.floor(i / courseCodes.length)}` : '');
      return {
        id: `db-${i + 1}`,
        name: courseNames[i % courseNames.length] + (i >= courseNames.length ? ` ${Math.floor(i / courseNames.length) + 1}` : ''),
        code: code,
        sks: sksValues[i % sksValues.length],
        pic: pics[i % pics.length],
        statusMatkul: statuses[i % statuses.length],
        metodePerkuliahan: metodes[i % metodes.length],
        praktikum: praktikumValues[i % praktikumValues.length],
      };
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCourses = this.allCourses.filter(course => {
      const nameMatch = this.searchNamaMatkul
        ? course.name.toLowerCase().includes(this.searchNamaMatkul.toLowerCase())
        : true;
      const picMatch = this.searchPIC
        ? course.pic.toLowerCase().includes(this.searchPIC.toLowerCase())
        : true;
      return nameMatch && picMatch;
    });
    this.currentPage = 1;
    this.updateSearchDisplayKeyword();
  }

  updateSearchDisplayKeyword(): void {
    let keywords = [];
    if (this.searchNamaMatkul) {
      keywords.push(`Nama: "${this.searchNamaMatkul}"`);
    }
    if (this.searchPIC) {
      keywords.push(`PIC: "${this.searchPIC}"`);
    }
    this.currentSearchDisplayKeyword = keywords.join(', ');
  }


  onItemsPerPageChange(items: number): void {
    this.itemsPerPage = Number(items);
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get paginatedCourses(): Course[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCourses.slice(start, start + this.itemsPerPage);
  }

  handleViewDetails(course: Course): void {
    this.router.navigate(['/ketua-prodi/detail-matkul', course.code]);
  }

  handleEditCourse(course: Course): void {
    this.router.navigate(['/ketua-prodi/matkul/edit', course.code]);
  }

  handleDeleteCourse(course: Course): void {
    this.courseToDelete = course;
    this.deleteModalTitle = 'Konfirmasi Penghapusan!';
    this.deleteModalMessage = `Anda yakin ingin menghapus mata kuliah <strong>${course.code} - ${course.name}</strong> dari daftar? Tindakan ini tidak dapat diurungkan.`;
    this.deleteModalMode = 'checkbox';
    this.showDeleteModal = true;
  }

  onInitialDeleteConfirmed(): void {
    this.deleteModalTitle = 'Verifikasi Penghapusan!';
    this.deleteModalMode = 'password';
    this.showDeleteModal = true;
  }

  onPasswordDeleteSubmitted(password: string): void {
    if (!this.courseToDelete) {
      this.closeDeleteModal();
      return;
    }
    console.log(`Mata Kuliah ${this.courseToDelete.name} (${this.courseToDelete.code}) akan dihapus. Password: ${password}`);
    this.allCourses = this.allCourses.filter(c => c.code !== this.courseToDelete!.code);
    this.applyFilters();
    this.closeDeleteModal();
  }

  onDeleteCancelled(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.courseToDelete = null;
    this.deleteModalMode = 'checkbox';
  }

  get displayedEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredCourses.length);
  }

  get displayedStartIndex(): number {
    if (this.filteredCourses.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
}