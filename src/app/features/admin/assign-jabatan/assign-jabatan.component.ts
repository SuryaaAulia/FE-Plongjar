import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, from, Observable } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { DosenService } from '../../../core/services/dosen.service';
import { Lecturer } from '../../../core/models/user.model';
import {
  SearchHeaderComponent,
  PaginationComponent,
  LoadingSpinnerComponent,
  SearchNotFoundComponent,
  AssignJabatanCardComponent,
  JabatanOption,
} from '../../../shared/components/index';

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
  jabatanOptions: JabatanOption[] = [
    { id: 1, name: 'Asisten Ahli', value: 'asisten_ahli' },
    { id: 2, name: 'Lektor', value: 'lektor' },
    { id: 3, name: 'Lektor Kepala', value: 'lektor_kepala' },
    { id: 4, name: 'Guru Besar', value: 'guru_besar' },
    { id: 5, name: 'Tenaga Pengajar', value: 'tenaga_pengajar' },
  ];

  isLoading = true;
  private destroy$ = new Subject<void>();

  availableJabatan = [
    'Dosen',
    'Wakil Dekan',
    'Sekprodi',
    'Ketua',
    'Kaprodi',
    'Direktur',
  ];
  activeFilter: string | null = 'Tanpa Jabatan';
  searchQuery1 = '';
  searchQuery2 = '';

  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;

  constructor(
    private apiService: ApiService,
    private dosenService: DosenService
  ) { }

  ngOnInit(): void {
    this.loadLecturerData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLecturerData(): void {
    this.isLoading = true;
    this.dosenService
      .getAllDosen()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.data) {
            this.mapResponseToLecturers(response.data.data);
          } else {
            this.loadMockData();
          }
          this.applyFiltersAndSearch();
        },
        error: (error) => {
          console.error('Error loading lecturer data, loading mock data:', error);
          this.loadMockData();
          this.applyFiltersAndSearch();
        },
      });
  }

  private mapResponseToLecturers(data: any[]): void {
    this.lecturerList = data.map(
      (item: any): Lecturer => ({
        id: item.id.toString(),
        name: item.name,
        lecturerCode: item.lecturer_code,
        email: item.email,
        jabatanFunctionalAkademik: item.jabatan_fungsional_akademik
          ? [item.jabatan_fungsional_akademik]
          : [],
        statusPegawai: item.status_pegawai,
        pendidikanTerakhir: item.pendidikan_terakhir,
        department: item.department,
        nidn: item.nidn,
        nip: item.nip,
        kelompokKeahlian: item.kelompok_keahlian?.nama,
        idJabatanStruktural: item.id_jabatan_struktural,
        idKelompokKeahlian: item.id_kelompok_keahlian,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })
    );
  }

  private loadMockData(): void {
    this.lecturerList = Array.from(
      { length: 200 },
      (_, index): Lecturer => ({
        id: (index + 1).toString(),
        name: 'Bambang Pamungkas, S.T., M.T.',
        lecturerCode: 'BPS',
        email: `bambang${index}@example.com`,
        jabatanFunctionalAkademik: index % 4 === 0 ? ['Lektor'] : [],
        statusPegawai: 'Tetap',
        pendidikanTerakhir: 'S2',
        nip: `653879${47 + index}`,
        nidn: `001234567${index.toString().padStart(2, '0')}`,
        kelompokKeahlian: 'Software Engineering',
      })
    );
  }

  private applyFiltersAndSearch(): void {
    let filtered = [...this.lecturerList];

    if (this.activeFilter) {
      if (this.activeFilter === 'Tanpa Jabatan') {
        filtered = filtered.filter(lecturer =>
          !lecturer.jabatanFunctionalAkademik ||
          lecturer.jabatanFunctionalAkademik.length === 0
        );
      } else {
        filtered = filtered.filter(lecturer =>
          lecturer.jabatanFunctionalAkademik?.some(jabatan =>
            jabatan.toLowerCase().includes(this.activeFilter!.toLowerCase())
          )
        );
      }
    }

    if (this.searchQuery1 || this.searchQuery2) {
      filtered = filtered.filter((lecturer) => {
        const nameNipMatch =
          !this.searchQuery1 ||
          lecturer.name.toLowerCase().includes(this.searchQuery1) ||
          lecturer.nip?.toLowerCase().includes(this.searchQuery1) ||
          lecturer.nidn?.toLowerCase().includes(this.searchQuery1);
        const codeMatch =
          !this.searchQuery2 ||
          lecturer.lecturerCode.toLowerCase().includes(this.searchQuery2);
        return nameNipMatch && codeMatch;
      });
    }

    this.filteredLecturerList = filtered;
    this.totalItems = filtered.length;
    this.updatePagination();
  }

  private updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLecturerList = this.filteredLecturerList.slice(startIndex, endIndex);
  }

  onSearch(searchData: { query1: string; query2: string }): void {
    this.searchQuery1 = searchData.query1.toLowerCase().trim();
    this.searchQuery2 = searchData.query2.toLowerCase().trim();
    this.currentPage = 1;
    this.applyFiltersAndSearch();
  }

  onFilterChange(filter: string | null): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.applyFiltersAndSearch();
  }

  onItemsPerPageChange(newSize: number): void {
    this.itemsPerPage = newSize;
    this.currentPage = 1;
    this.updatePagination();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  onJabatanAssign(event: { lecturer: Lecturer; jabatan: JabatanOption | null }): void {
    console.log('Jabatan assignment event received:', event);
    if (event.jabatan) {
      this.assignJabatanToLecturer(event.lecturer, event.jabatan);
    } else {
      this.removeJabatanFromLecturer(event.lecturer);
    }
  }

  private assignJabatanToLecturer(lecturer: Lecturer, jabatan: JabatanOption): void {
    this.isLoading = true;
    this.simulateAssignJabatan({ id: lecturer.id, jabatanId: jabatan.id })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {
          const lecturerInList = this.lecturerList.find(l => l.id === lecturer.id);
          if (lecturerInList) {
            lecturerInList.jabatanFunctionalAkademik = [jabatan.name];
          }
          this.applyFiltersAndSearch();
        },
        error: (err) => console.error(`Failed to assign jabatan:`, err),
      });
  }

  private removeJabatanFromLecturer(lecturer: Lecturer): void {
    this.isLoading = true;
    this.simulateRemoveJabatan({ id: lecturer.id })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {
          const lecturerInList = this.lecturerList.find(l => l.id === lecturer.id);
          if (lecturerInList) {
            lecturerInList.jabatanFunctionalAkademik = [];
          }
          this.applyFiltersAndSearch();
        },
        error: (err) => console.error(`Failed to remove jabatan:`, err)
      });
  }

  private simulateAssignJabatan(data: any): Observable<{ success: boolean }> {
    return from(new Promise<{ success: boolean }>(resolve => setTimeout(() => resolve({ success: true }), 500)));
  }

  private simulateRemoveJabatan(data: any): Observable<{ success: boolean }> {
    return from(new Promise<{ success: boolean }>(resolve => setTimeout(() => resolve({ success: true }), 500)));
  }

  get combinedSearchKeyword(): string {
    return [this.searchQuery1, this.searchQuery2].filter(Boolean).join(', ');
  }

  trackByLecturerId(index: number, lecturer: Lecturer): string {
    return lecturer.id;
  }
}
