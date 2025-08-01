import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  DynamicTableComponent,
  ColumnConfig,
  ActionButtonComponent,
  PaginationComponent,
} from '../../../shared/components';
import { AuthService } from '../../../core/services/auth.service';
import { MatakuliahService, HasilPlottingRow } from '../../../core/services/matakuliah.service';
import { TahunAjaran } from '../../../core/models/user.model';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';


export interface ProgramStudi {
  id: number;
  nama: string;
}


@Component({
  selector: 'app-hasil-plotting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ActionButtonComponent,
    PaginationComponent,
  ],
  templateUrl: './hasil-plotting.component.html',
  styleUrls: ['./hasil-plotting.component.scss'],
})
export class HasilPlottingComponent implements OnInit {
  mataKuliahData: HasilPlottingRow[] = [];
  paginatedData: HasilPlottingRow[] = [];
  currentPage: number = 1;
  pageSize: number = 12;
  pageSizeOptions: number[] = [12, 24, 36, 50];
  totalItems: number = 0;

  tahunAjaranOptions: TahunAjaran[] = [];
  programStudiOptions: ProgramStudi[] = [];
  selectedTahunAjaranId: number | null = null;
  selectedProdiId: number | null = null;

  selectedProdiName: string = '';
  selectedTahunAjaranName: string = '';
  currentUserRole: string | null = null;

  isLoading: boolean = false;

  pageTitle: string = 'Tabel Hasil Plottingan';

  mataKuliahColumnConfigs: ColumnConfig[] = [];
  tableMinimuWidth: string = '2000px';
  private stickyCol0Width: string = '60px';
  private stickyCol1Width: string = '110px';
  private stickyCol2Width: string = '260px';
  private stickyCol3Width: string = '280px';
  private stickyCol4Width: string = '100px';
  private colKelasWidth: string = '160px';
  private colMkEksepsiWidth: string = '140px';

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  constructor(
    private location: Location,
    private matakuliahService: MatakuliahService
  ) { }

  ngOnInit(): void {
    this.currentUserRole = this.authService.getCurrentUser()?.currentRole?.role_name!;

    this.setupColumnConfigs();
    const prodiIdFromRoute = this.route.snapshot.paramMap.get('prodiId');
    const tahunIdFromRoute = this.route.snapshot.paramMap.get('tahunAjaranId');

    this.selectedProdiId = prodiIdFromRoute ? +prodiIdFromRoute : null;
    this.selectedTahunAjaranId = tahunIdFromRoute ? +tahunIdFromRoute : null;

    if (this.isSpecialRole) {
      this.loadHasilPlottingan();
    } else {
      this.loadFilterOptions();
    }
  }

  get isSpecialRole(): boolean {
    return this.currentUserRole === 'KepalaUrusanLab' || this.currentUserRole === 'LayananAkademik';
  }

  setupColumnConfigs(): void {
    this.mataKuliahColumnConfigs = [
      { key: 'no', label: 'No', isSticky: true, stickyOrder: 0, width: this.stickyCol0Width, minWidth: this.stickyCol0Width, customClass: 'text-center' },
      { key: 'idMatkul', label: 'Kode Matkul', isSticky: true, stickyOrder: 1, width: this.stickyCol1Width, minWidth: this.stickyCol1Width },
      { key: 'matkul', label: 'Matkul', isSticky: true, stickyOrder: 2, width: this.stickyCol2Width, minWidth: this.stickyCol2Width },
      { key: 'pic', label: 'PIC', isSticky: true, stickyOrder: 3, width: this.stickyCol3Width, minWidth: this.stickyCol3Width },
      { key: 'dosen', label: 'Dosen', isSticky: true, stickyOrder: 4, width: this.stickyCol4Width, minWidth: this.stickyCol4Width, cellCustomClass: 'dosen-col' },
      { key: 'mandatory', label: 'Mandatory', width: '150px' },
      { key: 'tingkatMatkul', label: 'Tingkat Matkul', width: '150px' },
      { key: 'kredit', label: 'Kredit', width: '80px', customClass: 'text-center' },
      { key: 'kelas', label: 'Kelas', width: this.colKelasWidth, minWidth: this.colKelasWidth },
      { key: 'praktikum', label: 'Praktikum', width: '100px', customClass: 'text-center' },
      { key: 'koordinator', label: 'Koordinator', width: '110px', cellCustomClass: 'koordinator-col' },
      { key: 'semester', label: 'Semester', width: '100px' },
      { key: 'hourTarget', label: 'Hour Target', width: '120px', customClass: 'text-right' },
      { key: 'tahunAjaran', label: 'Tahun Ajaran', width: '120px', customClass: 'text-center' },
      { key: 'teamTeaching', label: 'Team Teaching', width: '120px', customClass: 'text-center' },
      { key: 'mkEksepsi', label: 'MK Eksepsi', width: this.colMkEksepsiWidth, minWidth: this.colMkEksepsiWidth }
    ];
  }

