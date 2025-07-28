import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
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
import { NotificationService } from '../../../core/services/notification.service';

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
  styleUrls: ['./manage-matkul.component.scss']
})
export class ManageMatkulComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  totalItems: number = 0;
  currentPage = 1;
  itemsPerPage = 12;
  isLoading = true;

  private currentSearchName = '';
  private currentSearchCode = '';
  currentSearchDisplayKeyword: string = '';

  showDeleteModal = false;
  deleteModalMode: 'checkbox' | 'password' = 'checkbox';
  courseToDelete: Course | null = null;
  deleteModalTitle = '';
  deleteModalMessage = '';
  deletePasswordPrompt = 'Masukan password akun anda untuk melanjutkan tindakan penghapusan mata kuliah';

  private destroy$ = new Subject<void>();

  private router = inject(Router);
  private matakuliahService = inject(MatakuliahService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourses(): void {
    this.isLoading = true;
    const mergedSearch = [this.currentSearchName, this.currentSearchCode]
      .filter(Boolean)
      .join(' ');

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('per_page', this.itemsPerPage.toString());

    if (mergedSearch) {
      params = params.set('search', mergedSearch);
    }

    this.matakuliahService.getAllCoursesAuthProdi(params)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.courses = response.data;
          this.totalItems = response.total;
          this.currentPage = response.current_page;
        },
        error: (err) => {
          console.error('Failed to load courses:', err);
          this.notificationService.showError('Gagal memuat daftar mata kuliah. Silakan coba lagi.');
          this.courses = [];
          this.totalItems = 0;
        }
      });
  }

  handleSearch(searchQueries: { query1: string; query2: string }): void {
    this.currentPage = 1;
    this.currentSearchName = searchQueries.query1.trim();
    this.currentSearchCode = searchQueries.query2.trim();
    this.updateSearchDisplayKeyword(this.currentSearchName, this.currentSearchCode);
    this.loadCourses();
  }

  updateSearchDisplayKeyword(name: string, code: string): void {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    this.currentSearchDisplayKeyword = [trimmedName, trimmedCode].filter(Boolean).join(', ');
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
      this.notificationService.showError('ID Mata Kuliah tidak valid.');
      this.closeDeleteModal();
      return;
    }
    this.matakuliahService.deleteMatakuliah(courseId, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess(response.message || 'Mata kuliah berhasil dihapus.');
          this.closeDeleteModal();
          this.loadCourses();
        },
        error: (err) => {
          console.error('Failed to delete course:', err);
          const errorMessage = err.error?.message || 'Gagal menghapus mata kuliah. Password mungkin salah atau terjadi error lain.';
          this.notificationService.showError(errorMessage);
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

  trackByCourseId(index: number, course: Course): string | number {
    return course.id;
  }
}