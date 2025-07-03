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
  SearchNotFoundComponent,
  SearchHeaderComponent
} from '../../../shared/components/index';
import { MatakuliahService } from '../../../core/services/matakuliah.service';
import { HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

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
    SearchNotFoundComponent,
    SearchHeaderComponent
  ],
  templateUrl: './manage-matkul.component.html',
  styleUrl: './manage-matkul.component.scss'
})
export class ManageMatkulComponent implements OnInit {
  courses: Course[] = [];
  totalItems: number = 0;
  currentPage = 1;
  itemsPerPage = 12;
  isLoading = true;

  private currentSearchName = '';
  private currentSearchPic = '';

  currentSearchDisplayKeyword: string = '';

  showDeleteModal = false;
  deleteModalMode: 'checkbox' | 'password' = 'checkbox';
  courseToDelete: Course | null = null;
  deleteModalTitle = '';
  deleteModalMessage = '';
  deletePasswordPrompt = 'Masukan password akun anda untuk melanjutkan tindakan penghapusan mata kuliah';

  constructor(
    private router: Router,
    private matakuliahService: MatakuliahService
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('per_page', this.itemsPerPage.toString());

    if (this.currentSearchName) {
      params = params.set('nama_matakuliah', this.currentSearchName);
    }
    if (this.currentSearchPic) {
      params = params.set('pic', this.currentSearchPic);
    }

    this.matakuliahService.getAllCoursesAuthProdi(params).pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: (response) => {
        this.courses = response.data;
        this.totalItems = response.total;
        this.currentPage = response.current_page;
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        alert('Gagal memuat daftar mata kuliah. Silakan coba lagi.');
        this.courses = [];
        this.totalItems = 0;
      }
    });
  }

  handleSearch(searchQueries: { query1: string; query2: string }): void {
    this.currentPage = 1;
    this.currentSearchName = searchQueries.query1;
    this.currentSearchPic = searchQueries.query2;
    this.updateSearchDisplayKeyword(this.currentSearchName, this.currentSearchPic);
    this.loadCourses();
  }

  updateSearchDisplayKeyword(name: string, pic: string): void {
    const trimmedName = name.trim();
    const trimmedPic = pic.trim();
    this.currentSearchDisplayKeyword = [trimmedName, trimmedPic].filter(Boolean).join(', ');
  }

  onItemsPerPageChange(items: number): void {
    this.itemsPerPage = Number(items);
    this.currentPage = 1;
    this.loadCourses();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCourses();
  }

  handleViewDetails(course: Course): void {
    this.router.navigate(['/ketua-prodi/detail-matkul', course.id]);
  }

  handleEditCourse(course: Course): void {
    this.router.navigate(['/ketua-prodi/matkul/edit', course.id]);
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
    if (!this.courseToDelete || !password) {
      return;
    }

    const courseId = Number(this.courseToDelete.id);
    if (isNaN(courseId)) {
      console.error("Invalid course ID for deletion:", this.courseToDelete.id);
      this.closeDeleteModal();
      return;
    }

    this.matakuliahService.deleteMatakuliah(courseId, password).subscribe({
      next: (response) => {
        alert(response.message || 'Mata kuliah berhasil dihapus.');
        this.closeDeleteModal();
        this.loadCourses();
      },
      error: (err) => {
        console.error('Failed to delete course:', err);
        const errorMessage = err.error?.message || 'Gagal menghapus mata kuliah. Password mungkin salah atau terjadi error lain.';
        alert(errorMessage);
        this.deleteModalMode = 'password';
      }
    });
  }

  onDeleteCancelled(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.courseToDelete = null;
    this.deleteModalMode = 'checkbox';
  }
}