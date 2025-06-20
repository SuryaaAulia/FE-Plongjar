import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import {
  SearchHeaderComponent,
  PaginationComponent,
  TableComponent,
  TableColumn,
  ActionButton,
  LoadingSpinnerComponent,
  SearchNotFoundComponent
} from '../../../shared/components/index';
import { Lecturer } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { DosenService, DosenResponse, DosenListParams } from '../../../core/services/dosen.service';

@Component({
  selector: 'app-list-dosen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchHeaderComponent,
    PaginationComponent,
    TableComponent,
    LoadingSpinnerComponent,
    SearchNotFoundComponent,
  ],
  templateUrl: './list-dosen.component.html',
  styleUrls: ['./list-dosen.component.scss'],
})
export class ListDosenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<{ query1: string; query2: string }>();

  lecturers: Lecturer[] = [];
  filteredLecturers: Lecturer[] = [];
  paginatedLecturers: Lecturer[] = [];

  isLoading = true;
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;
  totalPages = 0;

  currentSearchQuery1: string = '';
  currentSearchQuery2: string = '';
  currentCombinedSearchKeyword: string = '';

  hasLoadedData: boolean = false;
  isSearchEmpty: boolean = false;

  noResultsImagePath: string = 'assets/images/image_57e4f0.png';

  tableColumns: TableColumn<Lecturer>[] = [
    { key: 'name', header: 'Nama Dosen', width: 'col-nama-dosen' },
    { key: 'lecturerCode', header: 'Kode' },
    { key: 'nip', header: 'NIP' },
    { key: 'kelompokKeahlian', header: 'Bidang Keahlian', width: 'col-bidang-keahlian' },
    { key: 'statusPegawai', header: 'Status' },
  ];

  actionButtons: ActionButton<Lecturer>[] = [
    {
      icon: 'fa-money-check',
      title: 'Beban SKS',
      onClick: (lecturer: Lecturer) => this.viewLecturerSKS(lecturer.lecturerCode),
    },
    {
      icon: 'fa-file-alt',
      title: 'Detail',
      onClick: (lecturer: Lecturer) => this.viewLecturerDetails(lecturer.id),
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dosenService: DosenService
  ) { }

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadDosen();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query1 === curr.query1 && prev.query2 === curr.query2),
      takeUntil(this.destroy$)
    ).subscribe(searchQueries => {
      this.currentSearchQuery1 = searchQueries.query1;
      this.currentSearchQuery2 = searchQueries.query2;
      this.currentCombinedSearchKeyword = [searchQueries.query1, searchQueries.query2]
        .filter(q => q && q.trim())
        .join(' ');

      this.currentPage = 1;
      this.isSearchEmpty = false;
      this.loadDosen();
    });
  }

  loadDosen(): void {
    this.isLoading = true;
    this.hasLoadedData = true;

    const params: DosenListParams = {
      page: this.currentPage,
      per_page: this.itemsPerPage,
    };
    if (this.currentCombinedSearchKeyword.trim()) {
      params.search = this.currentCombinedSearchKeyword.trim();
    }

    this.dosenService.getAllDosen(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.lecturers = this.mapDosenResponseToLecturers(response.data.data);
            this.paginatedLecturers = [...this.lecturers];
            this.filteredLecturers = [...this.lecturers];
            this.totalItems = response.data.total;
            this.totalPages = response.data.last_page;
            this.currentPage = response.data.current_page;

            this.isSearchEmpty = this.totalItems === 0;
          } else {
            this.lecturers = [];
            this.paginatedLecturers = [];
            this.filteredLecturers = [];
            this.totalItems = 0;
            this.totalPages = 0;
            this.currentPage = 1;
            this.isSearchEmpty = true;
          }
        },
        error: (error) => {
          console.error('Error loading lecturers:', error);
          this.isLoading = false;
          this.lecturers = [];
          this.paginatedLecturers = [];
          this.filteredLecturers = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.currentPage = 1;
          this.isSearchEmpty = true;
        }
      });
  }

  private mapDosenResponseToLecturers(dosenList: any[]): Lecturer[] {
    return dosenList.map(dosen => ({
      id: dosen.id,
      name: dosen.name,
      lecturerCode: dosen.lecturer_code,
      email: dosen.email || '',
      jabatanFungsionalAkademik: dosen.jabatan_fungsional_akademik || '',
      statusPegawai: dosen.status_pegawai,
      pendidikanTerakhir: dosen.pendidikan_terakhir || null,
      nidn: dosen.nidn || null,
      nip: dosen.nip || null,
      kelompokKeahlian: dosen.kelompok_keahlian.nama || null,
      idJabatanStruktural: dosen.id_jabatan_struktural || null,
      idKelompokKeahlian: dosen.id_kelompok_keahlian,
      createdAt: dosen.created_at,
      updatedAt: dosen.updated_at,
    }));
  }

  onSearch(searchQuery: { query1: string; query2: string }): void {
    this.searchSubject.next(searchQuery);
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
    this.loadDosen();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDosen();
  }

  onRowClick(lecturer: Lecturer): void {
    this.viewLecturerDetails(lecturer.id);
  }

  viewLecturerSKS(lecturerCode: string): void {
    if (this.authService.hasRole('ProgramStudi')) {
      this.router.navigate(['/ketua-prodi/riwayat-mengajar/', lecturerCode]);
    } else {
      this.router.navigate(['/ketua-kk/riwayat-mengajar/', lecturerCode]);
    }
  }

  viewLecturerDetails(lecturerId: number): void {
    if (this.authService.hasRole('ProgramStudi')) {
      this.router.navigate(['/ketua-prodi/detail-dosen/', lecturerId]);
    } else {
      this.router.navigate(['/ketua-kk/detail-dosen/', lecturerId]);
    }
  }
}