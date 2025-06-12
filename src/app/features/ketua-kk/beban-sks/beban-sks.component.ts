import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, ColumnConfig, LoadingSpinnerComponent, ActionButtonComponent } from '../../../shared/components/index';

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
    ActionButtonComponent
  ],
  templateUrl: './beban-sks.component.html',
  styleUrls: ['./beban-sks.component.scss']
})
export class BebanSksComponent implements OnInit {
  dosenBebanSksData: BebanSksDosen[] = [];
  paginatedData: BebanSksDosen[] = [];

  isLoading: boolean = true;
  currentPage: number = 1;
  pageSize: number = 12;
  pageSizeOptions: number[] = [12, 30, 50];
  totalPages: number = 0;
  totalItems: number = 0;

  columnConfigs: ColumnConfig[] = [];
  tableMinimuWidth: string = '3600px';

  constructor() { }

  ngOnInit(): void {
    this.isLoading = true;
    this.setupColumnConfigs();
    this.loadDosenBebanSksData();
  }

  setupColumnConfigs(): void {
    this.columnConfigs = [
      { key: 'no', label: 'No', isSticky: true, stickyOrder: 0, width: '60px', minWidth: '60px' },
      { key: 'kode', label: 'Kode', isSticky: true, stickyOrder: 1, width: '80px', minWidth: '80px' },
      { key: 'nama', label: 'Nama', isSticky: true, stickyOrder: 2, width: '250px', minWidth: '250px' },
      { key: 'prodi', label: 'Prodi', isSticky: true, stickyOrder: 3, width: '100px', minWidth: '100px' },

      { key: 'jfa', label: 'JFA', width: '140px' },
      { key: 'statusDosen', label: 'Status Dosen', width: '120px' },
      { key: 'maxSks', label: 'Max SKS', width: '80px', customClass: 'text-center' },
      { key: 'struktural', label: 'Struktural', width: '320px' },
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

  loadDosenBebanSksData(): void {
    this.isLoading = true;

    setTimeout(() => {
      const sampleData: BebanSksDosen[] = [];
      for (let i = 1; i <= 75; i++) {
        sampleData.push({
          no: i,
          kode: `SUI`,
          nama: `Dosen Ke-${i} Sejahtera`,
          prodi: ['S1 ', 'S2 ', 'S3 '][i % 3] + ['IF', 'SI', 'DS', 'TE'][i % 4],
          jfa: ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'][i % 4],
          statusDosen: i % 2 === 0 ? 'Aktif' : 'Tidak Aktif',
          maxSks: 12 + (i % 3 * 2),
          struktural: 'Ka.Prodi S1 Rekayasa Perangkat Lunak',
          statusKepegawaian: i % 2 === 0 ? 'Tetap' : 'Kontrak',
          s1IfRegIntNormal: (i % 5) * 2,
          s1IfDoubleSksInt: i % 4,
          s1Rpl: i % 3,
          s1It: i % 5,
          s2If: i % 2,
          s1IfPjj: i % 3,
          s1Ds: (i % 4) + 1,
          s2Fs: i % 2,
          s1IfTukj: i % 3,
          s3If: i % 4 === 0 ? 1 : 0,
          totalSksIntNormal: 8 + i % 5,
          totalSksIntDouble: 2 + i % 3,
          sksBerjabatanPlusNormal: 10 + i % 6,
        });
      }
      this.dosenBebanSksData = sampleData;
      this.totalItems = this.dosenBebanSksData.length;
      this.updatePagination();
      this.isLoading = false;
    }, 800);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.totalPages === 0 && this.totalItems > 0) {
      this.totalPages = 1;
    }
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalItems === 0) {
      this.currentPage = 1;
      this.totalPages = 0;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedData = this.dosenBebanSksData.slice(startIndex, startIndex + this.pageSize);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getStartRecord(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  onBack(): void {
    console.log('Beban SKS Back button clicked');
  }
}