import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlottingResultCardComponent, LoadingSpinnerComponent, SearchNotFoundComponent, PaginationComponent } from '../../../shared/components/index';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PlottingService } from '../../../core/services/plotting.service';
import { MatakuliahService } from '../../../core/services/matakuliah.service';
import { HttpParams } from '@angular/common/http';

interface SelectOption {
  value: number;
  label: string;
}
export interface PlottingSummary {
  id_program_studi: number;
  nama_program_studi: string;
  id_tahun_ajaran: number;
  tahun_ajaran: string;
  semester: string;
}

@Component({
  selector: 'app-rekap-plotting',
  standalone: true,
  imports: [CommonModule, FormsModule, PlottingResultCardComponent, LoadingSpinnerComponent, SearchNotFoundComponent, PaginationComponent],
  templateUrl: './rekap-plotting.component.html',
  styleUrl: './rekap-plotting.component.scss'
})
export class RekapPlottingComponent implements OnInit {
  private plottingService = inject(PlottingService);
  private matakuliahService = inject(MatakuliahService)
  private router = inject(Router);

  isLoading = true;

  summaries: PlottingSummary[] = [];

  programStudiOptions: SelectOption[] = [];
  tahunAjaranOptions: SelectOption[] = [];

  selectedProgramStudiId: number | 'all' = 'all';
  selectedTahunAjaranId: number | 'all' = 'all';

  currentPage = 1;
  itemsPerPage = 15;
  totalItems = 0;

  showDropdown = false;
  pageSizeOptions: number[] = [9, 15, 30, 50];

  ngOnInit(): void {
    this.loadInitialFilterData();
  }

  loadInitialFilterData(): void {
    this.isLoading = true;
    forkJoin({
      programStudi: this.matakuliahService.getProgramStudi(),
      tahunAjaran: this.matakuliahService.getTahunAjaranKaurLAAK(),
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ programStudi, tahunAjaran }) => {
        this.programStudiOptions = programStudi.map(ps => ({ value: ps.id, label: ps.nama }));
        this.tahunAjaranOptions = tahunAjaran.map(ta => ({ value: ta.id, label: `${ta.tahun_ajaran} (${ta.semester})` }));
        this.loadSummaries();
      },
      error: (err) => {
        console.error("Failed to load filter data", err);
        alert("Gagal memuat data filter.");
        this.summaries = [];
      }
    });
  }

  loadSummaries(): void {
    this.isLoading = true;
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('per_page', this.itemsPerPage.toString());

    if (this.selectedProgramStudiId !== 'all') {
      params = params.set('id_program_studi', this.selectedProgramStudiId.toString());
    }
    if (this.selectedTahunAjaranId !== 'all') {
      params = params.set('id_tahun_ajaran', this.selectedTahunAjaranId.toString());
    }

    this.plottingService.getPlottinganSummary(params)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.summaries = response.data;
            this.totalItems = response.total;
            this.currentPage = response.current_page;
          } else {
            this.summaries = [];
            this.totalItems = 0;
            this.currentPage = 1;
          }
        },
        error: (err) => {
          console.error("Failed to load plotting summaries", err);
          this.summaries = [];
          this.totalItems = 0;
          this.currentPage = 1;
        }
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadSummaries();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSummaries();
  }

  onShowSummaryDetails(summary: PlottingSummary): void {
    this.router.navigate([
      '/kaur-lab/hasil-plotting',
      summary.id_program_studi,
      summary.id_tahun_ajaran
    ]);
  }

  onDownloadSummaryExcel(summary: PlottingSummary): void {
    this.isLoading = true;
    this.matakuliahService
      .exportPlottinganByProdi(
        summary.id_tahun_ajaran,
        summary.id_program_studi
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (blob) => {
          const prodiName = summary.nama_program_studi.replace(/\s/g, '_');
          const tahunAjaranName = summary.tahun_ajaran.replace(/[\/\s]/g, '_');
          const fileName = `hasil_plotting_${prodiName}_${tahunAjaranName}.xlsx`;

          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
        },
        error: (err) => {
          console.error('Error downloading excel file:', err);
          alert('Gagal mengunduh file Excel.');
        },
      });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  changeItemsPerPage(option: number): void {
    this.itemsPerPage = option;
    this.showDropdown = false;
    this.onFilterChange();
  }
}