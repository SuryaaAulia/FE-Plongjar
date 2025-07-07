import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DynamicTableComponent, ColumnConfig, LoadingSpinnerComponent, ActionButtonComponent, PaginationComponent } from '../../../shared/components/index';
import { DosenService, BebanSksApiData } from '../../../core/services/dosen.service';
import { TahunAjaran } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';

export interface BebanSksDosen {
  no: number;
  kode: string;
  nama: string;
  prodi: string;
  jfa?: string;
  statusDosen?: string;
  maxSks?: number;
  struktural?: string;
  statusKepegawaian?: string;
  s1IfRegIntNormal?: number;
  s1IfDoubleSksInt?: number;
  s1Rpl?: number;
  s1It?: number;
  s2If?: number;
  s1IfPjj?: number;
  s1Ds?: number;
  s2Fs?: number;
  s1IfTukj?: number;
  s3If?: number;
  totalSksIntNormal?: number;
  totalSksIntDouble?: number;
  sksBerjabatanPlusNormal?: number;
}

@Component({
  selector: 'app-beban-sks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    LoadingSpinnerComponent,
    ActionButtonComponent,
    PaginationComponent
  ],
  templateUrl: './beban-sks.component.html',
  styleUrls: ['./beban-sks.component.scss']
})
export class BebanSksComponent implements OnInit {
  paginatedData: BebanSksDosen[] = [];
  tahunAjaranOptions: TahunAjaran[] = [];
  selectedTahunAjaranId: number | null = null;
  searchQuery: string = '';
  private searchSubject = new Subject<string>();

  isLoading: boolean = true;
  currentPage: number = 1;
  pageSizeOptions: number[] = [9, 12, 15];
  pageSize: number = 12;
  totalItems: number = 0;

  dosenIdFromRoute: number | null = null;
  pageTitle: string = 'Laporan Beban SKS Dosen';

  columnConfigs: ColumnConfig[] = [];
  tableMinimuWidth: string = '3600px';

  private dosenService = inject(DosenService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('dosenId');
    if (idParam) {
      this.dosenIdFromRoute = +idParam;
      this.pageTitle = 'Rincian Beban SKS Dosen';
    }

    this.setupColumnConfigs();
    this.loadTahunAjaran();

    if (!this.dosenIdFromRoute) {
      this.setupSearchDebounce();
    }
  }

  setupColumnConfigs(): void {
    this.columnConfigs = [
      { key: 'no', label: 'No', isSticky: true, stickyOrder: 0, width: '60px', minWidth: '60px' },
      { key: 'kode', label: 'Kode', isSticky: true, stickyOrder: 1, width: '80px', minWidth: '80px' },
      { key: 'nama', label: 'Nama', isSticky: true, stickyOrder: 2, width: '220px', minWidth: '220px' },
      { key: 'prodi', label: 'Prodi', isSticky: true, stickyOrder: 3, width: '280px', minWidth: '280px' },
      { key: 'jfa', label: 'JFA', width: '140px' },
      { key: 'statusDosen', label: 'Status Dosen', width: '120px' },
      { key: 'maxSks', label: 'Max SKS', width: '80px', customClass: 'text-center' },
      { key: 'struktural', label: 'Struktural', width: '240px' },
      { key: 'statusKepegawaian', label: 'Status Kepegawaian', width: '150px' },
      { key: 's1IfRegIntNormal', label: 'S1 IF (REG+INT SKS Normal)', width: '160px', cellCustomClass: 'mint-green-bg' },
      { key: 's1IfDoubleSksInt', label: 'S1 IF (double SKS INT)', width: '160px', cellCustomClass: 'mint-green-bg' },
      { key: 's1Rpl', label: 'S1 RPL', width: '80px', cellCustomClass: 'mint-green-bg' },
      { key: 's1It', label: 'S1 IT', width: '80px', cellCustomClass: 'mint-green-bg' },
      { key: 's2If', label: 'S2 IF', width: '80px', cellCustomClass: 'mint-green-bg' },
      { key: 's1IfPjj', label: 'S1 IF PJJ', width: '100px', cellCustomClass: 'mint-green-bg' },
      { key: 's1Ds', label: 'S1 DS', width: '80px', cellCustomClass: 'mint-green-bg' },
      { key: 's2Fs', label: 'S2 FS', width: '80px', cellCustomClass: 'mint-green-bg' },
      { key: 's1IfTukj', label: 'S1 IF TUKJ', width: '100px', cellCustomClass: 'mint-green-bg' },
      { key: 's3If', label: 'S3 IF', width: '80px', cellCustomClass: 'mint-green-bg' },
      { key: 'totalSksIntNormal', label: 'Total SKS INT Normal', width: '140px', cellCustomClass: 'blush-pink-bg' },
      { key: 'totalSksIntDouble', label: 'Total SKS INT Double', width: '140px', cellCustomClass: 'blush-pink-bg' },
      { key: 'sksBerjabatanPlusNormal', label: 'SKS Berjabatan + SKS Normal', width: '160px', cellCustomClass: 'blush-pink-bg' },
    ];
  }

