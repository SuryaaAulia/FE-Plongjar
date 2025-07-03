import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlottingResultCardComponent, LoadingSpinnerComponent, SearchNotFoundComponent } from '../../../shared/components/index';
import { Course } from '../../../core/models/user.model';
import { MatakuliahService } from '../../../core/services/matakuliah.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

interface SelectOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-rekap-plotting',
  standalone: true,
  imports: [CommonModule, FormsModule, PlottingResultCardComponent, LoadingSpinnerComponent, SearchNotFoundComponent],
  templateUrl: './rekap-plotting.component.html',
  styleUrl: './rekap-plotting.component.scss'
})
export class RekapPlottingComponent implements OnInit {
  private matakuliahService = inject(MatakuliahService);
  private router = inject(Router);

  isLoading = true;
  courses: Course[] = [];

  programStudiOptions: SelectOption[] = [];
  tahunAjaranOptions: SelectOption[] = [];

  selectedProgramStudiId: number | null = null;
  selectedTahunAjaranId: number | null = null;

  ngOnInit(): void {
    this.loadInitialFilterData();
  }

  loadInitialFilterData(): void {
    this.isLoading = true;
    forkJoin({
      programStudi: this.matakuliahService.getProgramStudi(),
      tahunAjaran: this.matakuliahService.getTahunAjaranKaurLAAK()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ programStudi, tahunAjaran }) => {
        this.programStudiOptions = programStudi.map(ps => ({
          value: ps.id,
          label: ps.nama
        }));

        this.tahunAjaranOptions = tahunAjaran.map(ta => ({
          value: ta.id,
          label: `${ta.tahun_ajaran} (${ta.semester})`
        }));

        if (this.programStudiOptions.length > 0) {
          this.selectedProgramStudiId = this.programStudiOptions[0].value;
        }
        if (this.tahunAjaranOptions.length > 0) {
          this.selectedTahunAjaranId = this.tahunAjaranOptions[0].value;
        }

        this.loadCourses();
      },
      error: (err) => {
        console.error("Failed to load filter data", err);
        alert("Gagal memuat data filter. Silakan coba lagi.");
      }
    });
  }

  loadCourses(): void {
    if (!this.selectedProgramStudiId || !this.selectedTahunAjaranId) {
      this.courses = [];
      return;
    }

    this.isLoading = true;

    this.matakuliahService.getHasilPlottinganByProdi(this.selectedTahunAjaranId, this.selectedProgramStudiId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.courses = response.data;
          console.log("Loaded courses:", this.courses);
        },
        error: (err) => {
          console.error("Failed to load courses", err);
          this.courses = [];
        }
      });
  }

  onFilterChange(): void {
    this.loadCourses();
  }

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }

  onShowCourseDetails(course: Course): void {
    if (!this.selectedProgramStudiId || !this.selectedTahunAjaranId) {
      console.error("Cannot show details, filter selections are missing.");
      alert("Silakan pilih Program Studi dan Tahun Ajaran terlebih dahulu.");
      return;
    }

    this.router.navigate([
      '/kaur-lab/hasil-plotting',
      course.code,
      this.selectedProgramStudiId,
      this.selectedTahunAjaranId
    ]);
  }

  onDownloadCourseExcel(course: Course): void { }
}