  loadFilterOptions(): void {
    this.isLoading = true;
    forkJoin({
      prodi: this.matakuliahService.getProgramStudi(),
      tahun: this.matakuliahService.getTahunAjaran(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ prodi, tahun }) => {
          this.programStudiOptions = prodi;
          this.tahunAjaranOptions = tahun;

          if (this.selectedProdiId === null && prodi.length > 0) {
            this.selectedProdiId = prodi[0].id;
          }
          if (this.selectedTahunAjaranId === null && tahun.length > 0) {
            this.selectedTahunAjaranId = tahun[0].id;
          }

          this.loadHasilPlottingan();
        },
        error: (err) =>
          console.error('Error loading filter options:', err),
      });
  }

  loadHasilPlottingan(): void {
    if (!this.selectedTahunAjaranId || !this.selectedProdiId) {
      this.mataKuliahData = [];
      this.totalItems = 0;
      this.paginatedData = [];
      return;
    }

    this.isLoading = true;
    const params = new HttpParams()
      .set('page', this.currentPage)
      .set('per_page', this.pageSize);

    this.matakuliahService
      .getHasilPlottinganByProdi(this.selectedTahunAjaranId, this.selectedProdiId, params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.mataKuliahData = response.data;
          this.totalItems = response.total ?? this.mataKuliahData.length;
          this.paginatedData = this.mataKuliahData.map((item, index) => ({
            ...item,
            no: (this.currentPage - 1) * this.pageSize + index + 1
          }));
        },
        error: (err) => {
          console.error('Error fetching hasil plottingan:', err);
          this.mataKuliahData = [];
          this.paginatedData = [];
          this.totalItems = 0;
        },
      });
  }


  onFilterChange(): void {
    this.currentPage = 1;
    this.loadHasilPlottingan();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadHasilPlottingan();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadHasilPlottingan();
  }

  updatePaginatedData(): void {
    if (this.totalItems === 0) {
      this.paginatedData = [];
      return;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    this.paginatedData = this.mataKuliahData.slice(startIndex, endIndex)
      .map((item, index) => ({
        ...item,
        no: startIndex + index + 1
      }));
  }

  onBack(): void {
    this.location.back();
  }

  onDownloadExcel(): void {
    if (!this.selectedTahunAjaranId || !this.selectedProdiId) {
      console.error('Cannot download, filter not selected.');
      return;
    }

    this.matakuliahService
      .exportPlottinganByProdi(
        this.selectedTahunAjaranId,
        this.selectedProdiId
      )
      .subscribe({
        next: (blob) => {
          const prodiName = this.programStudiOptions.find(p => p.id === this.selectedProdiId)?.nama?.replace(/\s/g, '_') || 'prodi';
          const tahunAjaranName = this.tahunAjaranOptions.find(t => t.id === this.selectedTahunAjaranId)?.tahun_ajaran?.replace(/[\/\s]/g, '_') || 'tahun_ajaran';
          const fileName = `hasil_plotting_${prodiName}_${tahunAjaranName}.xlsx`;

          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err) => console.error('Error downloading excel file:', err),
      });
  }
}