  loadTahunAjaran(): void {
    this.isLoading = true;
    this.dosenService.getTahunAjaran().subscribe({
      next: (response) => {
        this.tahunAjaranOptions = response;
        if (this.tahunAjaranOptions.length > 0) {
          this.selectedTahunAjaranId = this.tahunAjaranOptions[0].id;
          this.loadDosenBebanSksData();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.notificationService.showError("Failed to load academic years.");
        console.error("Failed to load tahun ajaran", err.message);
        this.isLoading = false;
      }
    });
  }

  loadDosenBebanSksData(): void {
    if (!this.selectedTahunAjaranId) return;
    this.isLoading = true;

    if (this.dosenIdFromRoute) {
      this.dosenService.getBebanSksDosenByTahun(this.dosenIdFromRoute, this.selectedTahunAjaranId).subscribe({
        next: (response) => {
          if (response.success && response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const lecturerData = response.data.data[0];
            this.paginatedData = [this.transformApiDataToBebanSksDosen(lecturerData, 1)];
            this.totalItems = 1;
            this.currentPage = 1;
            this.pageTitle = `Rincian Beban SKS Dosen: ${lecturerData.nama_dosen}`;
          } else {
            this.paginatedData = [];
            this.totalItems = 0;
            this.notificationService.showError(response.message || "Data for this lecturer not found.");
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Failed to load single lecturer SKS data", err);
          this.notificationService.showError("Failed to load lecturer's SKS data.");
          this.isLoading = false;
        }
      });
    } else {
      const params = {
        page: this.currentPage,
        per_page: this.pageSize,
        search: this.searchQuery,
      };
      this.dosenService.getLaporanBebanSksDosen(this.selectedTahunAjaranId, params).subscribe({
        next: (response) => {
          if (response.success && response.data && Array.isArray(response.data.data)) {
            const startIndex = (response.data.current_page - 1) * response.data.per_page;
            this.paginatedData = response.data.data.map((apiItem, index) =>
              this.transformApiDataToBebanSksDosen(apiItem, startIndex + index + 1)
            );
            this.totalItems = response.data.total;
            this.currentPage = response.data.current_page;
          } else {
            this.paginatedData = [];
            this.totalItems = 0;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Failed to load beban SKS data", err);
          this.notificationService.showError("Failed to load SKS data.");
          this.isLoading = false;
          this.paginatedData = [];
          this.totalItems = 0;
        }
      });
    }
  }

  private transformApiDataToBebanSksDosen(apiItem: BebanSksApiData, index: number): BebanSksDosen {
    const prodiSks = apiItem.total_ajar_per_prodi || {};
    console.log('Prodi SKS:', apiItem.status_pegawai);
    return {
      no: index,
      kode: apiItem.kode_dosen,
      nama: apiItem.nama_dosen,
      prodi: apiItem.kelompok_keahlian,
      jfa: apiItem.jfa,
      statusDosen: '-',
      maxSks: apiItem.max_ajar_sks,
      struktural: apiItem.jabatan_struktural || '-',
      statusKepegawaian: apiItem.status_pegawai,
      s1IfRegIntNormal: prodiSks['S1 IF (REG+INT SKS Normal)'] || 0,
      s1IfDoubleSksInt: prodiSks['S1 IF (double SKS INT)'] || 0,
      s1Rpl: prodiSks['S1 Rekayasa Perangkat Lunak'] || 0,
      s1It: prodiSks['S1 Information Technology'] || 0,
      s2If: prodiSks['S2 Informatika'] || 0,
      s1IfPjj: prodiSks['S1 IF PJJ'] || 0,
      s1Ds: prodiSks['S1 Data Sains'] || 0,
      s2Fs: prodiSks['S2 FS'] || 0,
      s1IfTukj: prodiSks['S1 IF TUKJ'] || 0,
      s3If: prodiSks['S3 IF'] || 0,
      totalSksIntNormal: 0,
      totalSksIntDouble: 0,
      sksBerjabatanPlusNormal: 0,
    };
  }

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadDosenBebanSksData();
    });
  }

  onSearchQueryChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDosenBebanSksData();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadDosenBebanSksData();
  }

  onTahunAjaranChange(): void {
    this.currentPage = 1;
    this.loadDosenBebanSksData();
  }

  onBack(): void {
    this.location.back();
  }
}