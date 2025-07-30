import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { DosenService, DosenListParams } from '../../../core/services/dosen.service';
import { JabatanService } from '../../../core/services/admin/jabatan.service';
import { Lecturer, JabatanStruktural } from '../../../core/models/user.model';
import {
  SearchHeaderComponent,
  PaginationComponent,
  LoadingSpinnerComponent,
  SearchNotFoundComponent,
  AssignJabatanCardComponent,
} from '../../../shared/components/index';
import { NotificationService } from '../../../core/services/notification.service';

export interface JabatanOption {
  id: number;
  name: string;
  value: string;
}

@Component({
  selector: 'app-assign-jabatan',
  standalone: true,
  imports: [
    CommonModule,
    SearchHeaderComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    SearchNotFoundComponent,
    AssignJabatanCardComponent,
  ],
  templateUrl: './assign-jabatan.component.html',
  styleUrls: ['./assign-jabatan.component.scss'],
})
export class AssignJabatanComponent implements OnInit, OnDestroy {
  lecturerList: Lecturer[] = [];
  filteredLecturerList: Lecturer[] = [];
  paginatedLecturerList: Lecturer[] = [];
  jabatanOptions: JabatanOption[] = [];
  jabatanList: JabatanStruktural[] = [];

  isLoading = true;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  availableJabatan: string[] = [];
  activeFilter: string | null = 'Tanpa Jabatan';
  searchQuery1 = '';
  searchQuery2 = '';

  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;

