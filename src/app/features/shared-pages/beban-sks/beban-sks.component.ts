import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, ColumnConfig, LoadingSpinnerComponent, ActionButtonComponent, PaginationComponent } from '../../../shared/components/index';
import { DosenService, BebanSksApiData } from '../../../core/services/dosen.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TahunAjaran } from '../../../core/models/user.model';

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

  columnConfigs: ColumnConfig[] = [];
  tableMinimuWidth: string = '3600px';

  constructor(private dosenService: DosenService) { }

  ngOnInit(): void {
    this.setupColumnConfigs();
    this.loadTahunAjaran();
    this.setupSearchDebounce();
  }

  setupColumnConfigs(): void {
    this.columnConfigs = [
      { key: 'no', label: 'No', isSticky: true, stickyOrder: 0, width: '60px', minWidth: '60px' },
      { key: 'kode', label: 'Kode', isSticky: true, stickyOrder: 1, width: '60px', minWidth: '60px' },
      { key: 'nama', label: 'Nama', isSticky: true, stickyOrder: 2, width: '180px', minWidth: '180px' },
      { key: 'prodi', label: 'Prodi', isSticky: true, stickyOrder: 3, width: '320px', minWidth: '320px' },
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
        console.error("Failed to load tahun ajaran", err.message);
        this.isLoading = false;
      }
    });
  }

  loadDosenBebanSksData(): void {
    if (!this.selectedTahunAjaranId) return;

    this.isLoading = true;
    const params = {
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.searchQuery,
    };

    this.dosenService.getLaporanBebanSksDosen(this.selectedTahunAjaranId, params).subscribe({
      next: (response) => {
        if (response.success) {
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
        console.error("Failed to load beban SKS data", err.message);
        this.isLoading = false;
        this.paginatedData = [];
        this.totalItems = 0;
      }
    });
  }

  private transformApiDataToBebanSksDosen(apiItem: BebanSksApiData, index: number): BebanSksDosen {
    const prodiSks = apiItem.total_ajar_per_prodi || {};

    const transformed: BebanSksDosen = {
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
      s1Rpl: prodiSks['S1 RPL'] || 0,
      s1It: prodiSks['S1 IT'] || 0,
      s2If: prodiSks['S2 IF'] || 0,
      s1IfPjj: prodiSks['S1 IF PJJ'] || 0,
      s1Ds: prodiSks['S1 DS'] || 0,
      s2Fs: prodiSks['S2 FS'] || 0,
      s1IfTukj: prodiSks['S1 IF TUKJ'] || 0,
      s3If: prodiSks['S3 IF'] || 0,
      totalSksIntNormal: 0,
      totalSksIntDouble: 0,
      sksBerjabatanPlusNormal: 0,
    };

    return transformed;
  }

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
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
    console.log('Beban SKS Back button clicked');
  }
}