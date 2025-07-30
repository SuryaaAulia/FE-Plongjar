import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DynamicTableComponent, ColumnConfig, LoadingSpinnerComponent, ActionButtonComponent, PaginationComponent } from '../../../shared/components/index';
import { DosenService, BebanSksApiData, DosenListParams } from '../../../core/services/dosen.service';
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
  sksBerjabatanPlusNormal?: number;
  [key: string]: any;
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

  pageTitle: string = 'Tabel Beban SKS Dosen';

  cameFromExternal: boolean = true;

  columnConfigs: ColumnConfig[] = [];
  tableMinimuWidth: string = '3600px';

  availableProgramStudi: string[] = [];

  private dosenService = inject(DosenService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('dosenId');
    if (idParam) {
      this.dosenIdFromRoute = +idParam;
      this.pageTitle = 'Rincian Beban SKS Dosen';
    }
    this.loadTahunAjaran();
    if (!this.dosenIdFromRoute) {
      this.setupSearchDebounce();
    }
  }

  setupBaseColumnConfigs(): void {
    this.columnConfigs = [
      { key: 'no', label: 'No', isSticky: true, stickyOrder: 0, width: '60px', minWidth: '60px' },
      { key: 'kode', label: 'Kode', isSticky: true, stickyOrder: 1, width: '80px', minWidth: '80px' },
      { key: 'nama', label: 'Nama', isSticky: true, stickyOrder: 2, width: '220px', minWidth: '220px' },
      { key: 'prodi', label: 'Prodi/PIC', isSticky: true, stickyOrder: 3, width: '280px', minWidth: '280px' },
      { key: 'jfa', label: 'JFA', width: '140px' },
      { key: 'statusDosen', label: 'Status Dosen', width: '120px' },
      { key: 'maxSks', label: 'Max SKS', width: '80px', customClass: 'text-center' },
      { key: 'struktural', label: 'Struktural', width: '240px' },
      { key: 'statusKepegawaian', label: 'Status Kepegawaian', width: '150px' },
    ];
  }

  setupDynamicColumnConfigs(): void {
    this.setupBaseColumnConfigs();

    this.availableProgramStudi.forEach(prodiName => {
      const prodiKey = this.convertProdiNameToKey(prodiName);
      this.columnConfigs.push({
        key: prodiKey,
        label: prodiName,
        width: '160px',
        cellCustomClass: 'mint-green-bg'
      });
    });

    this.columnConfigs.push(
      { key: 'sksBerjabatanPlusNormal', label: 'SKS Berjabatan + SKS Normal', width: '160px', cellCustomClass: 'blush-pink-bg' }
    );

    const estimatedWidth = this.columnConfigs.length * 140;
    this.tableMinimuWidth = `${Math.max(3600, estimatedWidth)}px`;
  }

  private convertProdiNameToKey(prodiName: string): string {
    return prodiName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, '')
      .replace(/__+/g, '_');
  }

  private extractProgramStudiFromResponse(data: BebanSksApiData[]): void {
    if (data.length === 0) return;

    const firstItem = data[0];
    if (firstItem.total_ajar_per_prodi) {
      this.availableProgramStudi = Object.keys(firstItem.total_ajar_per_prodi);
    }
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

            this.extractProgramStudiFromResponse([lecturerData]);
            this.setupDynamicColumnConfigs();

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
      const params: DosenListParams = {
        page: this.currentPage,
        per_page: this.pageSize,
        nama_or_nip: this.searchQuery,
      };

      this.dosenService.getLaporanBebanSksDosen(this.selectedTahunAjaranId, params).subscribe({
        next: (response) => {
          if (response.success && response.data && Array.isArray(response.data.data)) {
            if (response.data.data.length > 0 && this.availableProgramStudi.length === 0) {
              this.extractProgramStudiFromResponse(response.data.data);
              this.setupDynamicColumnConfigs();
            }

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

    const baseData: BebanSksDosen = {
      no: index,
      kode: apiItem.kode_dosen,
      nama: apiItem.nama_dosen,
      prodi: apiItem.kelompok_keahlian,
      jfa: apiItem.jfa,
      statusDosen: '-',
      maxSks: apiItem.max_ajar_sks,
      struktural: apiItem.jabatan_struktural || '-',
      statusKepegawaian: apiItem.status_pegawai,
      sksBerjabatanPlusNormal: apiItem.total_ajar_sks_keseluruhan || 0,
    };

    this.availableProgramStudi.forEach(prodiName => {
      const prodiKey = this.convertProdiNameToKey(prodiName);
      baseData[prodiKey] = prodiSks[prodiName] || 0;
    });

    return baseData;
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
    this.availableProgramStudi = [];
    this.loadDosenBebanSksData();
  }

  onBack(): void {
    if (this.dosenIdFromRoute) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}