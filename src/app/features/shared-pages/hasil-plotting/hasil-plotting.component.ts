import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicTableComponent, ColumnConfig, ActionButtonComponent } from '../../../shared/components';

export interface MataKuliah {
  no: number;
  idMatkul: string;
  matkul: string;
  pic: string;
  dosen: string;
  mandatory: string;
  tingkatMatkul: string;
  kredit: number;
  kelas: string;
  praktikum: string;
  koordinator: string;
  semester: string;
  hourTarget: number;
  tahunAjaran: string;
  mkEksepsi: string;
}

@Component({
  selector: 'app-hasil-plotting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ActionButtonComponent
  ],
  templateUrl: './hasil-plotting.component.html',
  styleUrls: ['./hasil-plotting.component.scss']
})
export class HasilPlottingComponent implements OnInit {

  mataKuliahData: MataKuliah[] = [];
  paginatedData: MataKuliah[] = [];

  currentPage: number = 1;
  pageSize: number = 12;
  pageSizeOptions: number[] = [12, 24, 36, 50];
  totalPages: number = 0;
  totalItems: number = 0;

  mataKuliahColumnConfigs: ColumnConfig[] = [];
  tableMinimuWidth: string = '2000px';
  private stickyCol0Width: string = '60px';
  private stickyCol1Width: string = '120px';
  private stickyCol2Width: string = '360px';
  private stickyCol3Width: string = '80px';
  private stickyCol4Width: string = '110px';
  private colKelasWidth: string = '160px';
  private colMkEksepsiWidth: string = '240px';



  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.setupColumnConfigs();
    this.loadMataKuliahData();
  }

  setupColumnConfigs(): void {
    this.mataKuliahColumnConfigs = [
      { key: 'no', label: 'No', isSticky: true, stickyOrder: 0, width: this.stickyCol0Width, minWidth: this.stickyCol0Width, customClass: 'text-center' },
      { key: 'idMatkul', label: 'ID Matkul', isSticky: true, stickyOrder: 1, width: this.stickyCol1Width, minWidth: this.stickyCol1Width },
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
      { key: 'mkEksepsi', label: 'MK Eksepsi', width: this.colMkEksepsiWidth, minWidth: this.colMkEksepsiWidth }
    ];
  }

  loadMataKuliahData(): void {
    this.mataKuliahData = [];
    for (let i = 1; i <= 75; i++) {
      this.mataKuliahData.push({
        no: i,
        idMatkul: `CRI3I${(i % 10) + 1}`,
        matkul: `MATA KULIAH ${String.fromCharCode(65 + (i % 15))} Rev.${i % 3}`,
        pic: ['SEAL', 'BNL', 'SUI', 'VLY', 'RDT'][i % 5],
        dosen: ['VLY', 'SUI', 'BNL', 'SEAL', 'RDT'][i % 5],
        mandatory: i % 2 === 0 ? 'Wajib Prodi' : 'Pilihan',
        tingkatMatkul: `Tingkat ${(i % 4) + 1}`,
        kredit: (i % 3) + 2,
        kelas: `IF-4${(i % 3) + 1}-0${(i % 4) + 1}`,
        praktikum: i % 3 === 0 ? 'YES' : 'NO',
        koordinator: ['SUI', 'VLY', 'SEAL', 'BNL', 'RDT'][i % 5],
        semester: (i % 2 === 0) ? 'Ganjil' : 'Genap',
        hourTarget: 100 + (i % 8) * 10,
        tahunAjaran: '2024/2025',
        mkEksepsi: i % 7 === 0 ? 'ADA EKSEPSI KHUSUS' : '-'
      });
    }
    this.totalItems = this.mataKuliahData.length;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.currentPage < 1 && this.totalItems > 0) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalItems === 0) {
      this.currentPage = 1;
      this.totalPages = 0;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    this.paginatedData = this.mataKuliahData.slice(startIndex, endIndex);
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
    if (this.totalItems === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  onBack(): void {
    this.router.navigate(['/plotting']);
  }

  onDownloadExcel(): void {
    console.log('Download Excel button clicked. Implement download service call.');
    // Placeholder for actual download logic
    // Example:
    // this.downloadService.downloadExcel(this.mataKuliahData).subscribe(...);
  }
}
