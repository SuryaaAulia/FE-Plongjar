import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../../shared/components/'

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
    ConfirmationModalComponent
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

  tableHeaders: { key: keyof MataKuliah | 'no', label: string, isSticky?: boolean }[] = [
    { key: 'no', label: 'No', isSticky: true },
    { key: 'idMatkul', label: 'ID Matkul', isSticky: true },
    { key: 'matkul', label: 'Matkul', isSticky: true },
    { key: 'pic', label: 'PIC', isSticky: true },
    { key: 'dosen', label: 'Dosen', isSticky: true },
    { key: 'mandatory', label: 'Mandatory' },
    { key: 'tingkatMatkul', label: 'Tingkat Matkul' },
    { key: 'kredit', label: 'Kredit' },
    { key: 'kelas', label: 'Kelas' },
    { key: 'praktikum', label: 'Praktikum' },
    { key: 'koordinator', label: 'Koordinator' },
    { key: 'semester', label: 'Semester' },
    { key: 'hourTarget', label: 'Hour Target' },
    { key: 'tahunAjaran', label: 'Tahun Ajaran' },
    { key: 'mkEksepsi', label: 'MK Eksepsi' }
  ];

  isConfirmationModalVisible: boolean = false;
  confirmationModalMessage: string = 'Plottingan yang di-<strong>submit</strong> akan langsung diteruskan ke LAA, pastikan data yang anda masukan sudah benar!';


  constructor() { }

  ngOnInit(): void {
    this.mataKuliahData = [];
    for (let i = 1; i <= 50; i++) {
      this.mataKuliahData.push({
        no: i,
        idMatkul: 'CRI3I3',
        matkul: 'MOBILE PROGRAMMING',
        pic: 'SEAL',
        dosen: 'VLY',
        mandatory: 'Wajib Prodi',
        tingkatMatkul: 'Tingkat 3',
        kredit: 4,
        kelas: 'SE-45-02',
        praktikum: 'YES',
        koordinator: 'SUI',
        semester: 'Ganjil',
        hourTarget: 160,
        tahunAjaran: '2024/2025',
        mkEksepsi: '-'
      });
    }

    this.totalItems = this.mataKuliahData.length;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
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
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  getCellData(item: MataKuliah, key: keyof MataKuliah | 'no'): any {
    return item[key as keyof MataKuliah];
  }

  getStickyClass(headerKey: keyof MataKuliah | 'no'): string {
    const stickyOrder = ['no', 'idMatkul', 'matkul', 'pic', 'dosen'];
    const index = stickyOrder.indexOf(headerKey);
    if (index !== -1) {
      return `sticky-col sticky-col-${index}`;
    }
    return '';
  }

  onBack(): void {
    console.log('Main Back button clicked');
  }

  onSubmit(): void {
    this.isConfirmationModalVisible = true;
  }

  handleModalConfirm(): void {
    console.log('Data submission confirmed by user!');
    this.isConfirmationModalVisible = false;
  }

  handleModalCancel(): void {
    console.log('Data submission cancelled by user.');
    this.isConfirmationModalVisible = false;
  }
}