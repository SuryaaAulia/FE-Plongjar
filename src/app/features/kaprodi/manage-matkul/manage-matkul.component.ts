import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Course } from '../../../core/models/user.model';
import {
  SearchHeaderComponent,
  PaginationComponent,
  CourseCardComponent,
  ConfirmationModalComponent
} from '../../../shared/components/index';

@Component({
  selector: 'app-manage-matkul',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    CourseCardComponent,
    PaginationComponent,
    ConfirmationModalComponent
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

  // Properties for Delete Confirmation Modal State
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
  }

  onItemsPerPageChange(items: number): void {
    this.itemsPerPage = items;
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
    console.log('Navigating to View Details for:', course.code);
    // Assuming your detail route is something like this, adjust if necessary
    this.router.navigate(['/ketua-prodi/detail-matkul', course.code]);
  }

  handleEditCourse(course: Course): void {
    console.log('Navigating to Edit Course for code:', course.code);
    // Assuming your edit route is something like this
    this.router.navigate(['/ketua-prodi/matkul/edit', course.code]);
  }

  handleDeleteCourse(course: Course): void {
    this.courseToDelete = course;
    this.deleteModalTitle = 'Confirmation!';
    this.deleteModalMessage = `Anda yakin ingin menghapus mata kuliah <strong>${course.code} - ${course.name}</strong> dari daftar?`;
    this.deleteModalMode = 'checkbox';
    this.showDeleteModal = true;
  }

  onInitialDeleteConfirmed(): void {
    this.deleteModalTitle = 'Confirmation!';
    this.deleteModalMode = 'password';
    this.showDeleteModal = true;
  }

  onPasswordDeleteSubmitted(password: string): void {
    if (!this.courseToDelete) {
      console.error('courseToDelete is null. Cannot proceed with deletion.');
      this.closeDeleteModal();
      return;
    }

    console.log(`Attempting to delete course: ${this.courseToDelete.code} with password: ${password}`);
    // ** TODO: Implement actual delete logic here **
    // 1. Verify password with backend (optional step, depends on your API)
    // 2. Call a service: this.matkulService.deleteMatkul(this.courseToDelete.code, password).subscribe(...);

    alert(`Mata Kuliah ${this.courseToDelete.name} (${this.courseToDelete.code}) akan dihapus setelah verifikasi password (Password: "${password}") - Mock Action`);

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