  private dosenService = inject(DosenService);
  private jabatanService = inject(JabatanService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.jabatanService.getAllJabatanStruktural()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([] as JabatanStruktural[]))
      )
      .subscribe(jabatanResponse => {
        this.jabatanList = jabatanResponse || [];

        if (this.jabatanList.length) {
          this.jabatanOptions = this.jabatanList.map(j => ({
            id: j.id,
            name: j.nama,
            value: j.nama.toLowerCase().replace(/\s+/g, '_')
          }));
          this.availableJabatan = this.jabatanList.map(j => j.nama).sort();
        }

        this.loadDosenByFilter();
      });
  }

  private loadDosenByFilter(): void {
    this.isLoading = true;
    let dosenObservable: Observable<any>;

    const hasSearch = this.searchQuery1.trim() || this.searchQuery2.trim();
    const isTanpaJabatan = this.activeFilter === 'Tanpa Jabatan';
    const selectedJabatan = this.jabatanList.find(j => j.nama === this.activeFilter);

    if (hasSearch) {
      const params: DosenListParams = {
        page: 1,
        per_page: 200,
        nama_or_nip: this.searchQuery1.trim(),
        kode_dosen: this.searchQuery2.trim()
      };
      dosenObservable = this.dosenService.getAllDosen(params);
    } else if (isTanpaJabatan) {
      dosenObservable = this.jabatanService.getDosenTanpaJabatanStruktural();
    } else if (selectedJabatan) {
      dosenObservable = this.jabatanService.getDosenByJabatanStruktural(selectedJabatan.id);
    } else {
      dosenObservable = this.dosenService.getAllDosen({ page: 1, per_page: 200 });
    }

    dosenObservable
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of({ data: { data: [] }, success: false })),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(response => {
        const data = this.extractDosenData(response);
        const mappedLecturers = this.mapResponseToLecturers(data);

        this.lecturerList = hasSearch
          ? this.filterByJabatan(mappedLecturers)
          : mappedLecturers;

        this.filteredLecturerList = [...this.lecturerList];
        this.totalItems = this.filteredLecturerList.length;
        this.updatePagination();
      });
  }



  private extractDosenData(response: any): any[] {
    if (response.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  }

  private mapResponseToLecturers(data: any[]): Lecturer[] {
    return data.map((item: any) => ({
      id: item.id,
      name: item.name || item.nama || item.nama_dosen || '',
      lecturerCode: item.lecturer_code || item.lecturerCode || item.kode_dosen || '',
      nip: item.nip || null,
      nidn: item.nidn || null,
      email: item.email || '',
      jabatanFungsionalAkademik: item.jabatan_fungsional_akademik || item.jabatanFungsionalAkademik || item.jfa || '',
      statusPegawai: item.status_pegawai || item.statusPegawai || item.status || '',
      pendidikanTerakhir: item.pendidikan_terakhir || item.pendidikanTerakhir || item.pendidikan || '',
      kelompokKeahlian: item.kelompok_keahlian || item.kelompokKeahlian || null,
      idJabatanStruktural: item.id_jabatan_struktural || item.idJabatanStruktural || null,
      idKelompokKeahlian: item.id_kelompok_keahlian || item.idKelompokKeahlian || null,
    }));
  }

  private filterByJabatan(lecturers: Lecturer[]): Lecturer[] {
    if (!this.activeFilter) {
      return lecturers;
    }

    if (this.activeFilter === 'Tanpa Jabatan') {
      return lecturers.filter(lecturer =>
        !lecturer.idJabatanStruktural ||
        lecturer.idJabatanStruktural === null ||
        lecturer.idJabatanStruktural === undefined
      );
    }

    const selectedJabatan = this.jabatanList.find(j => j.nama === this.activeFilter);
    if (selectedJabatan) {
      return lecturers.filter(lecturer =>
        lecturer.idJabatanStruktural === selectedJabatan.id
      );
    }

    return [];
  }

  private updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedLecturerList = this.filteredLecturerList.slice(start, start + this.itemsPerPage);
  }

  onSearch({ query1, query2 }: { query1: string; query2: string }): void {
    this.searchQuery1 = query1.trim();
    this.searchQuery2 = query2.trim();
    this.currentPage = 1;
    this.loadDosenByFilter();
  }

  onFilterChange(filter: string | null): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.searchQuery1 = '';
    this.searchQuery2 = '';
    this.loadDosenByFilter();
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.updatePagination();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  onJabatanAssign({ lecturer, jabatan }: { lecturer: Lecturer; jabatan: JabatanOption | null }): void {
    if (jabatan) {
      this.assignJabatan(lecturer, jabatan);
    } else {
      this.removeJabatan(lecturer);
    }
  }

  private assignJabatan(lecturer: Lecturer, jabatan: JabatanOption): void {
    this.isLoading = true;

    this.jabatanService.assignJabatanStruktural(lecturer.id, jabatan.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: res => {
          if (res.success) {
            this.notificationService.showSuccess(res.message || "Jabatan berhasil di-assign.");
            this.loadDosenByFilter();
          }
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Gagal meng-assign jabatan.';
          this.notificationService.showError(errorMessage);
          console.error('Failed to assign position', err);
        }
      });
  }

  private removeJabatan(lecturer: Lecturer): void {
    this.notificationService.showConfirmation(
      'Konfirmasi Hapus Jabatan',
      `Anda yakin ingin melepas jabatan struktural dari ${lecturer.name}?`
    ).then(result => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.jabatanService.revokeJabatanStruktural(lecturer.id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => (this.isLoading = false))
          )
          .subscribe({
            next: res => {
              if (res.success) {
                this.notificationService.showSuccess(res.message || "Jabatan berhasil dilepas.");
                this.loadDosenByFilter();
              }
            },
            error: (err) => {
              const errorMessage = err.error?.message || 'Gagal melepas jabatan.';
              this.notificationService.showError(errorMessage);
              console.error('Failed to remove position', err);
            }
          });
      }
    });
  }

  get combinedSearchKeyword(): string {
    return [this.searchQuery1, this.searchQuery2].filter(Boolean).join(', ');
  }

  showAllData(): void {
    this.activeFilter = null;
    this.searchQuery1 = '';
    this.searchQuery2 = '';
    this.currentPage = 1;
    this.loadDosenByFilter();
  }

  trackByLecturerId(_: number, lecturer: Lecturer): number {
    return lecturer.id;
  }
}