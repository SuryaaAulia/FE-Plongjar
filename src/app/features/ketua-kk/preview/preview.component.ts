import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component'; // Adjusted path
// Make sure DynamicTableComponent is correctly imported
import { DynamicTableComponent, ColumnConfig } from '../../../shared/components/dynamic-table/dynamic-table.component'; // Adjust path as needed

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
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    DynamicTableComponent // Add DynamicTableComponent here
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  mataKuliahData: MataKuliah[] = [];
  paginatedData: MataKuliah[] = [];

  currentPage: number = 1;
  pageSize: number = 12;
  pageSizeOptions: number[] = [12, 24, 36];
  totalPages: number = 0;
  totalItems: number = 0;

  // Column configurations for the dynamic table
  mataKuliahColumnConfigs: ColumnConfig[] = [];
  tableMinimuWidth: string = '2000px'; // Adjust as needed, sum of all column widths

  isConfirmationModalVisible: boolean = false;
  confirmationModalMessage: string = 'Plottingan yang di-<strong>submit</strong> akan langsung diteruskan ke LAA, pastikan data yang anda masukan sudah benar!';

  // SCSS variables (ideally, these would be defined in a more global way or directly in TS if not used in SCSS elsewhere)
  // For demonstration, using them to define widths.
  // These values were originally in preview.component.scss
  private stickyCol0Width: string = '60px';
  private stickyCol1Width: string = '120px';
  private stickyCol2Width: string = '360px';
  private stickyCol3Width: string = '80px';
  private stickyCol4Width: string = '110px';
  private colKelasWidth: string = '160px';
  private colMkEksepsiWidth: string = '240px';


  constructor() { }

  ngOnInit(): void {
    this.setupColumnConfigs(); // Setup columns first
    this.loadMataKuliahData(); // Then load data
  }

  setupColumnConfigs(): void {
    this.mataKuliahColumnConfigs = [
      { key: 'no', label: 'No', isSticky: true, stickyOrder: 0, width: this.stickyCol0Width, minWidth: this.stickyCol0Width },
      { key: 'idMatkul', label: 'ID Matkul', isSticky: true, stickyOrder: 1, width: this.stickyCol1Width, minWidth: this.stickyCol1Width },
      { key: 'matkul', label: 'Matkul', isSticky: true, stickyOrder: 2, width: this.stickyCol2Width, minWidth: this.stickyCol2Width },
      { key: 'pic', label: 'PIC', isSticky: true, stickyOrder: 3, width: this.stickyCol3Width, minWidth: this.stickyCol3Width },
      { key: 'dosen', label: 'Dosen', isSticky: true, stickyOrder: 4, width: this.stickyCol4Width, minWidth: this.stickyCol4Width, cellCustomClass: 'dosen-col' }, // Added custom class
      { key: 'mandatory', label: 'Mandatory', width: '150px' },
      { key: 'tingkatMatkul', label: 'Tingkat Matkul', width: '150px' },
      { key: 'kredit', label: 'Kredit', width: '80px', customClass: 'text-center' }, // Example custom class for centering
      { key: 'kelas', label: 'Kelas', width: this.colKelasWidth, minWidth: this.colKelasWidth },
      { key: 'praktikum', label: 'Praktikum', width: '100px' },
      { key: 'koordinator', label: 'Koordinator', width: '110px', cellCustomClass: 'koordinator-col' }, // Added custom class
      { key: 'semester', label: 'Semester', width: '100px' },
      { key: 'hourTarget', label: 'Hour Target', width: '120px' },
      { key: 'tahunAjaran', label: 'Tahun Ajaran', width: '120px' },
      { key: 'mkEksepsi', label: 'MK Eksepsi', width: this.colMkEksepsiWidth, minWidth: this.colMkEksepsiWidth }
    ];

    // Calculate minimum table width (optional, can be set manually too)
    // this.tableMinimuWidth = this.mataKuliahColumnConfigs.reduce((sum, col) => {
    // const widthVal = parseInt(col.width || '0', 10);
    // return sum + (isNaN(widthVal) ? 150 : widthVal); // Estimate 150px for 'auto' or non-px widths
    // }, 0) + 'px';
  }

  loadMataKuliahData(): void {
    this.mataKuliahData = [];
    for (let i = 1; i <= 50; i++) {
      this.mataKuliahData.push({
        no: i,
        idMatkul: `CRI3I${i % 10 === 0 ? 1 : i % 10}`, // More varied ID
        matkul: `MOBILE PROGRAMMING ${String.fromCharCode(65 + (i % 5))}`, // More varied name
        pic: ['SEAL', 'BNL', 'SUI', 'VLY'][i % 4],
        dosen: ['VLY', 'SUI', 'BNL', 'SEAL'][i % 4],
        mandatory: i % 2 === 0 ? 'Wajib Prodi' : 'Pilihan',
        tingkatMatkul: `Tingkat ${(i % 3) + 1}`,
        kredit: (i % 3) + 2, // 2, 3, or 4
        kelas: `SE-45-0${(i % 4) + 1}`,
        praktikum: i % 2 === 0 ? 'YES' : 'NO',
        koordinator: ['SUI', 'VLY', 'SEAL', 'BNL'][i % 4],
        semester: i % 2 === 0 ? 'Ganjil' : 'Genap',
        hourTarget: 120 + (i % 5) * 10,
        tahunAjaran: '2024/2025',
        mkEksepsi: i % 10 === 0 ? 'ADA EKSEPSI' : '-'
      });
    }

    this.totalItems = this.mataKuliahData.length;
    this.updatePagination();
  }


  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0 && this.totalItems > 0) { // if totalPages is 0 but items exist (pageSize issue)
      this.currentPage = 1;
      this.totalPages = 1; // Should have at least one page
    } else if (this.totalItems === 0) {
      this.currentPage = 1;
      this.totalPages = 0;
    }


    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);

    this.paginatedData = this.mataKuliahData.slice(startIndex, endIndex);
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when page size changes
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
    console.log('Main Back button clicked');
    // Implement navigation or other back logic
  }

  onSubmit(): void {
    this.isConfirmationModalVisible = true;
  }

  handleModalConfirm(): void {
    console.log('Data submission confirmed by user!');
    // Actual submission logic here
    this.isConfirmationModalVisible = false;
  }

  handleModalCancel(): void {
    console.log('Data submission cancelled by user.');
    this.isConfirmationModalVisible = false;
  }
}
